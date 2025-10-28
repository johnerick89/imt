import { GlTransactionService } from "../gltransactions/gltransactions.services";
import { Decimal } from "@prisma/client/runtime/library";
import type {
  ITransaction,
  ITransactionCharge,
  CreateOutboundTransactionRequest,
  TransactionFilters,
  TransactionListResponse,
  TransactionResponse,
  TransactionStatsResponse,
  CancelTransactionRequest,
  ApproveTransactionRequest,
  ReverseTransactionRequest,
  TransactionChargeCalculation,
  OutboundTransactionResult,
  ITransactionChargeInItem,
  ChargeWithNegotiatedRate,
  MarkAsReadyRequest,
  UpdateTransactionRequest,
  UpdateInboundTransactionReceiverDetailsRequest,
} from "./transactions.interfaces";
import { prisma } from "../../lib/prisma.lib";
import { AppError } from "../../utils/AppError";
import {
  Charge,
  Direction,
  BalanceHistoryAction,
  Prisma,
  OrgBalance,
} from "@prisma/client";
import { UserTillService } from "../usertills/usertills.services";
import { OrgBalanceService } from "../orgbalances/orgbalances.service";
import { IUpdateOrgBalance } from "../orgbalances/orgabalances.interfaces";
import { getValidateTillParameter } from "./transactions.utils";

const glTransactionService = new GlTransactionService();
const userTillService = new UserTillService();
const orgBalanceService = new OrgBalanceService();

export class TransactionService {
  private mainOrganisationId?: string | undefined;

  // Create Outbound Transaction
  async createOutboundTransaction(
    organisationId: string,
    data: CreateOutboundTransactionRequest,
    userId: string,
    ipAddress: string
  ): Promise<OutboundTransactionResult> {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Validate that user has an open till
      const validateTill = await getValidateTillParameter();

      let userTill = await tx.userTill.findFirst({
        where: {
          user_id: userId,
          status: "OPEN",
          closed_at: null,
        },
        include: {
          till: true,
        },
      });

      if (!userTill) {
        const freeTill = await tx.till.findFirst({
          where: {
            organisation_id: organisationId,
            status: "ACTIVE",
            current_teller_user_id: null,
            currency_id: data.origin_currency_id,
          },
        });
        if (freeTill) {
          const userTillResponse = await userTillService.createUserTill({
            user_id: userId,
            till_id: freeTill?.id,
            opening_balance: freeTill?.balance?.toNumber() || 0,
            date: new Date().toISOString(),
            status: "OPEN",
          });
          userTill = userTillResponse.data as any;
        }
      }

      if (userTill) {
        data.till_id = userTill.till_id;
      }
      if (validateTill) {
        if (!userTill) {
          throw new AppError("User till not found", 400);
        }

        // 2. Validate till belongs to the organisation
        if (userTill.till.organisation_id !== organisationId) {
          throw new AppError(
            "Till does not belong to the specified organisation",
            400
          );
        }

        // 3.1. Validate till is active
        if (!userTill.till || userTill.till.status !== "ACTIVE") {
          throw new AppError(
            "Till not found or does not belong to organisation",
            400
          );
        }
      }

      // 4. Get corridor and validate it belongs to the organisation

      const corridor = await tx.corridor.findFirst({
        where: {
          id: data.corridor_id,
          origin_organisation_id: organisationId,
          destination_organisation_id: data.destination_organisation_id,
          status: "ACTIVE",
        },
      });

      if (!corridor) {
        throw new AppError("Invalid or inactive corridor", 400);
      }

      // 5. Get customer and validate it belongs to the organisation
      const [customer, beneficiary] = await Promise.all([
        await tx.customer.findFirst({
          where: {
            id: data.customer_id,
            organisation_id: organisationId,
          },
          include: {
            nationality: true,
            residence_country: true,
            incorporation_country: true,
          },
        }),
        await tx.beneficiary.findFirst({
          where: {
            id: data.beneficiary_id,
            customer_id: data.customer_id,
          },
          include: {
            nationality: true,
            residence_country: true,
            incorporation_country: true,
          },
        }),
      ]);

      if (!customer) {
        throw new AppError(
          "Customer not found or does not belong to organisation",
          400
        );
      }

      // 6. Get beneficiary and validate it belongs to the customer

      if (!beneficiary) {
        throw new AppError(
          "Beneficiary not found or does not belong to customer",
          400
        );
      }

      const chargeCalculation = await this.calculateTransactionCharges({
        originAmount: data.origin_amount,
        originCurrencyId: data.origin_currency_id,
        originOrganisationId: organisationId,
        destinationOrganisationId: data.destination_organisation_id,
        transactionCharges: data.transaction_charges,
      });

      const totalAllCharges = chargeCalculation.totalCharges;
      const totalCommissions = chargeCalculation.totalCommissions;
      const totalTaxes = chargeCalculation.totalTaxes;
      const amountPayable = data.origin_amount + totalAllCharges;

      // 7. Check organisation balance for destination organisation

      const mainOrganisation = await prisma.organisation.findFirst({
        where: {
          type: "CUSTOMER",
        },
      });
      if (mainOrganisation) {
        this.mainOrganisationId = mainOrganisation.id;
      } else {
        throw new AppError("Main organisation not found", 400);
      }

      if (
        data.destination_organisation_id &&
        organisationId &&
        data.origin_currency_id &&
        this.mainOrganisationId
      ) {
        const [originOrgBalance, destinationOrgBalance] = await Promise.all([
          tx.orgBalance.findUnique({
            where: {
              base_org_id_dest_org_id_currency_id: {
                base_org_id: this.mainOrganisationId,
                dest_org_id: organisationId,
                currency_id: data.origin_currency_id,
              },
            },
          }),
          tx.orgBalance.findUnique({
            where: {
              base_org_id_dest_org_id_currency_id: {
                base_org_id: this.mainOrganisationId,
                dest_org_id: data.destination_organisation_id,
                currency_id: data.origin_currency_id, // Or data.destination_currency_id if different
              },
            },
          }),
        ]);

        if (!originOrgBalance) {
          console.error("Origin agency must deposit float first");
          throw new AppError("Origin agency must deposit float first", 400);
        }

        if (!destinationOrgBalance) {
          console.warn(
            "Destination agency does not have a float balance, skipping balance validation"
          );
        }

        const balance = parseFloat(
          originOrgBalance?.balance?.toString() || "0"
        );
        const lockedBalance = parseFloat(
          originOrgBalance?.locked_balance?.toString() || "0"
        );
        const totalAvailableBalance = balance - lockedBalance;

        if (totalAvailableBalance < amountPayable) {
          throw new AppError(
            "Insufficient organisation balance for this transaction",
            400
          );
        }
        //destination organisation balance validation suspended for now
        /*
        const destinationLockedBalance = parseFloat(
          destinationOrgBalance.locked_balance?.toString() || "0"
        );
        const destiantionBalance = parseFloat(
          destinationOrgBalance.balance.toString()
        );

        const destinationLimit = parseFloat(
          destinationOrgBalance.limit?.toString() || "0"
        );

        const totalAvailableLimit =
          destinationLimit - destiantionBalance - destinationLockedBalance;
        const destinationAmount = data.origin_amount;

        if (totalAvailableLimit < destinationAmount) {
          throw new AppError(
            "Insufficient destination organisation limit for this transaction. Destination organisation limit is " +
              destinationOrgBalance.limit?.toString() || "0",
            400
          );
        }
        */
      } else {
        throw new AppError(
          "Origin organisation or destination organisation or origin currency not found",
          400
        );
      }

      // 8. Calculate transaction charges

      // 9. Generate transaction number
      const transactionNo = await this.generateTransactionNumber(
        organisationId
      );

      // 10. Create the transaction
      const transaction = await tx.transaction.create({
        data: {
          transaction_no: transactionNo,
          corridor_id: data.corridor_id,
          till_id: data.till_id,
          direction: "OUTBOUND",
          customer_id: data.customer_id,
          origin_amount: data.origin_amount,
          origin_channel_id: data.origin_channel_id,
          origin_currency_id: data.origin_currency_id,
          beneficiary_id: data.beneficiary_id,
          dest_amount: data.dest_amount,
          dest_channel_id: data.dest_channel_id,
          dest_currency_id: data.dest_currency_id,
          rate: data.rate,
          internal_exchange_rate: data.internal_exchange_rate,
          inflation: data.inflation,
          markup: data.markup,
          purpose: data.purpose,
          funds_source: data.funds_source,
          relationship: data.relationship,
          remarks: data.remarks,
          exchange_rate_id: data.exchange_rate_id,
          external_exchange_rate_id: data.external_exchange_rate_id,
          created_by: userId,
          origin_organisation_id: organisationId,
          destination_organisation_id: data.destination_organisation_id,
          origin_country_id: data.origin_country_id,
          destination_country_id: data.destination_country_id,
          amount_payable: amountPayable,
          status: "PENDING_APPROVAL",
          remittance_status: "PENDING",
          request_status: "UNDER_REVIEW",
          total_all_charges: totalAllCharges,
          commissions: totalCommissions,
          total_taxes: totalTaxes,
        },
      });

      // 11. Create transaction charges
      const transactionCharges = await Promise.all(
        chargeCalculation.charges.map(async (charge) => {
          const transactionCharge = await tx.transactionCharge.create({
            data: {
              transaction_id: transaction.id,
              charge_id: charge.charge_id,
              type: charge.type,
              amount: charge.amount,
              rate: charge.rate,
              is_reversible: charge.is_reversible,
              description: charge.description,
              organisation_id: organisationId,
              status: "PENDING",
              original_rate: charge.rate,
              negotiated_rate: charge.negotiated_rate,
              internal_amount: charge.internal_amount,
              internal_percentage: charge.internal_percentage,
              external_amount: charge.external_amount,
              external_percentage: charge.external_percentage,
              origin_amount: charge.origin_amount,
              origin_percentage: charge.origin_percentage,
              destination_amount: charge.destination_amount,
              destination_percentage: charge.destination_percentage,
              destination_organisation_id: data.destination_organisation_id,
            },
          });

          if (
            charge.type === "COMMISSION" &&
            this.mainOrganisationId &&
            organisationId &&
            data.destination_organisation_id
          ) {
            // Insert CommissionSplit records for internal, origin, and destination agencies
            await Promise.all([
              tx.commissionSplit.create({
                data: {
                  transaction_charges_id: transactionCharge.id,
                  organisation_id: this.mainOrganisationId,
                  transaction_id: transaction.id,
                  amount: new Decimal(charge.internal_amount || 0),
                  role: "INTERNAL",
                  notes: "Internal commission",
                  currency_id: data.origin_currency_id,
                },
              }),
              tx.commissionSplit.create({
                data: {
                  transaction_charges_id: transactionCharge.id,
                  organisation_id: organisationId,
                  transaction_id: transaction.id,
                  amount: new Decimal(charge.origin_amount || 0),
                  role: "ORIGIN",
                  notes: "Origin commission",
                  currency_id: data.origin_currency_id,
                },
              }),
              tx.commissionSplit.create({
                data: {
                  transaction_charges_id: transactionCharge.id,
                  organisation_id: data.destination_organisation_id,
                  transaction_id: transaction.id,
                  amount: new Decimal(charge.destination_amount || 0),
                  role: "DESTINATION",
                  notes: "Destination commission",
                  currency_id: data.origin_currency_id,
                },
              }),
            ]);
          }

          return transactionCharge;
        })
      );

      // 11.1. Create transaction audit
      await tx.transactionAudit.create({
        data: {
          transaction_id: transaction.id,
          action: "CREATED",
          user_id: userId,
          details: {
            old_status: "PENDING_APPROVAL",
            new_status: "PENDING",
          },
          ip_address: ipAddress,
          notes: "Transaction created",
        },
      });

      // 12. Get the created transaction with relations
      const createdTransaction = await tx.transaction.findUnique({
        where: { id: transaction.id },
        include: {
          corridor: {
            include: {
              origin_country: true,
              destination_country: true,
              base_currency: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          customer: true,
          origin_channel: true,
          origin_currency: true,
          beneficiary: true,
          dest_channel: true,
          dest_currency: true,
          exchange_rate: true,
          external_exchange_rate: true,
          created_by_user: true,
          origin_organisation: true,
          destination_organisation: true,
          transaction_charges: {
            include: {
              charge: true,
              organisation: true,
            },
          },
        },
      });

      return {
        transaction: createdTransaction as unknown as ITransaction,
        charges: transactionCharges as unknown as ITransactionCharge[],
        totalCharges: chargeCalculation.totalCharges,
        netAmount: chargeCalculation.netAmount,
      };
    });
  }

  // Cancel Transaction
  async cancelTransaction(
    transactionId: string,
    data: CancelTransactionRequest,
    userId: string,
    ipAddress: string
  ): Promise<TransactionResponse> {
    return await prisma.$transaction(async (tx) => {
      // Get transaction
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          transaction_charges: true,
        },
      });

      if (!transaction) {
        throw new AppError("Transaction not found", 400);
      }

      // Check if transaction can be cancelled
      if (!["PENDING", "PENDING_APPROVAL"].includes(transaction.status)) {
        throw new AppError(
          "Transaction cannot be cancelled in current status",
          400
        );
      }

      if (transaction.remittance_status !== "PENDING") {
        throw new AppError(
          "Transaction cannot be cancelled when remittance status is not pending",
          400
        );
      }

      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: "CANCELLED",
          remarks: data.reason
            ? `${transaction.remarks || ""}\nCancelled: ${data.reason}`.trim()
            : transaction.remarks,
          updated_at: new Date(),
        },
      });

      // Update transaction charges status
      await tx.transactionCharge.updateMany({
        where: {
          transaction_id: transactionId,
        },
        data: {
          status: "REJECTED",
          updated_at: new Date(),
        },
      });

      // 12.1. Create transaction audit
      await tx.transactionAudit.create({
        data: {
          transaction_id: transactionId,
          action: "CANCELLED",
          user_id: userId,
          details: {
            old_status: "PENDING",
            new_status: "CANCELLED",
          },
          ip_address: ipAddress,
          notes:
            "Transaction cancelled" + data.reason
              ? `${transaction.remarks || ""}\nCancelled: ${data.reason}`.trim()
              : transaction.remarks,
        },
      });

      // Get updated transaction with relations
      const result = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          corridor: {
            include: {
              origin_country: true,
              destination_country: true,
              base_currency: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          customer: true,
          origin_channel: true,
          origin_currency: true,
          beneficiary: true,
          dest_channel: true,
          dest_currency: true,
          exchange_rate: true,
          external_exchange_rate: true,
          created_by_user: true,
          origin_organisation: true,
          destination_organisation: true,
          transaction_charges: {
            include: {
              charge: true,
              organisation: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Transaction cancelled successfully",
        data: result as unknown as ITransaction,
      };
    });
  }

  // Approve Transaction
  async approveTransaction(
    transactionId: string,
    data: ApproveTransactionRequest,
    userId: string,
    ipAddress: string
  ): Promise<TransactionResponse> {
    return await prisma.$transaction(async (tx) => {
      // Get transaction with charges
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          transaction_charges: {
            include: {
              charge: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          origin_organisation: true,
          destination_organisation: true,
        },
      });

      if (!transaction) {
        throw new AppError("Transaction not found", 400);
      }

      // Check if transaction can be approved
      if (
        !["PENDING", "PENDING_APPROVAL", "READY"].includes(transaction.status)
      ) {
        throw new AppError(
          "Transaction cannot be approved in current status",
          400
        );
      }

      // Check if transaction is already approved
      if (transaction.status === "APPROVED") {
        throw new AppError("Transaction is already approved", 400);
      }

      let originBalance: OrgBalance | null = null;
      let destinationBalance: OrgBalance | null = null;
      const mainOrganisation = await prisma.organisation.findFirst({
        where: {
          type: "CUSTOMER",
        },
      });
      if (mainOrganisation) {
        this.mainOrganisationId = mainOrganisation.id;
      } else {
        throw new AppError("Main organisation not found", 400);
      }

      if (
        transaction.destination_organisation_id &&
        transaction.origin_organisation_id &&
        transaction.origin_currency_id &&
        this.mainOrganisationId
      ) {
        const [originOrgBalance, destinationOrgBalance] = await Promise.all([
          tx.orgBalance.findUnique({
            where: {
              base_org_id_dest_org_id_currency_id: {
                base_org_id: this.mainOrganisationId,
                dest_org_id: transaction.origin_organisation_id,
                currency_id: transaction.origin_currency_id,
              },
            },
          }),
          tx.orgBalance.findUnique({
            where: {
              base_org_id_dest_org_id_currency_id: {
                base_org_id: this.mainOrganisationId,
                dest_org_id: transaction.destination_organisation_id,
                currency_id: transaction.origin_currency_id, // Or data.destination_currency_id if different
              },
            },
          }),
        ]);

        if (!originOrgBalance) {
          console.error("Origin agency must deposit float first");
          throw new AppError("Origin agency must deposit float first", 400);
        }

        if (!destinationOrgBalance) {
          console.warn(
            "Destination agency does not have a float balance, skipping balance validation"
          );
        }
        originBalance = originOrgBalance;
        destinationBalance = destinationOrgBalance;

        const balance = new Decimal(originOrgBalance?.balance);
        const lockedBalance = new Decimal(
          originOrgBalance?.locked_balance || 0
        );
        const totalAvailableBalance = balance.sub(lockedBalance);

        if (
          totalAvailableBalance.lt(new Decimal(transaction.amount_payable || 0))
        ) {
          throw new AppError(
            "Insufficient organisation balance for this transaction",
            400
          );
        }
      } else {
        throw new AppError(
          "Origin organisation or destination organisation or origin currency not found",
          400
        );
      }

      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: "APPROVED",
          approved_by: userId,
          approved_at: new Date(),
          remittance_status: "TRANSIT",
          request_status: "APPROVED",
          remarks: data.remarks
            ? `${transaction.remarks || ""}\nApproved: ${data.remarks}`.trim()
            : transaction.remarks,
          updated_at: new Date(),
        },
      });

      // Update transaction charges status
      const transactionCharges = await tx.transactionCharge.updateMany({
        where: {
          transaction_id: transactionId,
        },
        data: {
          status: "APPROVED",
          updated_at: new Date(),
        },
      });

      //update org balance for outbound transaction
      if (originBalance) {
        const orgBalance = originBalance;
        const lockedBalance = new Decimal(orgBalance?.locked_balance || 0);
        const totalCharges = new Decimal(
          updatedTransaction.total_all_charges || 0
        );
        const totalTaxes = new Decimal(updatedTransaction.total_taxes || 0);
        const transactionAmount = new Decimal(
          updatedTransaction.origin_amount || 0
        )
          .add(totalCharges)
          .sub(totalTaxes);

        const newLockedBalance = lockedBalance.add(transactionAmount);

        await tx.orgBalance.update({
          where: { id: orgBalance.id },
          data: {
            locked_balance: newLockedBalance,
            updated_at: new Date(),
          },
        });

        await tx.balanceHistory.create({
          data: {
            action_type: BalanceHistoryAction.LOCK,
            entity_type: "AGENCY_FLOAT",
            entity_id: orgBalance.id,
            currency_id: updatedTransaction.origin_currency_id,
            old_balance: lockedBalance,
            new_balance: newLockedBalance,
            change_amount: -transactionAmount,
            description: `Outbound transaction approved: ${updatedTransaction.id}`,
            created_by: userId,
            organisation_id: orgBalance.base_org_id,
            float_org_id: orgBalance.base_org_id,
          },
        });
      }

      // Update till balance for outbound transaction
      if (transaction.till_id) {
        const till = await tx.till.findUnique({
          where: { id: transaction.till_id },
        });

        if (till) {
          const currentBalance = new Decimal(till.balance || 0);
          const transactionAmount = new Decimal(
            transaction.amount_payable || 0
          );
          const newBalance = currentBalance.add(transactionAmount);

          // Update till balance
          await tx.till.update({
            where: { id: transaction.till_id },
            data: {
              balance: newBalance,
              updated_at: new Date(),
            },
          });

          // Update user_tills for active sessions
          await tx.userTill.updateMany({
            where: {
              till_id: transaction.till_id,
              status: "OPEN",
              organisation_id: till.organisation_id,
              user_id: userId,
            },
            data: {
              net_transactions_total: { increment: transactionAmount },
              moving_balance: { increment: transactionAmount },
            },
          });

          // Create balance history record
          await tx.balanceHistory.create({
            data: {
              entity_type: "TILL",
              entity_id: transaction.till_id,
              currency_id: transaction.origin_currency_id,
              old_balance: currentBalance,
              new_balance: newBalance,
              change_amount: transactionAmount,
              description: `Outbound transaction approved: ${transaction.id}`,
              created_by: userId,
              organisation_id: till.organisation_id,
            },
          });
        }
      }

      // Create GL Transaction for the approved transaction
      await this.createGLTransactionForApprovedTransaction(transaction, userId);

      // If internal integration, create corresponding inbound transaction
      if (
        transaction.destination_organisation?.integration_mode === "INTERNAL"
      ) {
        await this.createInboundTransaction(transaction, userId);
      }

      // 13.1. Create transaction audit

      await tx.transactionAudit.create({
        data: {
          transaction_id: transactionId,
          action: "APPROVED",
          user_id: userId,
          details: {
            old_status: "PENDING",
            new_status: "APPROVED",
          },
          ip_address: ipAddress,
          notes:
            "Transaction approved" + data.remarks
              ? `${transaction.remarks || ""}\nApproved: ${data.remarks}`.trim()
              : transaction.remarks,
        },
      });

      // Get updated transaction with relations
      const result = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          corridor: {
            include: {
              origin_country: true,
              destination_country: true,
              base_currency: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          customer: true,
          origin_channel: true,
          origin_currency: true,
          beneficiary: true,
          dest_channel: true,
          dest_currency: true,
          exchange_rate: true,
          external_exchange_rate: true,
          created_by_user: true,
          origin_organisation: true,
          destination_organisation: true,
          transaction_charges: {
            include: {
              charge: true,
              organisation: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Transaction approved successfully",
        data: result as unknown as ITransaction,
      };
    });
  }

  // Mark Transaction as Ready
  async markAsReady(
    transactionId: string,
    data: MarkAsReadyRequest,
    userId: string,
    ipAddress: string
  ): Promise<TransactionResponse> {
    return await prisma.$transaction(async (tx) => {
      // Get transaction
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          assigned_to_user: true,
        },
      });

      if (!transaction) {
        throw new AppError("Transaction not found", 400);
      }

      // Check if transaction can be made ready
      if (
        transaction.status !== "PENDING" &&
        transaction.status !== "PENDING_APPROVAL"
      ) {
        throw new AppError(
          "Transaction can only be made ready when in PENDING or PENDING_APPROVAL status",
          400
        );
      }

      // If reassigning to a different user, validate the user
      let assignedToUserId = transaction.assigned_to;
      if (data.assigned_to && data.assigned_to !== transaction.assigned_to) {
        const newUser = await tx.user.findUnique({
          where: { id: data.assigned_to },
        });

        if (!newUser) {
          throw new AppError("Assigned user not found", 400);
        }

        // Check if user is in the same organisation
        if (newUser.organisation_id !== transaction.origin_organisation_id) {
          throw new AppError(
            "User must be in the same organisation as the transaction",
            400
          );
        }

        assignedToUserId = data.assigned_to;
      }

      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: "READY",
          remittance_status: "READY",
          assigned_to: assignedToUserId,
          remarks: data.remarks
            ? `${transaction.remarks || ""}\nMade ready: ${data.remarks}`.trim()
            : transaction.remarks,
          updated_at: new Date(),
        },
      });

      // Create transaction audit
      await tx.transactionAudit.create({
        data: {
          transaction_id: transactionId,
          action: "MADE_READY",
          user_id: userId,
          new_user_id: assignedToUserId,
          details: {
            old_status: transaction.status,
            new_status: updatedTransaction.status,
            old_remittance_status: transaction.remittance_status,
            new_remittance_status: updatedTransaction.remittance_status,
          },
          ip_address: ipAddress,
          notes: data.remarks || "Transaction marked as ready",
        },
      });

      // If reassigned, create reassignment audit
      if (data.assigned_to && data.assigned_to !== transaction.assigned_to) {
        await tx.transactionAudit.create({
          data: {
            transaction_id: transactionId,
            action: "REASSIGNED",
            user_id: userId,
            new_user_id: data.assigned_to,
            details: {
              old_assigned_to: transaction.assigned_to,
              new_assigned_to: data.assigned_to,
            },
            ip_address: ipAddress,
            notes: data.remarks || "Transaction reassigned",
          },
        });
      }

      // Get updated transaction with relations
      const result = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          corridor: {
            include: {
              origin_country: true,
              destination_country: true,
              base_currency: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          customer: true,
          origin_channel: true,
          origin_currency: true,
          beneficiary: true,
          dest_channel: true,
          dest_currency: true,
          exchange_rate: true,
          external_exchange_rate: true,
          created_by_user: true,
          assigned_to_user: true,
          origin_organisation: true,
          destination_organisation: true,
          transaction_charges: {
            include: {
              charge: true,
              organisation: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Transaction marked as ready successfully",
        data: result as unknown as ITransaction,
      };
    });
  }

  // Update Outbound Transaction (only when PENDING)
  async updateOutboundTransaction(
    transactionId: string,
    data: UpdateTransactionRequest,
    userId: string,
    ipAddress: string
  ): Promise<TransactionResponse> {
    return await prisma.$transaction(async (tx) => {
      // Get transaction with relations

      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          origin_organisation: true,
          destination_organisation: true,
          transaction_charges: {
            include: {
              charge: true,
              organisation: true,
            },
          },
        },
      });

      if (!transaction) {
        throw new AppError("Transaction not found", 400);
      }

      // Check if transaction can be updated
      if (
        transaction.status !== "PENDING" &&
        transaction.status !== "PENDING_APPROVAL"
      ) {
        throw new AppError(
          "Transaction can only be updated when in PENDING or PENDING_APPROVAL status",
          400
        );
      }

      // Get main organisation
      const mainOrganisation = await prisma.organisation.findFirst({
        where: {
          type: "CUSTOMER",
        },
      });
      if (mainOrganisation) {
        this.mainOrganisationId = mainOrganisation.id;
      } else {
        throw new AppError("Main organisation not found", 400);
      }

      // Calculate new charges if transaction charges are provided
      let chargeCalculation = null;
      let totalAllCharges = transaction.total_all_charges || 0;
      let totalCommissions = transaction.commissions || 0;
      let totalTaxes = transaction.total_taxes || 0;
      let amountPayable = transaction.amount_payable || 0;

      if (data.transaction_charges && data.transaction_charges.length > 0) {
        chargeCalculation = await this.calculateTransactionCharges({
          originAmount: data.origin_amount || Number(transaction.origin_amount),
          originCurrencyId:
            data.origin_currency_id || transaction.origin_currency_id || "",
          originOrganisationId: transaction.origin_organisation_id || "",
          destinationOrganisationId:
            data.destination_organisation_id ||
            transaction.destination_organisation_id ||
            undefined,
          transactionCharges: data.transaction_charges,
        });

        totalAllCharges = Number(chargeCalculation.totalCharges);
        totalCommissions = Number(chargeCalculation.totalCommissions);
        totalTaxes = Number(chargeCalculation.totalTaxes);
        amountPayable =
          Number(data.origin_amount || transaction.origin_amount) +
          totalAllCharges;
      }

      // Validate organisation balance if amount changed
      if (
        data.origin_amount &&
        Number(data.origin_amount) !== Number(transaction.origin_amount)
      ) {
        if (
          data.destination_organisation_id &&
          transaction.origin_organisation_id &&
          data.origin_currency_id &&
          this.mainOrganisationId
        ) {
          const originOrgBalance = await tx.orgBalance.findUnique({
            where: {
              base_org_id_dest_org_id_currency_id: {
                base_org_id: this.mainOrganisationId,
                dest_org_id: transaction.origin_organisation_id,
                currency_id: data.origin_currency_id,
              },
            },
          });

          if (!originOrgBalance) {
            throw new AppError("Origin agency must deposit float first", 400);
          }

          const balance = parseFloat(
            originOrgBalance?.balance?.toString() || "0"
          );
          const lockedBalance = parseFloat(
            originOrgBalance?.locked_balance?.toString() || "0"
          );
          const totalAvailableBalance = balance - lockedBalance;

          if (totalAvailableBalance < Number(amountPayable)) {
            throw new AppError(
              "Insufficient organisation balance for this transaction",
              400
            );
          }
        }
      }

      // Update transaction (exclude transaction_charges from data as it's not a direct field)
      const { transaction_charges, ...updateData } = data;
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          ...updateData,
          total_all_charges: new Decimal(totalAllCharges),
          commissions: new Decimal(totalCommissions),
          total_taxes: new Decimal(totalTaxes),
          amount_payable: new Decimal(amountPayable),
          updated_at: new Date(),
        },
      });

      // Update transaction charges if provided
      if (chargeCalculation && chargeCalculation.charges.length > 0) {
        // Delete existing transaction charges
        await tx.transactionCharge.deleteMany({
          where: { transaction_id: transactionId },
        });

        // Delete existing commission splits
        await tx.commissionSplit.deleteMany({
          where: { transaction_id: transactionId },
        });

        // Create new transaction charges
        const transactionCharges = await Promise.all(
          chargeCalculation.charges.map(async (charge) => {
            const transactionCharge = await tx.transactionCharge.create({
              data: {
                transaction_id: transactionId,
                charge_id: charge.charge_id,
                type: charge.type,
                amount: charge.amount,
                rate: charge.negotiated_rate,
                is_reversible: charge.is_reversible,
                description: charge.description,
                organisation_id: transaction.origin_organisation_id || "",
                status: "PENDING",
                original_rate: charge.rate,
                negotiated_rate: charge.negotiated_rate,
                internal_amount: charge.internal_amount,
                internal_percentage: charge.internal_percentage,
                external_amount: charge.external_amount,
                external_percentage: charge.external_percentage,
                origin_amount: charge.origin_amount,
                origin_percentage: charge.origin_percentage,
                destination_amount: charge.destination_amount,
                destination_percentage: charge.destination_percentage,
                destination_organisation_id:
                  data.destination_organisation_id ||
                  transaction.destination_organisation_id ||
                  undefined,
              },
            });

            // Create commission splits for commission charges
            if (
              charge.type === "COMMISSION" &&
              this.mainOrganisationId &&
              transaction.origin_organisation_id &&
              (data.destination_organisation_id ||
                transaction.destination_organisation_id)
            ) {
              const destinationOrgId =
                data.destination_organisation_id ||
                transaction.destination_organisation_id;
              if (!destinationOrgId) {
                throw new AppError(
                  "Destination organisation is required for commission charges",
                  400
                );
              }
              await Promise.all([
                tx.commissionSplit.create({
                  data: {
                    transaction_charges_id: transactionCharge.id,
                    organisation_id: this.mainOrganisationId,
                    transaction_id: transactionId,
                    amount: new Decimal(charge.internal_amount || 0),
                    role: "INTERNAL",
                    notes: "Internal commission",
                    currency_id:
                      data.origin_currency_id || transaction.origin_currency_id,
                  },
                }),
                tx.commissionSplit.create({
                  data: {
                    transaction_charges_id: transactionCharge.id,
                    organisation_id: transaction.origin_organisation_id,
                    transaction_id: transactionId,
                    amount: new Decimal(charge.origin_amount || 0),
                    role: "ORIGIN",
                    notes: "Origin commission",
                    currency_id:
                      data.origin_currency_id || transaction.origin_currency_id,
                  },
                }),
                tx.commissionSplit.create({
                  data: {
                    transaction_charges_id: transactionCharge.id,
                    organisation_id: destinationOrgId,
                    transaction_id: transactionId,
                    amount: new Decimal(charge.destination_amount || 0),
                    role: "DESTINATION",
                    notes: "Destination commission",
                    currency_id:
                      data.origin_currency_id || transaction.origin_currency_id,
                  },
                }),
              ]);
            }

            return transactionCharge;
          })
        );
      }

      // Create transaction audit
      await tx.transactionAudit.create({
        data: {
          transaction_id: transactionId,
          action: "UPDATED",
          user_id: userId,
          details: {
            updated_fields: Object.keys(data),
            old_values: { ...transaction },
            new_values: { ...data },
            charges_updated: chargeCalculation ? true : false,
          } as unknown as any,
          ip_address: ipAddress,
          notes: "Transaction updated with charges recalculation",
        },
      });

      // Get updated transaction with relations
      const result = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          corridor: {
            include: {
              origin_country: true,
              destination_country: true,
              base_currency: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          customer: true,
          origin_channel: true,
          origin_currency: true,
          beneficiary: true,
          dest_channel: true,
          dest_currency: true,
          exchange_rate: true,
          external_exchange_rate: true,
          created_by_user: true,
          assigned_to_user: true,
          origin_organisation: true,
          destination_organisation: true,
          transaction_charges: {
            include: {
              charge: true,
              organisation: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Transaction updated successfully",
        data: result as unknown as ITransaction,
      };
    });
  }

  // Reverse Transaction
  async reverseTransaction(
    transactionId: string,
    data: ReverseTransactionRequest,
    userId: string,
    ipAddress: string
  ): Promise<TransactionResponse> {
    return await prisma.$transaction(async (tx: any) => {
      const mainOrganisation = await tx.organisation.findFirst({
        where: {
          type: "CUSTOMER",
        },
      });
      if (mainOrganisation) {
        this.mainOrganisationId = mainOrganisation.id;
      } else {
        throw new AppError("Main organisation not found", 400);
      }
      // Get transaction with charges
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          transaction_charges: {
            include: {
              charge: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          origin_organisation: true,
          destination_organisation: true,
        },
      });

      if (!transaction) {
        throw new AppError("Transaction not found", 400);
      }

      // Check if transaction can be reversed
      if (transaction.status !== "APPROVED") {
        throw new AppError("Only approved transactions can be reversed", 400);
      }

      if (transaction.remittance_status !== "PENDING") {
        throw new AppError(
          "Transaction cannot be reversed when remittance status is not pending",
          400
        );
      }

      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: "REVERSED",
          remarks: `${transaction.remarks || ""}\nReversed: ${data.reason}${
            data.remarks ? ` - ${data.remarks}` : ""
          }`.trim(),
          updated_at: new Date(),
        },
      });

      // Reverse transaction charges (only reversible ones)
      await tx.transactionCharge.updateMany({
        where: {
          transaction_id: transactionId,
          is_reversible: true,
        },
        data: {
          status: "REVERSED",
          updated_at: new Date(),
        },
      });

      if (
        updatedTransaction.destination_organisation_id &&
        updatedTransaction.origin_currency_id &&
        updatedTransaction.origin_organisation_id
      ) {
        let orgBalance = await tx.orgBalance.findFirst({
          where: {
            base_org_id: this.mainOrganisationId,
            dest_org_id: updatedTransaction.destination_organisation_id,
            currency_id: updatedTransaction.origin_currency_id,
          },
        });

        if (!orgBalance) {
          orgBalance = await tx.orgBalance.create({
            data: {
              base_org_id: this.mainOrganisationId,
              dest_org_id: updatedTransaction.destination_organisation_id,
              currency_id: updatedTransaction.origin_currency_id,
              balance: 0,
              locked_balance: 0,
            },
          });
        }

        const oldBalance = new Decimal(orgBalance?.balance || 0);
        const lockedBalance = new Decimal(orgBalance?.locked_balance || 0);
        const totalCharges = new Decimal(
          updatedTransaction.total_all_charges || 0
        );
        const totalTaxes = new Decimal(updatedTransaction.total_taxes || 0);
        const transactionAmount = new Decimal(
          updatedTransaction.origin_amount || 0
        )
          .add(totalCharges)
          .sub(totalTaxes);

        const newBalance = oldBalance.sub(transactionAmount);
        const newLockedBalance = lockedBalance.sub(transactionAmount);

        await tx.orgBalance.update({
          where: { id: orgBalance.id },
          data: {
            locked_balance: newLockedBalance,
            updated_at: new Date(),
          },
        });

        await tx.balanceHistory.create({
          data: {
            action_type: BalanceHistoryAction.UNLOCK,
            entity_type: "AGENCY_FLOAT",
            entity_id: orgBalance.id,
            currency_id: updatedTransaction.origin_currency_id,
            old_balance: lockedBalance,
            new_balance: newLockedBalance,
            change_amount: transactionAmount,
            description: `Outbound transaction reversed: ${updatedTransaction.id}`,
            created_by: userId,
            organisation_id: orgBalance.base_org_id,
            float_org_id: orgBalance.base_org_id,
          },
        });
      }

      // Reverse till balance for outbound transaction
      if (transaction.till_id) {
        const till = await tx.till.findUnique({
          where: { id: transaction.till_id },
        });

        if (till) {
          const currentBalance = new Decimal(till.balance || 0);
          const transactionAmount = new Decimal(transaction.origin_amount || 0);
          const newBalance = currentBalance.add(transactionAmount);

          // Update till balance
          await tx.till.update({
            where: { id: transaction.till_id },
            data: {
              balance: newBalance,
              updated_at: new Date(),
            },
          });

          // Update user_tills for active sessions
          await tx.userTill.updateMany({
            where: {
              till_id: transaction.till_id,
              status: "OPEN",
              organisation_id: till.organisation_id,
            },
            data: {
              net_transactions_total: { increment: transactionAmount },
            },
          });

          // Create balance history record
          await tx.balanceHistory.create({
            data: {
              entity_type: "TILL",
              entity_id: transaction.till_id,
              currency_id: transaction.origin_currency_id,
              old_balance: currentBalance,
              new_balance: newBalance,
              change_amount: transactionAmount,
              description: `Outbound transaction reversed: ${transaction.id} - ${data.reason}`,
              created_by: userId,
              organisation_id: till.organisation_id,
            },
          });
        }
      }

      // Create reverse GL Transaction
      await this.createReverseGLTransactionForTransaction(
        transaction,
        data.reason,
        userId
      );

      // 14.1. Create transaction audit

      await tx.transactionAudit.create({
        data: {
          transaction_id: transactionId,
          action: "REVERSED",
          user_id: userId,
          details: {
            old_status: "APPROVED",
            new_status: "REVERSED",
          },
          ip_address: ipAddress,
          notes:
            "Transaction reversed" + data.reason
              ? `${transaction.remarks || ""}\nReversed: ${data.reason}`.trim()
              : transaction.remarks,
        },
      });

      // Get updated transaction with relations
      const result = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          corridor: {
            include: {
              origin_country: true,
              destination_country: true,
              base_currency: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          customer: true,
          origin_channel: true,
          origin_currency: true,
          beneficiary: true,
          dest_channel: true,
          dest_currency: true,
          exchange_rate: true,
          external_exchange_rate: true,
          created_by_user: true,
          origin_organisation: true,
          destination_organisation: true,
          transaction_charges: {
            include: {
              charge: true,
              organisation: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Transaction reversed successfully",
        data: result as unknown as ITransaction,
      };
    });
  }

  // Get Transactions
  async getTransactions(
    organisationId: string,
    filters: TransactionFilters
  ): Promise<TransactionListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      direction,
      status,
      remittance_status,
      request_status,
      corridor_id,
      till_id,
      customer_id,
      origin_currency_id,
      dest_currency_id,
      origin_organisation_id,
      destination_organisation_id,
      created_by,
      date_from,
      date_to,
      amount_min,
      amount_max,
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {
      OR: [
        { origin_organisation_id: organisationId },
        { destination_organisation_id: organisationId },
      ],
    };

    if (search) {
      where.OR = [
        { transaction_no: { contains: search, mode: "insensitive" } },
        {
          customer: { first_name: { contains: search, mode: "insensitive" } },
        },
        {
          customer: { last_name: { contains: search, mode: "insensitive" } },
        },
        { beneficiary: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (direction) where.direction = direction;
    if (status) where.status = status;
    if (remittance_status) where.remittance_status = remittance_status;
    if (request_status) where.request_status = request_status;
    if (corridor_id) where.corridor_id = corridor_id;
    if (till_id) where.till_id = till_id;
    if (customer_id) where.customer_id = customer_id;
    if (origin_currency_id) where.origin_currency_id = origin_currency_id;
    if (dest_currency_id) where.dest_currency_id = dest_currency_id;
    if (origin_organisation_id)
      where.origin_organisation_id = origin_organisation_id;
    if (destination_organisation_id)
      where.destination_organisation_id = destination_organisation_id;
    if (created_by) where.created_by = created_by;

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (amount_min || amount_max) {
      where.origin_amount = {};
      if (amount_min) where.origin_amount.gte = amount_min;
      if (amount_max) where.origin_amount.lte = amount_max;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          corridor: {
            include: {
              origin_country: true,
              destination_country: true,
              base_currency: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          customer: true,
          origin_channel: true,
          origin_currency: true,
          beneficiary: true,
          dest_channel: true,
          dest_currency: true,
          exchange_rate: true,
          external_exchange_rate: true,
          created_by_user: true,
          origin_organisation: true,
          destination_organisation: true,
          transaction_charges: {
            include: {
              charge: true,
              organisation: true,
            },
          },
          transaction_audits: {
            include: {
              user: true,
              new_user: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Transactions retrieved successfully",
      data: {
        transactions: transactions.map((transaction) => ({
          ...transaction,
          origin_amount: parseFloat(transaction.origin_amount.toString()),
          dest_amount: parseFloat(transaction.dest_amount.toString()),
          rate: parseFloat(transaction.rate.toString()),
          internal_exchange_rate: transaction.internal_exchange_rate
            ? parseFloat(transaction.internal_exchange_rate.toString())
            : null,
          inflation: transaction.inflation
            ? parseFloat(transaction.inflation.toString())
            : null,
          markup: transaction.markup
            ? parseFloat(transaction.markup.toString())
            : null,
          amount_payable: transaction.amount_payable
            ? parseFloat(transaction.amount_payable.toString())
            : null,
          amount_receivable: transaction.amount_receivable
            ? parseFloat(transaction.amount_receivable.toString())
            : null,
          created_at: transaction.created_at?.toISOString() || null,
          updated_at: transaction.updated_at?.toISOString() || null,
          deleted_at: transaction.deleted_at?.toISOString() || null,
          received_at: transaction.received_at?.toISOString() || null,
          remitted_at: transaction.remitted_at?.toISOString() || null,
          transaction_charges: transaction.transaction_charges.map(
            (charge) => ({
              ...charge,
              amount: parseFloat(charge.amount.toString()),
              rate: charge.rate ? parseFloat(charge.rate.toString()) : null,
              created_at: charge.created_at.toISOString(),
              updated_at: charge.updated_at.toISOString(),
            })
          ),
        })) as unknown as ITransaction[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  }

  // Get Customer Outbound Transactions (all outbound transactions for customer organizations)
  async getCustomerOutboundTransactions(
    filters: TransactionFilters
  ): Promise<TransactionListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      remittance_status,
      request_status,
      corridor_id,
      till_id,
      customer_id,
      origin_currency_id,
      dest_currency_id,
      origin_organisation_id,
      destination_organisation_id,
      created_by,
      date_from,
      date_to,
      amount_min,
      amount_max,
      direction,
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {
      direction: direction,
    };

    if (search) {
      where.OR = [
        { transaction_no: { contains: search, mode: "insensitive" } },
        {
          customer: { first_name: { contains: search, mode: "insensitive" } },
        },
        {
          customer: { last_name: { contains: search, mode: "insensitive" } },
        },
        { beneficiary: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) where.status = status;
    if (remittance_status) where.remittance_status = remittance_status;
    if (request_status) where.request_status = request_status;
    if (corridor_id) where.corridor_id = corridor_id;
    if (till_id) where.till_id = till_id;
    if (customer_id) where.customer_id = customer_id;
    if (origin_currency_id) where.origin_currency_id = origin_currency_id;
    if (dest_currency_id) where.dest_currency_id = dest_currency_id;
    if (origin_organisation_id)
      where.origin_organisation_id = origin_organisation_id;
    if (destination_organisation_id)
      where.destination_organisation_id = destination_organisation_id;
    if (created_by) where.created_by = created_by;

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (amount_min || amount_max) {
      where.origin_amount = {};
      if (amount_min) where.origin_amount.gte = amount_min;
      if (amount_max) where.origin_amount.lte = amount_max;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          corridor: {
            include: {
              origin_country: true,
              destination_country: true,
              base_currency: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          customer: true,
          origin_channel: true,
          origin_currency: true,
          beneficiary: true,
          dest_channel: true,
          dest_currency: true,
          exchange_rate: true,
          external_exchange_rate: true,
          created_by_user: true,
          origin_organisation: true,
          destination_organisation: true,
          transaction_charges: {
            include: {
              charge: true,
              organisation: true,
            },
          },
          transaction_audits: {
            include: {
              user: true,
              new_user: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Customer outbound transactions retrieved successfully",
      data: {
        transactions: transactions.map((transaction) => ({
          ...transaction,
          origin_amount: parseFloat(transaction.origin_amount.toString()),
          dest_amount: parseFloat(transaction.dest_amount.toString()),
          rate: parseFloat(transaction.rate.toString()),
          internal_exchange_rate: transaction.internal_exchange_rate
            ? parseFloat(transaction.internal_exchange_rate.toString())
            : null,
          inflation: transaction.inflation
            ? parseFloat(transaction.inflation.toString())
            : null,
          markup: transaction.markup
            ? parseFloat(transaction.markup.toString())
            : null,
          amount_payable: transaction.amount_payable
            ? parseFloat(transaction.amount_payable.toString())
            : null,
          amount_receivable: transaction.amount_receivable
            ? parseFloat(transaction.amount_receivable.toString())
            : null,
          created_at: transaction.created_at?.toISOString() || null,
          updated_at: transaction.updated_at?.toISOString() || null,
          deleted_at: transaction.deleted_at?.toISOString() || null,
          received_at: transaction.received_at?.toISOString() || null,
          remitted_at: transaction.remitted_at?.toISOString() || null,
          transaction_charges: transaction.transaction_charges.map(
            (charge) => ({
              ...charge,
              amount: parseFloat(charge.amount.toString()),
              rate: charge.rate ? parseFloat(charge.rate.toString()) : null,
              created_at: charge.created_at.toISOString(),
              updated_at: charge.updated_at.toISOString(),
            })
          ),
        })) as unknown as ITransaction[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  }

  // Get Transaction by ID
  async getTransactionById(
    transactionId: string
  ): Promise<TransactionResponse> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        corridor: {
          include: {
            origin_country: true,
            destination_country: true,
            base_currency: true,
          },
        },
        till: {
          include: {
            organisation: true,
          },
        },
        customer: true,
        origin_channel: true,
        origin_currency: true,
        beneficiary: true,
        dest_channel: true,
        dest_currency: true,
        exchange_rate: true,
        external_exchange_rate: true,
        created_by_user: true,
        origin_organisation: true,
        destination_organisation: true,
        transaction_charges: {
          include: {
            charge: true,
            organisation: true,
          },
        },
        transaction_audits: {
          include: {
            user: true,
            new_user: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError("Transaction not found", 400);
    }

    return {
      success: true,
      message: "Transaction retrieved successfully",
      data: {
        ...transaction,
        origin_amount: parseFloat(transaction.origin_amount.toString()),
        dest_amount: parseFloat(transaction.dest_amount.toString()),
        rate: parseFloat(transaction.rate.toString()),
        internal_exchange_rate: transaction.internal_exchange_rate
          ? parseFloat(transaction.internal_exchange_rate.toString())
          : null,
        inflation: transaction.inflation
          ? parseFloat(transaction.inflation.toString())
          : null,
        markup: transaction.markup
          ? parseFloat(transaction.markup.toString())
          : null,
        amount_payable: transaction.amount_payable
          ? parseFloat(transaction.amount_payable.toString())
          : null,
        amount_receivable: transaction.amount_receivable
          ? parseFloat(transaction.amount_receivable.toString())
          : null,
        created_at: transaction.created_at?.toISOString() || null,
        updated_at: transaction.updated_at?.toISOString() || null,
        deleted_at: transaction.deleted_at?.toISOString() || null,
        received_at: transaction.received_at?.toISOString() || null,
        remitted_at: transaction.remitted_at?.toISOString() || null,
        transaction_charges: transaction.transaction_charges.map((charge) => ({
          ...charge,
          amount: parseFloat(charge.amount.toString()),
          rate: charge.rate ? parseFloat(charge.rate.toString()) : null,
          created_at: charge.created_at.toISOString(),
          updated_at: charge.updated_at.toISOString(),
        })),
      } as unknown as ITransaction,
    };
  }

  // Get Transaction Stats
  async getTransactionStats(
    organisationId: string
  ): Promise<TransactionStatsResponse> {
    return await prisma.$transaction(async (tx) => {
      const organisation = await tx.organisation.findUnique({
        where: { id: organisationId },
        select: { type: true },
      });

      if (!organisation) {
        throw new AppError("Organisation not found", 400);
      }

      const where = {
        ...(organisation.type !== "CUSTOMER"
          ? { origin_organisation_id: organisationId }
          : {}),
        direction: "OUTBOUND" as Direction,
      };

      const [
        totalCount,
        amountData,
        statusData,
        directionData,
        currencyData,
        orgData,
      ] = await Promise.all([
        tx.transaction.count({ where }),
        tx.transaction.aggregate({
          where,
          _sum: {
            origin_amount: true,
          },
        }),
        tx.transaction.groupBy({
          by: ["status"],
          where,
          _count: { id: true },
          _sum: { origin_amount: true },
        }),
        tx.transaction.groupBy({
          by: ["direction"],
          where,
          _count: { id: true },
          _sum: { origin_amount: true },
        }),
        tx.transaction.groupBy({
          by: ["origin_currency_id"],
          where,
          _count: { id: true },
          _sum: { origin_amount: true },
        }),
        tx.transaction.groupBy({
          by: ["origin_organisation_id"],
          where,
          _count: { id: true },
          _sum: { origin_amount: true },
        }),
      ]);

      const currencyStats = await Promise.all(
        currencyData.map(async (item) => {
          const currency = await tx.currency.findUnique({
            where: { id: item.origin_currency_id },
            select: { currency_code: true },
          });

          return {
            currency_id: item.origin_currency_id,
            currency_code: currency?.currency_code || "Unknown",
            count: item._count?.id || 0,
            amount: item._sum?.origin_amount
              ? parseFloat(item._sum.origin_amount.toString())
              : 0,
          };
        })
      );

      const orgStats = await Promise.all(
        orgData.map(async (item) => {
          const org = await tx.organisation.findUnique({
            where: { id: item.origin_organisation_id! },
            select: { name: true },
          });

          return {
            organisation_id: item.origin_organisation_id || "",
            organisation_name: org?.name || "Unknown",
            count: item._count?.id || 0,
            amount: item._sum?.origin_amount
              ? parseFloat(item._sum.origin_amount.toString())
              : 0,
          };
        })
      );

      return {
        success: true,
        message: "Transaction stats retrieved successfully",
        data: {
          totalTransactions: totalCount,
          totalAmount: amountData._sum?.origin_amount
            ? parseFloat(amountData._sum.origin_amount.toString())
            : 0,
          byStatus: statusData.map((item) => ({
            status: item.status,
            count: item._count?.id || 0,
            amount: item._sum?.origin_amount
              ? parseFloat(item._sum.origin_amount.toString())
              : 0,
          })),
          byDirection: directionData.map((item) => ({
            direction: item.direction,
            count: item._count?.id || 0,
            amount: item._sum?.origin_amount
              ? parseFloat(item._sum.origin_amount.toString())
              : 0,
          })),
          byCurrency: currencyStats,
          byOrganisation: orgStats as unknown as {
            organisation_id: string;
            organisation_name: string;
            count: number;
            amount: number;
          }[],
        },
      };
    });
  }

  // Helper Methods

  // Calculate Transaction Charges
  private async calculateTransactionCharges({
    originAmount,
    originCurrencyId,
    originOrganisationId,
    destinationOrganisationId,
    transactionCharges,
  }: {
    originAmount: number;
    originCurrencyId: string;
    originOrganisationId: string;
    destinationOrganisationId?: string;
    transactionCharges?: ITransactionChargeInItem[];
  }): Promise<TransactionChargeCalculation> {
    // Get applicable charges

    const charges: Charge[] = await prisma.charge.findMany({
      where: {
        status: "ACTIVE",
        direction: { in: ["OUTBOUND", "BOTH"] },
        currency_id: originCurrencyId,
        origin_organisation_id: originOrganisationId,
        OR: [
          { destination_organisation_id: destinationOrganisationId },
          { destination_organisation_id: null }, // Global charges
        ],
      },
      orderBy: [
        { type: "asc" }, // Sort by type ascending: Non-TAX first, TAX last
      ],
    });

    let chargesWithNegotiatedRates: ChargeWithNegotiatedRate[] = charges.map(
      (charge) => {
        const negotiatedRate = transactionCharges?.find(
          (tc) => tc.charge_id === charge.id
        )?.negotiated_rate;
        return {
          ...charge,
          negotiated_rate: negotiatedRate || null,
        } as ChargeWithNegotiatedRate;
      }
    );

    const calculatedCharges = [];
    let nonTaxChargesTotal = 0;
    let totalCharges = 0;

    // Process charges in two passes: non-TAX first, then TAX
    const nonTaxCharges = chargesWithNegotiatedRates.filter(
      (charge) => charge.type !== "TAX"
    );
    const taxCharges = chargesWithNegotiatedRates.filter(
      (charge) => charge.type === "TAX"
    );

    for (const charge of nonTaxCharges) {
      let amount = 0;

      if (charge.application_method === "PERCENTAGE") {
        const rate =
          charge.negotiated_rate !== null &&
          charge.negotiated_rate !== undefined
            ? charge.negotiated_rate
            : charge.rate;
        amount = (originAmount * rate) / 100;
      } else {
        amount =
          charge.negotiated_rate !== null &&
          charge.negotiated_rate !== undefined
            ? charge.negotiated_rate
            : charge.rate;
      }

      // Apply min/max limits
      if (charge.min_amount && amount < charge.min_amount) {
        amount = charge.min_amount;
      }
      if (charge.max_amount && amount > charge.max_amount) {
        amount = charge.max_amount;
      }

      const internalAmount = charge.internal_share_percentage
        ? (amount * charge.internal_share_percentage) / 100
        : null;
      const originChargeAmount = charge.origin_share_percentage
        ? (amount * charge.origin_share_percentage) / 100
        : null;
      const destinationChargeAmount = charge.destination_share_percentage
        ? (amount * charge.destination_share_percentage) / 100
        : null;

      calculatedCharges.push({
        charge_id: charge.id,
        type: charge.type,
        amount,
        rate: charge.rate,
        negotiated_rate: charge.negotiated_rate,
        description: `${charge.name}: ${charge.description}`,
        is_reversible: charge.is_reversible,
        internal_amount: internalAmount,
        internal_percentage: charge.internal_share_percentage
          ? charge.internal_share_percentage
          : null,
        origin_amount: originChargeAmount,
        origin_percentage: charge.origin_share_percentage
          ? charge.origin_share_percentage
          : null,
        destination_amount: destinationChargeAmount,
        destination_percentage: charge.destination_share_percentage
          ? charge.destination_share_percentage
          : null,
        external_percentage: charge.destination_share_percentage
          ? charge.destination_share_percentage
          : null,
      });

      nonTaxChargesTotal += amount;
    }

    // Calculate TAX charges based on nonTaxChargesTotal
    for (const charge of taxCharges) {
      let amount = 0;

      if (charge.application_method === "PERCENTAGE") {
        const rate =
          charge.negotiated_rate !== null &&
          charge.negotiated_rate !== undefined
            ? charge.negotiated_rate
            : charge.rate;
        amount = (nonTaxChargesTotal * rate) / 100; // Tax on non-tax total
      } else {
        amount =
          charge.negotiated_rate !== null &&
          charge.negotiated_rate !== undefined
            ? charge.negotiated_rate
            : charge.rate;
      }

      // Apply min/max limits
      if (charge.min_amount && amount < charge.min_amount) {
        amount = charge.min_amount;
      }
      if (charge.max_amount && amount > charge.max_amount) {
        amount = charge.max_amount;
      }

      const internalAmount = charge.internal_share_percentage
        ? (amount * charge.internal_share_percentage) / 100
        : null;
      const originChargeAmount = charge.origin_share_percentage
        ? (amount * charge.origin_share_percentage) / 100
        : null;
      const destinationChargeAmount = charge.destination_share_percentage
        ? (amount * charge.destination_share_percentage) / 100
        : null;

      calculatedCharges.push({
        charge_id: charge.id,
        type: charge.type,
        amount,
        rate: charge.rate,
        negotiated_rate: charge.negotiated_rate,
        description: `${charge.name}: ${charge.description}`,
        is_reversible: charge.is_reversible,
        internal_amount: internalAmount,
        internal_percentage: charge.internal_share_percentage
          ? charge.internal_share_percentage
          : null,
        origin_amount: originChargeAmount,
        origin_percentage: charge.origin_share_percentage
          ? charge.origin_share_percentage
          : null,
        destination_amount: destinationChargeAmount,
        destination_percentage: charge.destination_share_percentage
          ? charge.destination_share_percentage
          : null,
        external_percentage: charge.destination_share_percentage
          ? charge.destination_share_percentage
          : null,
      });

      totalCharges += amount;
    }
    totalCharges += nonTaxChargesTotal;

    return {
      totalCharges,
      totalCommissions: nonTaxChargesTotal,
      totalTaxes: totalCharges - nonTaxChargesTotal,
      netAmount: originAmount + totalCharges,
      charges: calculatedCharges as TransactionChargeCalculation["charges"],
    };
  }

  // Generate Transaction Number
  private async generateTransactionNumber(
    organisationId: string
  ): Promise<string> {
    const org = await prisma.organisation.findUnique({
      where: { id: organisationId },
      select: { name: true },
    });

    const orgCode = org?.name.substring(0, 3).toUpperCase() || "ORG";
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    // Get count of transactions for today
    const startOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
    const endOfDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1
    );

    const count = await prisma.transaction.count({
      where: {
        origin_organisation_id: organisationId,
        created_at: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const sequence = String(count + 1).padStart(4, "0");
    return `${orgCode}${year}${month}${day}${sequence}`;
  }

  // Create GL Transaction for Approved Transaction
  private async createGLTransactionForApprovedTransaction(
    transaction: any,
    userId: string
  ): Promise<void> {
    const organisationId = transaction.origin_organisation_id;
    const [mainOrganisation, organisation] = await Promise.all([
      prisma.organisation.findFirst({
        where: {
          type: "CUSTOMER",
        },
      }),
      prisma.organisation.findUnique({
        where: { id: organisationId },
      }),
    ]);
    if (mainOrganisation) {
      this.mainOrganisationId = mainOrganisation.id;
    } else {
      throw new AppError("Main organisation not found", 400);
    }

    if (!organisation) {
      throw new AppError("Organisation not found", 400);
    }
    const floatPayableName = `Float Transit Payable - ${organisation.name}`;
    const [floatPayableAccount, orgBalance, tillGlAccountId] =
      await Promise.all([
        prisma.glAccount.findFirst({
          where: {
            organisation_id: organisationId,
            type: "LIABILITY",
            name: {
              contains: floatPayableName,
            },
          },
        }),
        prisma.orgBalance.findFirst({
          where: {
            base_org_id: this.mainOrganisationId,
            dest_org_id: transaction.destination_organisation_id,
          },
          include: {
            gl_accounts: true,
          },
        }),
        glTransactionService.getGlAccountForEntity(
          "TILL",
          transaction.till_id,
          organisationId
        ),
      ]);

    const accountsReceivableGlAccountId = orgBalance?.gl_accounts[0]?.id;
    const floatPayableGlAccountId = floatPayableAccount?.id;

    // Get charge GL accounts
    const chargeGlAccounts = await Promise.all(
      transaction.transaction_charges.map(async (charge: any) => {
        const glAccountId = await glTransactionService.getGlAccountForEntity(
          "CHARGE",
          charge.charge_id,
          organisationId
        );
        return { ...charge, gl_account_id: glAccountId };
      })
    );

    if (tillGlAccountId && floatPayableGlAccountId) {
      const glEntries = [
        {
          gl_account_id: tillGlAccountId,
          amount: transaction.amount_payable,
          dr_cr: "DR" as const,
          description: `Till cash increased by ${transaction.amount_payable}`,
        },
        {
          gl_account_id: floatPayableGlAccountId,
          amount: transaction.origin_amount,
          dr_cr: "CR" as const,
          description: `Parner/agency float payable decreased by ${transaction.origin_amount}`,
        },
      ];

      // Add charge entries
      chargeGlAccounts.forEach((charge) => {
        if (charge.gl_account_id) {
          glEntries.push({
            gl_account_id: charge.gl_account_id,
            amount: charge.amount,
            dr_cr: "CR" as const,
            description: `${charge.charge.name} revenue: ${charge.amount}`,
          });
        }
      });

      const glTransactionResponse =
        await glTransactionService.createGlTransaction(
          organisationId,
          {
            transaction_type: "OUTBOUND_TRANSACTION",
            amount: transaction.amount_payable,
            currency_id: transaction.origin_currency_id,
            description: `Outbound transaction: ${transaction.transaction_no}`,
            till_id: transaction.till_id,
            customer_id: transaction.customer_id,
            transaction_id: transaction.id,
            gl_entries: glEntries.map((entry) => ({
              gl_account_id: entry.gl_account_id,
              amount: Number(entry.amount),
              dr_cr: entry.dr_cr,
              description: entry.description,
            })),
          },
          userId
        );
    }
  }

  // Create Reverse GL Transaction for Transaction
  private async createReverseGLTransactionForTransaction(
    transaction: any,
    reason: string,
    userId: string
  ): Promise<void> {
    const organisationId = transaction.origin_organisation_id;

    // Get GL accounts
    const tillGlAccountId = await glTransactionService.getGlAccountForEntity(
      "TILL",
      transaction.till_id,
      organisationId
    );

    const orgBalance = await prisma.orgBalance.findFirst({
      where: {
        base_org_id: organisationId,
        dest_org_id: transaction.destination_organisation_id,
      },
      include: {
        gl_accounts: true,
      },
    });

    const accountsReceivableGlAccountId = orgBalance?.gl_accounts[0]?.id;

    // Get reversible charge GL accounts
    const reversibleCharges = transaction.transaction_charges.filter(
      (charge: any) => charge.is_reversible
    );
    const chargeGlAccounts = await Promise.all(
      reversibleCharges.map(async (charge: any) => {
        const glAccountId = await glTransactionService.getGlAccountForEntity(
          "CHARGE",
          charge.charge_id,
          organisationId
        );
        return { ...charge, gl_account_id: glAccountId };
      })
    );
    const chargesToReverse = reversibleCharges.reduce(
      (acc: number, charge: any) => acc + charge.amount,
      0
    );
    const totalToreverse = transaction.origin_amount + chargesToReverse;

    if (tillGlAccountId && accountsReceivableGlAccountId) {
      const glEntries = [
        {
          gl_account_id: tillGlAccountId,
          amount: totalToreverse,
          dr_cr: "DR" as const,
          description: `Till cash decreased by ${totalToreverse} (reversal)`,
        },
        {
          gl_account_id: accountsReceivableGlAccountId,
          amount: transaction.origin_amount,
          dr_cr: "CR" as const,
          description: `Accounts receivable (liability) decreased by ${transaction.origin_amount} (reversal)`,
        },
      ];

      // Add reversible charge entries
      chargeGlAccounts.forEach((charge) => {
        if (charge.gl_account_id) {
          glEntries.push({
            gl_account_id: charge.gl_account_id,
            amount: charge.amount,
            dr_cr: "DR" as const,
            description: `${charge.charge.name} revenue reversed: ${charge.amount}`,
          });
        }
      });

      await glTransactionService.createGlTransaction(
        organisationId,
        {
          transaction_type: "OUTBOUND_TRANSACTION_REVERSAL",
          amount: totalToreverse,
          currency_id: transaction.origin_currency_id,
          description: `Outbound transaction reversal: ${transaction.transaction_no} - ${reason}`,
          till_id: transaction.till_id,
          customer_id: transaction.customer_id,
          transaction_id: transaction.id,
          gl_entries: glEntries.map((entry) => ({
            gl_account_id: entry.gl_account_id,
            amount: Number(entry.amount),
            dr_cr: entry.dr_cr,
            description: entry.description,
          })),
        },
        userId
      );
    }
  }

  // Create Inbound Transaction for Internal Integration
  private async createInboundTransaction(
    transaction: any,
    userId: string
  ): Promise<void> {
    return await prisma.$transaction(async (tx) => {
      //check if transaction is already created
      const existingTransaction = await tx.transaction.findFirst({
        where: {
          outbound_transaction_id: transaction.id,
          outbound_transaction_no: transaction.transaction_no,
        },
      });
      if (existingTransaction) {
        throw new AppError("Inbound transaction already created", 400);
      }

      // Get the destination organisation
      const destinationOrg = await tx.organisation.findUnique({
        where: { id: transaction.destination_organisation_id },
      });

      if (!destinationOrg) {
        throw new AppError("Destination organisation not found", 400);
      }

      // Get customer and beneficiary details
      const customer = await tx.customer.findUnique({
        where: { id: transaction.customer_id },
        include: {
          nationality: true,
          residence_country: true,
          incorporation_country: true,
        },
      });

      const beneficiary = await tx.beneficiary.findUnique({
        where: { id: transaction.beneficiary_id },
        include: {
          nationality: true,
          residence_country: true,
          incorporation_country: true,
        },
      });

      if (!customer || !beneficiary) {
        throw new AppError("Customer or beneficiary not found", 400);
      }

      //get transaction charges
      const transactionCharges = await tx.transactionCharge.findMany({
        where: { transaction_id: transaction.id },
      });

      // Insert counter_party (sender and receiver) - customer becomes SENDER, beneficiary becomes RECEIVER

      // Get a default till for the destination organisation
      const defaultTill = await tx.till.findFirst({
        where: {
          organisation_id: transaction.destination_organisation_id,
          status: "ACTIVE",
        },
      });

      // if (!defaultTill) {
      //   throw new AppError(
      //     "No active till found for destination organisation",
      //     400
      //   );
      // }

      // Generate transaction number for inbound transaction
      const inboundTransactionNo = await this.generateTransactionNumber(
        transaction.destination_organisation_id
      );

      // Create the inbound transaction
      const inboundTransaction = await tx.transaction.create({
        data: {
          transaction_no: inboundTransactionNo,
          corridor_id: transaction.corridor_id,
          till_id: defaultTill?.id, // Use default till, will be updated when approved
          direction: "INBOUND",
          origin_amount: transaction.origin_amount, // Original amount in destination currency
          origin_channel_id: transaction.origin_channel_id,
          origin_currency_id: transaction.origin_currency_id,
          dest_amount: transaction.dest_amount, // Received amount in destination currency
          dest_channel_id: transaction.dest_channel_id,
          dest_currency_id: transaction.dest_currency_id,
          rate: transaction.rate, // 1:1 for inbound as it's already converted
          internal_exchange_rate: transaction.internal_exchange_rate,
          inflation: transaction.inflation,
          markup: transaction.markup,
          purpose: transaction.purpose,
          funds_source: transaction.funds_source,
          relationship: transaction.relationship,
          remarks: `Inbound transaction from ${
            transaction.origin_organisation?.name || "Unknown"
          } - Original: ${transaction.transaction_no}`,
          exchange_rate_id: transaction.exchange_rate_id,
          external_exchange_rate_id: transaction.external_exchange_rate_id,
          origin_organisation_id: transaction.origin_organisation_id,
          destination_organisation_id: transaction.destination_organisation_id,
          origin_country_id: transaction.origin_country_id, // Reversed
          destination_country_id: transaction.destination_country_id, // Reversed
          amount_payable: transaction.amount_payable,
          amount_receivable: transaction.amount_receivable,
          status: "PENDING_APPROVAL",
          remittance_status: "TRANSIT",
          request_status: "UNDER_REVIEW",
          created_by: userId,
          outbound_transaction_id: transaction.id,
          outbound_transaction_no: transaction.transaction_no,
          total_all_charges: transaction.total_all_charges,
          commissions: transaction.commissions,
          total_taxes: transaction.total_taxes,
        },
      });

      // Create transaction parties
      // Sender (customer from original transaction)
      const senderTransactionParty = await tx.transactionParty.create({
        data: {
          transaction_id: inboundTransaction.id,
          role: "SENDER",
          name:
            `${customer.first_name || ""} ${customer.last_name || ""}`.trim() ||
            customer.full_name,
          id_type: customer.id_type,
          id_number: customer.id_number,
          nationality_id:
            customer.nationality_id ||
            customer.residence_country_id ||
            customer.incorporation_country_id,
          payout_method_channel_id: transaction.origin_channel_id, // Source channel
          payout_phone: customer.phone_number,
          metadata: {
            email: customer.email,
            phone: customer.phone_number,
            id_type: customer.id_type,
            id_number: customer.id_number,
            address: customer.address,
            customer_type: customer.customer_type,
            tax_number: customer.tax_number,
            tax_number_type: customer.tax_number_type,
          },
          organisation_id: transaction.destination_organisation_id,
          created_by: userId,
        },
      });

      // Receiver (beneficiary from original transaction)
      const receiverTransactionParty = await tx.transactionParty.create({
        data: {
          transaction_id: inboundTransaction.id,
          role: "RECEIVER",
          name: beneficiary.name,
          id_type: beneficiary.id_type,
          id_number: beneficiary.id_number,
          nationality_id:
            beneficiary.nationality_id ||
            beneficiary.residence_country_id ||
            beneficiary.incorporation_country_id,
          payout_method_channel_id: transaction.dest_channel_id,
          payout_bank_name: beneficiary.bank_name,
          payout_bank_account_number: beneficiary.bank_account_number,
          payout_bank_account_name: beneficiary.bank_account_name,
          payout_phone: beneficiary.phone,
          metadata: {
            email: beneficiary.email,
            phone: beneficiary.phone,
            id_type: beneficiary.id_type,
            id_number: beneficiary.id_number,
            address: beneficiary.address,
            bank_address: beneficiary.bank_address,
            bank_city: beneficiary.bank_city,
            bank_state: beneficiary.bank_state,
            bank_zip: beneficiary.bank_zip,
          },
          organisation_id: transaction.destination_organisation_id,
          created_by: userId,
        },
      });

      // Create transaction audit
      await tx.transactionAudit.create({
        data: {
          transaction_id: inboundTransaction.id,
          user_id: userId,
          new_user_id: userId,
          action: "CREATED",
          notes: "Inbound transaction created",
        },
      });

      await tx.transaction.update({
        where: { id: inboundTransaction.id },
        data: {
          sender_trasaction_party_id: senderTransactionParty.id,
          receiver_trasaction_party_id: receiverTransactionParty.id,
        },
      });

      console.log(
        "Created inbound transaction:",
        inboundTransaction.id,
        "with transaction parties"
      );
    });
  }

  // Get Inbound Transactions
  async getInboundTransactions(
    organisationId: string,
    filters: TransactionFilters
  ): Promise<TransactionListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      remittance_status,
      request_status,
      corridor_id,
      customer_id,
      origin_currency_id,
      dest_currency_id,
      origin_organisation_id,
      destination_organisation_id,
      created_by,
      date_from,
      date_to,
      amount_min,
      amount_max,
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {
      direction: "INBOUND",
      destination_organisation_id: organisationId,
    };

    if (search) {
      where.OR = [
        { transaction_no: { contains: search, mode: "insensitive" } },
        {
          customer: { first_name: { contains: search, mode: "insensitive" } },
        },
        {
          customer: { last_name: { contains: search, mode: "insensitive" } },
        },
        { beneficiary: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) where.status = status;
    if (remittance_status) where.remittance_status = remittance_status;
    if (request_status) where.request_status = request_status;
    if (corridor_id) where.corridor_id = corridor_id;
    if (customer_id) where.customer_id = customer_id;
    if (origin_currency_id) where.origin_currency_id = origin_currency_id;
    if (dest_currency_id) where.dest_currency_id = dest_currency_id;
    if (origin_organisation_id)
      where.origin_organisation_id = origin_organisation_id;
    if (destination_organisation_id)
      where.destination_organisation_id = destination_organisation_id;
    if (created_by) where.created_by = created_by;

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (amount_min || amount_max) {
      where.origin_amount = {};
      if (amount_min) where.origin_amount.gte = amount_min;
      if (amount_max) where.origin_amount.lte = amount_max;
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          corridor: {
            include: {
              origin_country: true,
              destination_country: true,
              base_currency: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          customer: true,
          origin_channel: true,
          origin_currency: true,
          beneficiary: true,
          dest_channel: true,
          dest_currency: true,
          exchange_rate: true,
          external_exchange_rate: true,
          created_by_user: true,
          origin_organisation: true,
          destination_organisation: true,
          transaction_charges: {
            include: {
              charge: true,
              organisation: true,
            },
          },
          sender_trasaction_party: true,
          receiver_trasaction_party: true,
          transaction_parties: {
            include: {
              nationality: true,
              payout_method_channel: true,
              created_by_user: true,
            },
          },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Inbound transactions retrieved successfully",
      data: {
        transactions: transactions.map((transaction) => ({
          ...transaction,
          origin_amount: parseFloat(transaction.origin_amount.toString()),
          dest_amount: parseFloat(transaction.dest_amount.toString()),
          rate: parseFloat(transaction.rate.toString()),
          internal_exchange_rate: transaction.internal_exchange_rate
            ? parseFloat(transaction.internal_exchange_rate.toString())
            : null,
          inflation: transaction.inflation
            ? parseFloat(transaction.inflation.toString())
            : null,
          markup: transaction.markup
            ? parseFloat(transaction.markup.toString())
            : null,
          amount_payable: transaction.amount_payable
            ? parseFloat(transaction.amount_payable.toString())
            : null,
          amount_receivable: transaction.amount_receivable
            ? parseFloat(transaction.amount_receivable.toString())
            : null,
          created_at: transaction.created_at?.toISOString() || null,
          updated_at: transaction.updated_at?.toISOString() || null,
          deleted_at: transaction.deleted_at?.toISOString() || null,
          received_at: transaction.received_at?.toISOString() || null,
          remitted_at: transaction.remitted_at?.toISOString() || null,
          transaction_charges: transaction.transaction_charges.map(
            (charge) => ({
              ...charge,
              amount: parseFloat(charge.amount.toString()),
              rate: charge.rate ? parseFloat(charge.rate.toString()) : null,
              created_at: charge.created_at.toISOString(),
              updated_at: charge.updated_at.toISOString(),
            })
          ),
        })) as unknown as ITransaction[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  }

  // Get Inbound Transaction by ID
  async getInboundTransactionById(
    transactionId: string
  ): Promise<TransactionResponse> {
    const transaction = await prisma.transaction.findUnique({
      where: {
        id: transactionId,
        direction: "INBOUND",
      },
      include: {
        corridor: {
          include: {
            origin_country: true,
            destination_country: true,
            base_currency: true,
          },
        },
        till: {
          include: {
            organisation: true,
          },
        },
        customer: true,
        origin_channel: true,
        origin_currency: true,
        beneficiary: true,
        dest_channel: true,
        dest_currency: true,
        exchange_rate: true,
        external_exchange_rate: true,
        created_by_user: true,
        origin_organisation: true,
        destination_organisation: true,
        transaction_charges: {
          include: {
            charge: true,
            organisation: true,
          },
        },
        sender_trasaction_party: true,
        receiver_trasaction_party: true,
        transaction_parties: {
          include: {
            nationality: true,
            payout_method_channel: true,
            created_by_user: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new AppError("Inbound transaction not found", 400);
    }

    return {
      success: true,
      message: "Inbound transaction retrieved successfully",
      data: {
        ...transaction,
        origin_amount: parseFloat(transaction.origin_amount.toString()),
        dest_amount: parseFloat(transaction.dest_amount.toString()),
        rate: parseFloat(transaction.rate.toString()),
        internal_exchange_rate: transaction.internal_exchange_rate
          ? parseFloat(transaction.internal_exchange_rate.toString())
          : null,
        inflation: transaction.inflation
          ? parseFloat(transaction.inflation.toString())
          : null,
        markup: transaction.markup
          ? parseFloat(transaction.markup.toString())
          : null,
        amount_payable: transaction.amount_payable
          ? parseFloat(transaction.amount_payable.toString())
          : null,
        amount_receivable: transaction.amount_receivable
          ? parseFloat(transaction.amount_receivable.toString())
          : null,
        created_at: transaction.created_at?.toISOString() || null,
        updated_at: transaction.updated_at?.toISOString() || null,
        deleted_at: transaction.deleted_at?.toISOString() || null,
        received_at: transaction.received_at?.toISOString() || null,
        remitted_at: transaction.remitted_at?.toISOString() || null,
        transaction_charges: transaction.transaction_charges.map((charge) => ({
          ...charge,
          amount: parseFloat(charge.amount.toString()),
          rate: charge.rate ? parseFloat(charge.rate.toString()) : null,
          created_at: charge.created_at.toISOString(),
          updated_at: charge.updated_at.toISOString(),
        })),
      } as unknown as ITransaction,
    };
  }

  // Approve Inbound Transaction
  async approveInboundTransaction(
    transactionId: string,
    data: ApproveTransactionRequest,
    userId: string,
    ipAddress: string
  ): Promise<TransactionResponse> {
    let periodicUpdates: Array<IUpdateOrgBalance> = [];

    const result = await prisma.$transaction(async (tx) => {
      const validateTill = await getValidateTillParameter();
      // Get transaction with relations
      const transaction = await tx.transaction.findUnique({
        where: {
          id: transactionId,
          direction: "INBOUND",
        },
        include: {
          transaction_parties: true,
          destination_organisation: true,
          origin_organisation: true,
        },
      });

      if (!transaction) {
        throw new AppError("Inbound transaction not found", 400);
      }

      // Check if transaction can be approved
      if (!["PENDING", "PENDING_APPROVAL"].includes(transaction.status)) {
        throw new AppError(
          "Transaction cannot be approved in current status",
          400
        );
      }

      let originBalance: OrgBalance | null = null;
      let destinationBalance: OrgBalance | null = null;
      const mainOrganisation = await prisma.organisation.findFirst({
        where: {
          type: "CUSTOMER",
        },
      });
      if (mainOrganisation) {
        this.mainOrganisationId = mainOrganisation.id;
      } else {
        throw new AppError("Main organisation not found", 400);
      }

      let realDestinationOrgBalance: OrgBalance | null = null;

      if (
        transaction.destination_organisation_id &&
        transaction.origin_organisation_id &&
        transaction.origin_currency_id &&
        this.mainOrganisationId
      ) {
        const [originOrgBalance, destinationOrgBalance] = await Promise.all([
          tx.orgBalance.findUnique({
            where: {
              base_org_id_dest_org_id_currency_id: {
                base_org_id: this.mainOrganisationId,
                dest_org_id: transaction.origin_organisation_id,
                currency_id: transaction.origin_currency_id,
              },
            },
          }),
          tx.orgBalance.findUnique({
            where: {
              base_org_id_dest_org_id_currency_id: {
                base_org_id: this.mainOrganisationId,
                dest_org_id: transaction.destination_organisation_id,
                currency_id: transaction.origin_currency_id, // Or data.destination_currency_id if different
              },
            },
          }),
        ]);

        realDestinationOrgBalance = destinationOrgBalance;

        if (!originOrgBalance) {
          console.error("Origin agency must deposit float first");
          throw new AppError("Origin agency must deposit float first", 400);
        }

        if (!realDestinationOrgBalance) {
          console.warn(
            "Destination agency does not have a float balance, creating a new one"
          );
          realDestinationOrgBalance = await tx.orgBalance.create({
            data: {
              base_org_id: this.mainOrganisationId,
              dest_org_id: transaction.destination_organisation_id,
              currency_id: transaction.origin_currency_id,
              balance: new Decimal(0),
              locked_balance: new Decimal(0),
              limit: new Decimal(0),
              created_at: new Date(),
              updated_at: new Date(),
              created_by: userId,
            },
          });
        }
        originBalance = originOrgBalance;
        destinationBalance = realDestinationOrgBalance;

        const balance = new Decimal(originOrgBalance?.balance);
        const lockedBalance = new Decimal(
          originOrgBalance?.locked_balance || 0
        );
        const totalAvailableBalance = balance.sub(lockedBalance);

        if (
          totalAvailableBalance.lt(new Decimal(transaction.amount_payable || 0))
        ) {
          throw new AppError(
            "Insufficient orogin organisation balance for this transaction",
            400
          );
        }
      } else {
        throw new AppError(
          "Origin organisation or destination organisation or origin currency not found",
          400
        );
      }

      // Get user's open till
      let userTill = await tx.userTill.findFirst({
        where: {
          user_id: userId,
          status: "OPEN",
        },
        include: {
          till: true,
        },
      });

      if (!userTill) {
        const freeTill = await tx.till.findFirst({
          where: {
            organisation_id: transaction.destination_organisation_id,
            status: "ACTIVE",
            current_teller_user_id: null,
            currency_id: transaction.dest_currency_id,
          },
        });

        if (freeTill) {
          const userTillResponse = await userTillService.createUserTill({
            user_id: userId,
            till_id: freeTill.id,
            opening_balance: freeTill.balance?.toNumber() || 0,
            date: new Date().toISOString(),
            status: "OPEN",
          });
          userTill = userTillResponse.data as any;
        }
      }

      if (validateTill && !userTill) {
        throw new AppError("User till not found", 400);
      }

      // Update transaction status and set till
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: "COMPLETED",
          remittance_status: "PAID",
          request_status: "APPROVED",
          till_id: userTill?.till_id,
          remarks: data.remarks
            ? `${transaction.remarks || ""}\nApproved: ${data.remarks}`.trim()
            : transaction.remarks,
          updated_at: new Date(),
        },
      });

      // Update till balance for inbound transaction
      let till = null;
      if (userTill?.till_id) {
        till = await tx.till.findUnique({
          where: { id: userTill?.till_id },
        });
      }
      if (
        !updatedTransaction.origin_organisation_id ||
        !updatedTransaction.destination_organisation_id ||
        !updatedTransaction.origin_currency_id
      ) {
        throw new AppError(
          "Origin organisation, destination organisation or origin currency not found",
          400
        );
      }
      if (originBalance) {
        const orgBalance = originBalance;
        const balance = new Decimal(orgBalance?.balance);
        const lockedBalance = new Decimal(orgBalance?.locked_balance || 0);
        const totalCharges = new Decimal(
          updatedTransaction.total_all_charges || 0
        );
        const totalTaxes = new Decimal(updatedTransaction.total_taxes || 0);
        const transactionAmount = new Decimal(
          updatedTransaction.origin_amount || 0
        )
          .add(totalCharges)
          .sub(totalTaxes);
        const newBalance = balance.sub(transactionAmount);
        const newLockedBalance = lockedBalance.sub(transactionAmount);

        await tx.orgBalance.update({
          where: { id: orgBalance.id },
          data: {
            balance: newBalance,
            locked_balance: newLockedBalance,
            updated_at: new Date(),
          },
        });

        const originHistory = await tx.balanceHistory.create({
          data: {
            action_type: BalanceHistoryAction.PAYOUT,
            entity_type: "AGENCY_FLOAT",
            entity_id: orgBalance.id,
            currency_id: updatedTransaction.origin_currency_id,
            old_balance: balance,
            new_balance: newBalance,
            change_amount: -transactionAmount,
            description: `Inbound transaction approved: ${updatedTransaction.id}`,
            created_by: userId,
            organisation_id: orgBalance.base_org_id,
            org_balance_id: orgBalance.id,
            float_org_id: orgBalance.base_org_id,
          },
        });

        // Queue periodic update for origin org (withdrawal)
        periodicUpdates.push({
          organisationId: orgBalance.dest_org_id,
          amount: parseFloat(transactionAmount.toString()),
          type: "transaction_out",
          userId,
          balanceHistoryId: originHistory.id,
        });
      }
      if (destinationBalance) {
        const orgBalance = destinationBalance;
        const balance = new Decimal(orgBalance?.balance);

        const transactionAmount = new Decimal(
          updatedTransaction.dest_amount || 0
        );

        const newBalance = balance.add(transactionAmount);

        await tx.orgBalance.update({
          where: { id: orgBalance.id },
          data: {
            balance: newBalance,
            updated_at: new Date(),
          },
        });

        const destinationHistory = await tx.balanceHistory.create({
          data: {
            action_type: BalanceHistoryAction.PAYOUT,
            entity_type: "AGENCY_FLOAT",
            entity_id: orgBalance.id,
            currency_id: updatedTransaction.origin_currency_id,
            old_balance: balance,
            new_balance: newBalance,
            change_amount: transactionAmount,
            description: `Inbound transaction approved: ${updatedTransaction.id}`,
            created_by: userId,
            organisation_id: orgBalance.base_org_id,
            org_balance_id: orgBalance.id,
            float_org_id: orgBalance.base_org_id,
          },
        });

        // Queue periodic update for destination org (deposit)
        periodicUpdates.push({
          organisationId: orgBalance.dest_org_id,
          amount: parseFloat(transactionAmount.toString()),
          type: "transaction_in",
          userId,
          balanceHistoryId: destinationHistory.id,
        });
      }

      if (till) {
        const currentBalance = parseFloat(till.balance?.toString() || "0");
        const transactionAmount = parseFloat(
          transaction.dest_amount.toString()
        );
        const newBalance = currentBalance + transactionAmount;

        // Update till balance
        await tx.till.update({
          where: { id: till.id },
          data: {
            balance: newBalance,
            updated_at: new Date(),
          },
        });

        if (userTill) {
          // Update user_tills for active sessions
          await tx.userTill.updateMany({
            where: {
              till_id: userTill?.till_id,
              status: "OPEN",
              organisation_id: till.organisation_id,
            },
            data: {
              net_transactions_total: { increment: transactionAmount },
            },
          });
        }

        // Create balance history record
        await tx.balanceHistory.create({
          data: {
            action_type: BalanceHistoryAction.PAYOUT,
            entity_type: "TILL",
            entity_id: till.id,
            currency_id: transaction.dest_currency_id,
            old_balance: currentBalance,
            new_balance: newBalance,
            change_amount: transactionAmount,
            description: `Inbound transaction approved: ${transaction.id}`,
            created_by: userId,
            organisation_id: till.organisation_id,
            till_id: till.id,
          },
        });
      }

      // Create GL Transaction for the approved inbound transaction
      await this.createGLTransactionForApprovedInboundTransaction(
        transaction,
        userId,
        till?.id
      );

      // Create transaction audit
      await tx.transactionAudit.create({
        data: {
          transaction_id: transactionId,
          action: "APPROVED",
          user_id: userId,
          details: {
            old_status: "PENDING_APPROVAL",
            new_status: "APPROVED",
          },
          ip_address: ipAddress,
          notes: data.remarks || "Inbound transaction approved",
        },
      });

      //update outbound transaction status to COMPLETED
      if (updatedTransaction.outbound_transaction_id) {
        await tx.transaction.update({
          where: { id: updatedTransaction.outbound_transaction_id },
          data: {
            status: "COMPLETED",
            remittance_status: "PAID",
            updated_at: new Date(),
          },
        });
      }

      // Get updated transaction with relations
      const result = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          corridor: {
            include: {
              origin_country: true,
              destination_country: true,
              base_currency: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          customer: true,
          origin_channel: true,
          origin_currency: true,
          beneficiary: true,
          dest_channel: true,
          dest_currency: true,
          exchange_rate: true,
          external_exchange_rate: true,
          created_by_user: true,
          origin_organisation: true,
          destination_organisation: true,
          transaction_charges: {
            include: {
              charge: true,
              organisation: true,
            },
          },
          sender_trasaction_party: true,
          receiver_trasaction_party: true,
          transaction_parties: {
            include: {
              nationality: true,
              payout_method_channel: true,
              created_by_user: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Inbound transaction approved successfully",
        data: result as unknown as ITransaction,
      };
    });

    // Apply periodic updates after transaction completes
    for (const update of periodicUpdates) {
      try {
        await orgBalanceService.updatePeriodicOrgBalance({
          organisationId: update.organisationId,
          amount: update.amount,
          type: update.type,
          userId: update.userId,
          balanceHistoryId: update.balanceHistoryId,
        });
      } catch (error) {
        console.error(
          `Failed to update periodic balance for org ${update.organisationId}:`,
          error
        );
        // Don't throw error to avoid breaking the main flow
      }
    }

    return result;
  }

  // Reverse Inbound Transaction
  async reverseInboundTransaction(
    transactionId: string,
    data: ReverseTransactionRequest,
    userId: string,
    ipAddress: string
  ): Promise<TransactionResponse> {
    return await prisma.$transaction(async (tx) => {
      // Get transaction with relations
      const transaction = await tx.transaction.findUnique({
        where: {
          id: transactionId,
          direction: "INBOUND",
        },
        include: {
          transaction_parties: true,
          destination_organisation: true,
          origin_organisation: true,
        },
      });

      if (!transaction) {
        throw new AppError("Inbound transaction not found", 400);
      }

      // Check if transaction can be reversed
      if (transaction.status !== "APPROVED") {
        throw new AppError(
          "Only approved inbound transactions can be reversed",
          400
        );
      }

      // Update transaction status
      const updatedTransaction = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: "REVERSED",
          remarks: `${transaction.remarks || ""}\nReversed: ${data.reason}${
            data.remarks ? ` - ${data.remarks}` : ""
          }`.trim(),
          updated_at: new Date(),
        },
      });

      // Reverse till balance for inbound transaction
      if (transaction.till_id) {
        const till = await tx.till.findUnique({
          where: { id: transaction.till_id },
        });

        if (till) {
          const currentBalance = parseFloat(till.balance?.toString() || "0");
          const transactionAmount = parseFloat(
            transaction.dest_amount.toString()
          );
          const newBalance = currentBalance - transactionAmount;

          // Update till balance
          await tx.till.update({
            where: { id: transaction.till_id },
            data: {
              balance: newBalance,
              updated_at: new Date(),
            },
          });

          // Update user_tills for active sessions
          await tx.userTill.updateMany({
            where: {
              till_id: transaction.till_id,
              status: "OPEN",
              organisation_id: till.organisation_id,
            },
            data: {
              net_transactions_total: { increment: -transactionAmount },
            },
          });

          // Create balance history record
          await tx.balanceHistory.create({
            data: {
              action_type: BalanceHistoryAction.REVERSAL,
              entity_type: "TILL",
              entity_id: transaction.till_id,
              currency_id: transaction.dest_currency_id,
              old_balance: currentBalance,
              new_balance: newBalance,
              change_amount: -transactionAmount,
              description: `Inbound transaction reversed: ${transaction.id} - ${data.reason}`,
              created_by: userId,
              organisation_id: till.organisation_id,
              till_id: transaction.till_id,
            },
          });
        }
      }

      // Create reverse GL Transaction
      await this.createReverseGLTransactionForInboundTransaction(
        transaction,
        data.reason,
        userId
      );

      // Get updated transaction with relations
      const result = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          corridor: {
            include: {
              origin_country: true,
              destination_country: true,
              base_currency: true,
            },
          },
          till: {
            include: {
              organisation: true,
            },
          },
          customer: true,
          origin_channel: true,
          origin_currency: true,
          beneficiary: true,
          dest_channel: true,
          dest_currency: true,
          exchange_rate: true,
          external_exchange_rate: true,
          created_by_user: true,
          origin_organisation: true,
          destination_organisation: true,
          transaction_charges: {
            include: {
              charge: true,
              organisation: true,
            },
          },
          sender_trasaction_party: true,
          receiver_trasaction_party: true,
          transaction_parties: {
            include: {
              nationality: true,
              payout_method_channel: true,
              created_by_user: true,
            },
          },
        },
      });

      // Create transaction audit
      await tx.transactionAudit.create({
        data: {
          transaction_id: transactionId,
          action: "REVERSED",
          user_id: userId,
          details: {
            old_status: "APPROVED",
            new_status: "REVERSED",
          },
          ip_address: ipAddress,
          notes: data.remarks || `Inbound transaction reversed: ${data.reason}`,
        },
      });

      return {
        success: true,
        message: "Inbound transaction reversed successfully",
        data: result as unknown as ITransaction,
      };
    });
  }

  // Create GL Transaction for Approved Inbound Transaction
  private async createGLTransactionForApprovedInboundTransaction(
    transaction: any,
    userId: string,
    tillId?: string
  ): Promise<void> {
    const organisationId = transaction.destination_organisation_id;
    const originOrganisationId = transaction.origin_organisation_id;
    const [customerOrganisation, originOrganisation] = await Promise.all([
      prisma.organisation.findFirst({
        where: {
          type: "CUSTOMER",
        },
      }),
      prisma.organisation.findFirst({
        where: {
          id: originOrganisationId,
        },
        select: {
          name: true,
          id: true,
        },
      }),
    ]);

    if (customerOrganisation) {
      this.mainOrganisationId = customerOrganisation.id;
    } else {
      throw new AppError("Customer organisation not found", 400);
    }

    // Get GL accounts
    const tillGlAccountId = await glTransactionService.getGlAccountForEntity(
      "TILL",
      tillId || "",
      organisationId
    );

    const accountsPayableGlAccountId =
      await glTransactionService.getGlAccountForEntity(
        "INBOUND_BENEFICIARY_PAYMENT",
        transaction.origin_organisation_id,
        organisationId
      );

    if (tillGlAccountId && accountsPayableGlAccountId) {
      const glEntries = [
        {
          gl_account_id: tillGlAccountId,
          amount: transaction.origin_amount,
          dr_cr: "DR" as const,
          description: `Till cash decreased by ${transaction.origin_amount}`,
        },
        {
          gl_account_id: accountsPayableGlAccountId,
          amount: transaction.origin_amount,
          dr_cr: "CR" as const,
          description: `Accounts payable increased by ${transaction.origin_amount}, beneficiary paid`,
        },
      ];

      await glTransactionService.createGlTransaction(
        organisationId,
        {
          transaction_type: "INBOUND_TRANSACTION",
          amount: transaction.origin_amount,
          currency_id: transaction.origin_currency_id,
          description: `Inbound transaction: ${transaction.transaction_no}`,
          gl_entries: glEntries.map((entry) => ({
            gl_account_id: entry.gl_account_id,
            amount: Number(entry.amount),
            dr_cr: entry.dr_cr,
            description: entry.description,
          })),
        },
        userId
      );
    }

    if (!originOrganisation) {
      throw new AppError("Origin organisation not found", 400);
    }

    const floatPayableName = `Float Transit Payable - ${originOrganisation.name}`;
    const [originFloatPayableAccount, originOrgFloatBalance] =
      await Promise.all([
        prisma.glAccount.findFirst({
          where: {
            organisation_id: originOrganisation.id,
            type: "LIABILITY",
            name: {
              contains: floatPayableName,
            },
          },
        }),
        prisma.orgBalance.findFirst({
          where: {
            base_org_id: this.mainOrganisationId,
            dest_org_id: originOrganisation.id,
          },
          include: {
            gl_accounts: true,
          },
        }),
      ]);

    const originOrgFloatAccount = originOrgFloatBalance?.gl_accounts[0];
    if (originFloatPayableAccount && originOrgFloatAccount) {
      const glEntries = [
        {
          gl_account_id: originFloatPayableAccount.id,
          amount: transaction.origin_amount,
          dr_cr: "DR" as const,
          description: `Float transit payable increased by ${transaction.origin_amount}`,
        },
        {
          gl_account_id: originOrgFloatAccount.id,
          amount: transaction.origin_amount,
          dr_cr: "CR" as const,
          description: `Origin organisation balance decreased by ${transaction.origin_amount}`,
        },
      ];

      await glTransactionService.createGlTransaction(
        originOrganisation.id,
        {
          transaction_type: "INBOUND_TRANSACTION",
          amount: transaction.origin_amount,
          currency_id: transaction.origin_currency_id,
          description: `Inbound transaction approved: ${transaction.transaction_no}`,
          gl_entries: glEntries.map((entry) => ({
            gl_account_id: entry.gl_account_id,
            amount: Number(entry.amount),
            dr_cr: entry.dr_cr,
            description: entry.description,
          })),
        },
        userId
      );
    }
  }

  // Create Reverse GL Transaction for Inbound Transaction
  private async createReverseGLTransactionForInboundTransaction(
    transaction: any,
    reason: string,
    userId: string
  ): Promise<void> {
    const organisationId = transaction.destination_organisation_id;

    // Get GL accounts
    const tillGlAccountId = await glTransactionService.getGlAccountForEntity(
      "TILL",
      transaction.till_id,
      organisationId
    );

    const accountsPayableGlAccountId =
      await glTransactionService.getGlAccountForEntity(
        "ORG_BALANCE",
        transaction.origin_organisation_id,
        organisationId
      );

    if (tillGlAccountId && accountsPayableGlAccountId) {
      const glEntries = [
        {
          gl_account_id: tillGlAccountId,
          amount: transaction.origin_amount,
          dr_cr: "CR" as const,
          description: `Till cash decreased by ${transaction.origin_amount} (reversal)`,
        },
        {
          gl_account_id: accountsPayableGlAccountId,
          amount: transaction.origin_amount,
          dr_cr: "DR" as const,
          description: `Accounts payable decreased by ${transaction.origin_amount} (reversal)`,
        },
      ];

      await glTransactionService.createGlTransaction(
        organisationId,
        {
          transaction_type: "INBOUND_TRANSACTION_REVERSAL",
          amount: transaction.origin_amount,
          currency_id: transaction.origin_currency_id,
          description: `Inbound transaction reversal: ${transaction.transaction_no} - ${reason}`,
          gl_entries: glEntries.map((entry) => ({
            gl_account_id: entry.gl_account_id,
            amount: Number(entry.amount),
            dr_cr: entry.dr_cr,
            description: entry.description,
          })),
        },
        userId
      );
    }
  }

  // Get Inbound Transaction Stats
  async getInboundTransactionStats(
    organisationId: string
  ): Promise<TransactionStatsResponse> {
    const where = {
      direction: "INBOUND" as const,
      destination_organisation_id: organisationId,
    };

    const [
      totalCount,
      amountData,
      statusData,
      directionData,
      currencyData,
      orgData,
    ] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.aggregate({
        where,
        _sum: {
          origin_amount: true,
        },
      }),
      prisma.transaction.groupBy({
        by: ["status"],
        where,
        _count: { id: true },
        _sum: { origin_amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["direction"],
        where,
        _count: { id: true },
        _sum: { origin_amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["origin_currency_id"],
        where,
        _count: { id: true },
        _sum: { origin_amount: true },
      }),
      prisma.transaction.groupBy({
        by: ["origin_organisation_id"],
        where,
        _count: { id: true },
        _sum: { origin_amount: true },
      }),
    ]);

    const currencyStats = await Promise.all(
      currencyData.map(async (item) => {
        const currency = await prisma.currency.findUnique({
          where: { id: item.origin_currency_id },
          select: { currency_code: true },
        });

        return {
          currency_id: item.origin_currency_id,
          currency_code: currency?.currency_code || "Unknown",
          count: item._count?.id || 0,
          amount: item._sum?.origin_amount
            ? parseFloat(item._sum.origin_amount.toString())
            : 0,
        };
      })
    );

    const orgStats = await Promise.all(
      orgData.map(async (item) => {
        const org = await prisma.organisation.findUnique({
          where: { id: item.origin_organisation_id! },
          select: { name: true },
        });

        return {
          organisation_id: item.origin_organisation_id || "",
          organisation_name: org?.name || "Unknown",
          count: item._count?.id || 0,
          amount: item._sum?.origin_amount
            ? parseFloat(item._sum.origin_amount.toString())
            : 0,
        };
      })
    );

    return {
      success: true,
      message: "Inbound transaction stats retrieved successfully",
      data: {
        totalTransactions: totalCount,
        totalAmount: amountData._sum?.origin_amount
          ? parseFloat(amountData._sum.origin_amount.toString())
          : 0,
        byStatus: statusData.map((item) => ({
          status: item.status,
          count: item._count?.id || 0,
          amount: item._sum?.origin_amount
            ? parseFloat(item._sum.origin_amount.toString())
            : 0,
        })),
        byDirection: directionData.map((item) => ({
          direction: item.direction,
          count: item._count?.id || 0,
          amount: item._sum?.origin_amount
            ? parseFloat(item._sum.origin_amount.toString())
            : 0,
        })),
        byCurrency: currencyStats,
        byOrganisation: orgStats,
      },
    };
  }

  async updateInboundTransactionReceiverDetails(
    transactionId: string,
    receiverDetails: UpdateInboundTransactionReceiverDetailsRequest
  ) {
    return await prisma.$transaction(async (tx) => {
      // First, validate the transaction exists and is inbound
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: {
          receiver_trasaction_party: true,
        },
      });

      if (!transaction) {
        throw new AppError("Transaction not found", 404);
      }

      if (transaction.direction !== "INBOUND") {
        throw new AppError("Transaction is not an inbound transaction", 400);
      }

      if (!transaction.receiver_trasaction_party_id) {
        throw new AppError(
          "Receiver party not found for this transaction",
          404
        );
      }

      // Get the current receiver party data
      const receiverParty = transaction.receiver_trasaction_party;

      if (!receiverParty) {
        throw new AppError("Receiver party not found", 404);
      }

      // Prepare the update data
      const updateData: {
        id_type?: any;
        id_number?: string;
        payout_phone?: string;
        metadata?: any;
      } = {};

      // Only update fields that are provided
      if (receiverDetails.id_type !== undefined) {
        updateData.id_type = receiverDetails.id_type;
      }
      if (receiverDetails.id_number !== undefined) {
        updateData.id_number = receiverDetails.id_number;
      }
      if (receiverDetails.phone !== undefined) {
        updateData.payout_phone = receiverDetails.phone;
      }

      // Update metadata only if there are metadata fields to update
      const metadataFields = ["email", "phone", "address"];
      const hasMetadataUpdates = metadataFields.some(
        (field) =>
          receiverDetails[
            field as keyof UpdateInboundTransactionReceiverDetailsRequest
          ] !== undefined
      );

      if (hasMetadataUpdates) {
        const currentMetadata =
          typeof receiverParty.metadata === "object" &&
          receiverParty.metadata !== null
            ? receiverParty.metadata
            : {};
        const updatedMetadata: Record<string, any> = { ...currentMetadata };

        if (receiverDetails.email !== undefined) {
          updatedMetadata.email = receiverDetails.email;
        }
        if (receiverDetails.phone !== undefined) {
          updatedMetadata.phone = receiverDetails.phone;
        }
        if (receiverDetails.address !== undefined) {
          updatedMetadata.address = receiverDetails.address;
        }

        updateData.metadata = updatedMetadata;
      }

      // Update the receiver party
      await tx.transactionParty.update({
        where: { id: receiverParty.id },
        data: updateData,
      });

      // Return the updated transaction with all relations
      return await this.getInboundTransactionById(transactionId);
    });
  }
}
