import {
  PrismaClient,
  Direction,
  Status,
  RemittanceStatus,
  RequestStatus,
  ChargeType,
  TransactionChargeStatus,
  GlEntry,
  IntegrationMethod,
} from "@prisma/client";
import { GlTransactionService } from "../gltransactions/gltransactions.services";
import { BalanceOperationService } from "../balanceoperations/balanceoperations.services";
import type {
  ITransaction,
  ITransactionCharge,
  CreateOutboundTransactionRequest,
  UpdateTransactionRequest,
  TransactionFilters,
  TransactionListResponse,
  TransactionResponse,
  TransactionStats,
  TransactionStatsResponse,
  CancelTransactionRequest,
  ApproveTransactionRequest,
  ReverseTransactionRequest,
  TransactionChargeCalculation,
  OutboundTransactionResult,
} from "./transactions.interfaces";

const prisma = new PrismaClient();
const glTransactionService = new GlTransactionService();
const balanceOperationService = new BalanceOperationService();

export class TransactionService {
  // Create Outbound Transaction
  async createOutboundTransaction(
    organisationId: string,
    data: CreateOutboundTransactionRequest,
    userId: string
  ): Promise<OutboundTransactionResult> {
    try {
      return await prisma.$transaction(async (tx) => {
        // 1. Validate that user has an open till
        const userTill = await tx.userTill.findFirst({
          where: {
            user_id: userId,
            status: "OPEN",
            closed_at: null,
          },
          include: {
            till: {
              include: {
                organisation: true,
              },
            },
          },
        });

        if (!userTill) {
          throw new Error("User must have an open till to create transactions");
        }

        // 2. Validate till belongs to the organisation
        if (userTill.till.organisation_id !== organisationId) {
          throw new Error("Till does not belong to the specified organisation");
        }

        // 3. Validate till is the same as the one in the request
        if (userTill.till_id !== data.till_id && data.till_id !== null) {
          throw new Error("Transaction till must match the user's open till");
        }
        if (data.till_id === null) {
          data.till_id = userTill.till_id;
        }

        // 4. Get corridor and validate it belongs to the organisation
        const corridor = await tx.corridor.findFirst({
          where: {
            id: data.corridor_id,
            organisation_id: organisationId,
            base_currency_id: data.dest_currency_id,
            destination_country_id: data.destination_country_id,
            status: "ACTIVE",
          },
        });

        if (!corridor) {
          throw new Error("Invalid or inactive corridor");
        }

        // 5. Get customer and validate it belongs to the organisation
        const customer = await tx.customer.findFirst({
          where: {
            id: data.customer_id,
            organisation_id: organisationId,
          },
        });

        if (!customer) {
          throw new Error(
            "Customer not found or does not belong to organisation"
          );
        }

        // 6. Get beneficiary and validate it belongs to the customer
        const beneficiary = await tx.beneficiary.findFirst({
          where: {
            id: data.beneficiary_id,
            customer_id: data.customer_id,
          },
        });

        if (!beneficiary) {
          throw new Error(
            "Beneficiary not found or does not belong to customer"
          );
        }

        // 7. Check organisation balance for destination organisation
        if (data.destination_organisation_id) {
          const orgBalance = await tx.orgBalance.findFirst({
            where: {
              base_org_id: organisationId,
              dest_org_id: data.destination_organisation_id,
              currency_id: data.origin_currency_id,
            },
          });

          if (
            !orgBalance ||
            parseFloat(orgBalance.balance.toString()) < data.origin_amount
          ) {
            throw new Error(
              "Insufficient organisation balance for this transaction"
            );
          }
        }

        // 8. Calculate transaction charges
        const chargeCalculation = await this.calculateTransactionCharges(
          data.origin_amount,
          data.origin_currency_id,
          data.dest_currency_id,
          organisationId,
          data.destination_organisation_id,
          data.corridor_id
        );

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
            amount_payable: data.origin_amount,
            amount_receivable: data.dest_amount,
            status: "PENDING_APPROVAL",
            remittance_status: "PENDING",
            request_status: "UNDER_REVIEW",
          },
        });

        // 11. Create transaction charges
        const transactionCharges = await Promise.all(
          chargeCalculation.charges.map((charge) =>
            tx.transactionCharge.create({
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
              },
            })
          )
        );

        // 12. Get the created transaction with relations
        const createdTransaction = await tx.transaction.findUnique({
          where: { id: transaction.id },
          include: {
            corridor: {
              include: {
                base_country: true,
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
    } catch (error) {
      console.error("Error creating outbound transaction:", error);
      throw new Error("Failed to create outbound transaction");
    }
  }

  // Cancel Transaction
  async cancelTransaction(
    transactionId: string,
    data: CancelTransactionRequest,
    userId: string
  ): Promise<TransactionResponse> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get transaction
        const transaction = await tx.transaction.findUnique({
          where: { id: transactionId },
          include: {
            transaction_charges: true,
          },
        });

        if (!transaction) {
          throw new Error("Transaction not found");
        }

        // Check if transaction can be cancelled
        if (!["PENDING", "PENDING_APPROVAL"].includes(transaction.status)) {
          throw new Error("Transaction cannot be cancelled in current status");
        }

        if (transaction.remittance_status !== "PENDING") {
          throw new Error(
            "Transaction cannot be cancelled when remittance status is not pending"
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

        // Get updated transaction with relations
        const result = await tx.transaction.findUnique({
          where: { id: transactionId },
          include: {
            corridor: {
              include: {
                base_country: true,
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
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      throw new Error("Failed to cancel transaction");
    }
  }

  // Approve Transaction
  async approveTransaction(
    transactionId: string,
    data: ApproveTransactionRequest,
    userId: string
  ): Promise<TransactionResponse> {
    try {
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
          throw new Error("Transaction not found");
        }

        // Check if transaction can be approved
        if (!["PENDING", "PENDING_APPROVAL"].includes(transaction.status)) {
          throw new Error("Transaction cannot be approved in current status");
        }

        // Update transaction status
        const updatedTransaction = await tx.transaction.update({
          where: { id: transactionId },
          data: {
            status: "APPROVED",
            remarks: data.remarks
              ? `${transaction.remarks || ""}\nApproved: ${data.remarks}`.trim()
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
            status: "APPROVED",
            updated_at: new Date(),
          },
        });

        // Create GL Transaction for the approved transaction
        await this.createGLTransactionForApprovedTransaction(
          transaction,
          userId
        );

        // If internal integration, create corresponding inbound transaction
        if (
          transaction.destination_organisation?.integration_mode === "INTERNAL"
        ) {
          await this.createInboundTransaction(transaction, userId);
        }

        // Get updated transaction with relations
        const result = await tx.transaction.findUnique({
          where: { id: transactionId },
          include: {
            corridor: {
              include: {
                base_country: true,
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
    } catch (error) {
      console.error("Error approving transaction:", error);
      throw new Error("Failed to approve transaction");
    }
  }

  // Reverse Transaction
  async reverseTransaction(
    transactionId: string,
    data: ReverseTransactionRequest,
    userId: string
  ): Promise<TransactionResponse> {
    try {
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
          throw new Error("Transaction not found");
        }

        // Check if transaction can be reversed
        if (transaction.status !== "APPROVED") {
          throw new Error("Only approved transactions can be reversed");
        }

        if (transaction.remittance_status !== "PENDING") {
          throw new Error(
            "Transaction cannot be reversed when remittance status is not pending"
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

        // Create reverse GL Transaction
        await this.createReverseGLTransactionForTransaction(
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
                base_country: true,
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
    } catch (error) {
      console.error("Error reversing transaction:", error);
      throw new Error("Failed to reverse transaction");
    }
  }

  // Get Transactions
  async getTransactions(
    organisationId: string,
    filters: TransactionFilters
  ): Promise<TransactionListResponse> {
    try {
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
                base_country: true,
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
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw new Error("Failed to fetch transactions");
    }
  }

  // Get Transaction by ID
  async getTransactionById(
    transactionId: string
  ): Promise<TransactionResponse> {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id: transactionId },
        include: {
          corridor: {
            include: {
              base_country: true,
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

      if (!transaction) {
        throw new Error("Transaction not found");
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
          transaction_charges: transaction.transaction_charges.map(
            (charge) => ({
              ...charge,
              amount: parseFloat(charge.amount.toString()),
              rate: charge.rate ? parseFloat(charge.rate.toString()) : null,
              created_at: charge.created_at.toISOString(),
              updated_at: charge.updated_at.toISOString(),
            })
          ),
        } as unknown as ITransaction,
      };
    } catch (error) {
      console.error("Error fetching transaction:", error);
      throw new Error("Failed to fetch transaction");
    }
  }

  // Get Transaction Stats
  async getTransactionStats(
    organisationId: string
  ): Promise<TransactionStatsResponse> {
    try {
      const where = {
        OR: [
          { origin_organisation_id: organisationId },
          { destination_organisation_id: organisationId },
        ],
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
            count: item._count.id,
            amount: item._sum.origin_amount
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
            organisation_id: item.origin_organisation_id,
            organisation_name: org?.name || "Unknown",
            count: item._count.id,
            amount: item._sum.origin_amount
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
          totalAmount: amountData._sum.origin_amount
            ? parseFloat(amountData._sum.origin_amount.toString())
            : 0,
          byStatus: statusData.map((item) => ({
            status: item.status,
            count: item._count.id,
            amount: item._sum.origin_amount
              ? parseFloat(item._sum.origin_amount.toString())
              : 0,
          })),
          byDirection: directionData.map((item) => ({
            direction: item.direction,
            count: item._count.id,
            amount: item._sum.origin_amount
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
    } catch (error) {
      console.error("Error fetching transaction stats:", error);
      throw new Error("Failed to fetch transaction stats");
    }
  }

  // Helper Methods

  // Calculate Transaction Charges
  private async calculateTransactionCharges(
    originAmount: number,
    originCurrencyId: string,
    destCurrencyId: string,
    originOrganisationId: string,
    destinationOrganisationId?: string,
    corridorId?: string
  ): Promise<TransactionChargeCalculation> {
    try {
      // Get applicable charges
      const charges = await prisma.charge.findMany({
        where: {
          status: "ACTIVE",
          direction: { in: ["OUTBOUND", "BOTH"] },
          OR: [
            { origin_organisation_id: originOrganisationId },
            { destination_organisation_id: destinationOrganisationId },
            { origin_organisation_id: null, destination_organisation_id: null }, // Global charges
          ],
        },
      });

      const calculatedCharges = [];
      let totalCharges = 0;

      for (const charge of charges) {
        let amount = 0;

        if (charge.application_method === "PERCENTAGE") {
          amount = (originAmount * charge.rate) / 100;
        } else {
          amount = charge.rate;
        }

        // Apply min/max limits
        if (charge.min_amount && amount < charge.min_amount) {
          amount = charge.min_amount;
        }
        if (charge.max_amount && amount > charge.max_amount) {
          amount = charge.max_amount;
        }

        calculatedCharges.push({
          charge_id: charge.id,
          type: charge.type,
          amount,
          rate: charge.application_method === "PERCENTAGE" ? charge.rate : null,
          description: `${charge.name}: ${charge.description}`,
          is_reversible: charge.is_reversible,
          internal_amount: charge.origin_share_percentage
            ? (originAmount * charge.origin_share_percentage) / 100
            : null,
          internal_percentage: charge.origin_share_percentage
            ? charge.origin_share_percentage
            : null,
          external_amount: charge.destination_share_percentage
            ? (originAmount * charge.destination_share_percentage) / 100
            : null,
          external_percentage: charge.destination_share_percentage
            ? charge.destination_share_percentage
            : null,
        });

        totalCharges += amount;
      }

      return {
        totalCharges,
        netAmount: originAmount - totalCharges,
        charges: calculatedCharges,
      };
    } catch (error) {
      console.error("Error calculating transaction charges:", error);
      throw new Error("Failed to calculate transaction charges");
    }
  }

  // Generate Transaction Number
  private async generateTransactionNumber(
    organisationId: string
  ): Promise<string> {
    try {
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
    } catch (error) {
      console.error("Error generating transaction number:", error);
      throw new Error("Failed to generate transaction number");
    }
  }

  // Create GL Transaction for Approved Transaction
  private async createGLTransactionForApprovedTransaction(
    transaction: any,
    userId: string
  ): Promise<void> {
    try {
      const organisationId = transaction.origin_organisation_id;

      // Get GL accounts
      const tillGlAccountId = await glTransactionService.getGlAccountForEntity(
        "TILL",
        transaction.till_id,
        organisationId
      );

      const accountsReceivableGlAccountId =
        await glTransactionService.getGlAccountForEntity(
          "ORG_BALANCE",
          transaction.destination_organisation_id,
          organisationId
        );

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

      if (tillGlAccountId && accountsReceivableGlAccountId) {
        const glEntries = [
          {
            gl_account_id: tillGlAccountId,
            amount: transaction.origin_amount,
            dr_cr: "CR" as const,
            description: `Till cash decreased by ${transaction.origin_amount}`,
          },
          {
            gl_account_id: accountsReceivableGlAccountId,
            amount: transaction.dest_amount,
            dr_cr: "DR" as const,
            description: `Accounts receivable increased by ${transaction.dest_amount}`,
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

        await glTransactionService.createGlTransaction(
          organisationId,
          {
            transaction_type: "OUTBOUND_TRANSACTION",
            amount: transaction.origin_amount,
            currency_id: transaction.origin_currency_id,
            description: `Outbound transaction: ${transaction.transaction_no}`,
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
    } catch (error) {
      console.error(
        "Error creating GL transaction for approved transaction:",
        error
      );
      throw new Error("Failed to create GL transaction");
    }
  }

  // Create Reverse GL Transaction for Transaction
  private async createReverseGLTransactionForTransaction(
    transaction: any,
    reason: string,
    userId: string
  ): Promise<void> {
    try {
      const organisationId = transaction.origin_organisation_id;

      // Get GL accounts
      const tillGlAccountId = await glTransactionService.getGlAccountForEntity(
        "TILL",
        transaction.till_id,
        organisationId
      );

      const accountsReceivableGlAccountId =
        await glTransactionService.getGlAccountForEntity(
          "ORG_BALANCE",
          transaction.destination_organisation_id,
          organisationId
        );

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

      if (tillGlAccountId && accountsReceivableGlAccountId) {
        const glEntries = [
          {
            gl_account_id: tillGlAccountId,
            amount: transaction.origin_amount,
            dr_cr: "DR" as const,
            description: `Till cash increased by ${transaction.origin_amount} (reversal)`,
          },
          {
            gl_account_id: accountsReceivableGlAccountId,
            amount: transaction.dest_amount,
            dr_cr: "CR" as const,
            description: `Accounts receivable decreased by ${transaction.dest_amount} (reversal)`,
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
            amount: transaction.origin_amount,
            currency_id: transaction.origin_currency_id,
            description: `Outbound transaction reversal: ${transaction.transaction_no} - ${reason}`,
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
    } catch (error) {
      console.error("Error creating reverse GL transaction:", error);
      throw new Error("Failed to create reverse GL transaction");
    }
  }

  // Create Inbound Transaction for Internal Integration
  private async createInboundTransaction(
    transaction: any,
    userId: string
  ): Promise<void> {
    try {
      // This would create a corresponding inbound transaction for the destination organisation
      // Implementation depends on the specific business logic for internal transactions
      console.log(
        "Creating inbound transaction for internal integration:",
        transaction.id
      );
      // TODO: Implement inbound transaction creation logic
    } catch (error) {
      console.error("Error creating inbound transaction:", error);
      throw new Error("Failed to create inbound transaction");
    }
  }
}
