import { ChargeType, type Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.lib";
import { GlTransactionService } from "../gltransactions/gltransactions.services";
import type {
  IChargesPayment,
  IChargesPaymentItem,
  CreateChargesPaymentRequest,
  ApproveChargesPaymentRequest,
  ReverseChargesPaymentRequest,
  ChargesPaymentFilters,
  PendingTransactionChargesFilters,
  ChargesPaymentListResponse,
  ChargesPaymentResponse,
  ChargesPaymentItemsResponse,
  PendingTransactionChargesResponse,
  ChargesPaymentStatsResponse,
  PendingCommissionSplitResponse,
} from "./chargespayments.interfaces";
import { CreateGlEntryRequest } from "../gltransactions/gltransactions.interfaces";
import {
  AppError,
  InsufficientFundsError,
  NotFoundError,
  ValidationError,
} from "../../utils/AppError";
import { Decimal } from "@prisma/client/runtime/library";
type Tx = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

export class ChargesPaymentService {
  private glTransactionService = new GlTransactionService();
  // Generate reference number for charges payment
  private async generateReferenceNumber(
    type: ChargeType,
    organisationId: string,
    originOrgId: string,
    tx: Tx
  ): Promise<string> {
    const db = tx || prisma;
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const org = await db.organisation.findUnique({
      where: { id: organisationId },
      select: { name: true },
    });
    const orgCode = org?.name?.substring(0, 3).toUpperCase() || "ORG";
    const originOrg = await db.organisation.findUnique({
      where: { id: originOrgId },
      select: { name: true },
    });
    const originOrgCode =
      originOrg?.name?.substring(0, 3).toUpperCase() || "ORG";

    // Get count of payments for this type today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await db.chargesPayment.count({
      where: {
        type,
        organisation_id: originOrgId,
        created_at: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(3, "0");
    return `PAY-${dateStr}-${type.toUpperCase()}-${orgCode}-${originOrgCode}-${sequence}`;
  }

  // Get pending transaction charges
  async getPendingTransactionCharges(
    filters: PendingTransactionChargesFilters
  ): Promise<PendingTransactionChargesResponse> {
    const { organisation_id, ...otherFilters } = filters;

    const {
      page = 1,
      limit = 10,
      search,
      type,
      destination_org_id,
      currency_id,
      date_from,
      date_to,
      amount_min,
      amount_max,
    } = otherFilters;

    const skip = (page - 1) * limit;

    const where: any = {};

    where.status = "APPROVED";
    where.transaction = {
      ...where.transaction,
      status: "COMPLETED",
      remittance_status: "PAID",
    };

    if (organisation_id) {
      where.transaction = {
        ...where.transaction,
        OR: [
          { destination_organisation_id: organisation_id },
          { organisation_id: organisation_id },
        ],
      };
    } else {
      if (destination_org_id) {
        where.transaction = {
          ...where.transaction,
          destination_organisation_id: destination_org_id,
        };
      }
    }

    if (search) {
      where.OR = [
        {
          transaction: {
            transaction_no: { contains: search, mode: "insensitive" },
          },
        },
        {
          charge: {
            name: { contains: search, mode: "insensitive" },
          },
        },
      ];
    }

    if (type) where.type = type;

    if (currency_id) {
      where.transaction = {
        ...where.transaction,
        origin_currency_id: currency_id,
      };
    }

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (amount_min || amount_max) {
      where.amount = {};
      if (amount_min) where.amount.gte = amount_min;
      if (amount_max) where.amount.lte = amount_max;
    }

    const [transactionCharges, total] = await Promise.all([
      prisma.transactionCharge.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          transaction: {
            include: {
              customer: true,
              beneficiary: true,
              origin_currency: true,
              dest_currency: true,
              origin_organisation: true,
              destination_organisation: true,
            },
          },
          charge: true,
          organisation: true,
        },
      }),
      prisma.transactionCharge.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Pending transaction charges retrieved successfully",
      data: {
        transaction_charges: transactionCharges.map((charge) => ({
          ...charge,
          amount: parseFloat(charge.amount.toString()),
          internal_amount: charge.internal_amount
            ? parseFloat(charge.internal_amount.toString())
            : null,
          external_amount: charge.external_amount
            ? parseFloat(charge.external_amount.toString())
            : null,
          rate: charge.rate ? parseFloat(charge.rate.toString()) : null,
          origin_amount: charge.origin_amount
            ? parseFloat(charge.origin_amount.toString())
            : null,
          destination_amount: charge.destination_amount
            ? parseFloat(charge.destination_amount.toString())
            : null,
          created_at: charge.created_at.toISOString(),
          updated_at: charge.updated_at.toISOString(),
          transaction: charge.transaction
            ? {
                ...charge.transaction,
                origin_amount: parseFloat(
                  charge.transaction.origin_amount.toString()
                ),
                dest_amount: parseFloat(
                  charge.transaction.dest_amount.toString()
                ),
                created_at:
                  charge.transaction.created_at?.toISOString() || null,
              }
            : undefined,
        })) as any,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  }

  // Get pending charges stats
  async getPendingChargesStats(
    filters: PendingTransactionChargesFilters
  ): Promise<ChargesPaymentStatsResponse> {
    const { organisation_id } = filters;

    const where: any = {};

    where.status = "APPROVED";
    where.transaction = {
      ...where.transaction,
      status: "COMPLETED",
      remittance_status: "PAID",
    };

    if (organisation_id) {
      where.transaction = {
        ...where.transaction,
        OR: [
          { origin_organisation_id: organisation_id },
          { destination_organisation_id: organisation_id },
        ],
      };
    }

    const [totalCount, amountData, typeData] = await Promise.all([
      prisma.transactionCharge.count({ where }),
      prisma.transactionCharge.aggregate({
        where,
        _sum: { amount: true },
      }),
      prisma.transactionCharge.groupBy({
        by: ["type"],
        where,
        _count: { id: true },
        _sum: { amount: true },
      }),
    ]);

    // Calculate other charges (commission + internal_fee)
    const commissionCount =
      typeData.find((t) => t.type === "COMMISSION")?._count?.id || 0;
    const internalFeeCount =
      typeData.find((t) => t.type === "INTERNAL_FEE")?._count?.id || 0;
    const commissionAmount =
      typeData.find((t) => t.type === "COMMISSION")?._sum?.amount || 0;
    const internalFeeAmount =
      typeData.find((t) => t.type === "INTERNAL_FEE")?._sum?.amount || 0;

    const otherChargesCount = commissionCount + internalFeeCount;
    const otherChargesAmount =
      parseFloat(commissionAmount.toString()) +
      parseFloat(internalFeeAmount.toString());

    return {
      success: true,
      message: "Pending charges stats retrieved successfully",
      data: {
        totalPendingCharges: totalCount,
        totalPendingAmount: amountData._sum?.amount
          ? parseFloat(amountData._sum.amount.toString())
          : 0,
        byType: [
          ...typeData
            .filter((t) => t.type === "TAX")
            .map((item) => ({
              type: item.type,
              count: item._count?.id || 0,
              amount: item._sum?.amount
                ? parseFloat(item._sum.amount.toString())
                : 0,
            })),
          {
            type: "OTHER" as ChargeType,
            count: otherChargesCount,
            amount: otherChargesAmount,
          },
        ],
        byOrganisation: [],
        byCurrency: [],
      },
    };
  }

  // Get charge payments stats
  async getChargePaymentsStats(
    filters: ChargesPaymentFilters
  ): Promise<ChargesPaymentStatsResponse> {
    const { organisation_id } = filters;
    const where: any = {};

    if (organisation_id) {
      where.OR = [
        { organisation_id: organisation_id },
        { destination_org_id: organisation_id },
      ];
    }

    const [
      pendingCount,
      pendingAmount,
      completedCount,
      completedAmount,
      typeData,
    ] = await Promise.all([
      // Pending payments
      prisma.chargesPayment.count({
        where: {
          ...where,
          status: "PENDING" as const,
        },
      }),
      prisma.chargesPayment.aggregate({
        where: {
          ...where,
          status: "PENDING" as const,
        },
        _sum: { internal_total_amount: true },
      }),
      // Completed payments
      prisma.chargesPayment.count({
        where: {
          ...where,
          status: "COMPLETED" as const,
        },
      }),
      prisma.chargesPayment.aggregate({
        where: {
          ...where,
          status: "COMPLETED" as const,
        },
        _sum: { internal_total_amount: true },
      }),
      // By type
      prisma.chargesPayment.groupBy({
        by: ["type", "status"],
        where: {
          ...where,
        },
        _count: { id: true },
        _sum: { internal_total_amount: true },
      }),
    ]);

    // Group by type and status
    const statsByType = typeData.reduce((acc, item) => {
      const key = item.type;
      if (!acc[key]) {
        acc[key] = {
          pending: { count: 0, amount: 0 },
          completed: { count: 0, amount: 0 },
        };
      }
      if (item.status === "PENDING") {
        acc[key].pending.count = item._count?.id || 0;
        acc[key].pending.amount = item._sum?.internal_total_amount
          ? parseFloat(item._sum.internal_total_amount.toString())
          : 0;
      } else if (item.status === "COMPLETED") {
        acc[key].completed.count = item._count?.id || 0;
        acc[key].completed.amount = item._sum?.internal_total_amount
          ? parseFloat(item._sum.internal_total_amount.toString())
          : 0;
      }
      return acc;
    }, {} as Record<string, { pending: { count: number; amount: number }; completed: { count: number; amount: number } }>);

    return {
      success: true,
      message: "Charge payments stats retrieved successfully",
      data: {
        totalPendingCharges: pendingCount,
        totalPendingAmount: pendingAmount._sum?.internal_total_amount
          ? parseFloat(pendingAmount._sum.internal_total_amount.toString())
          : 0,
        totalCompletedPayments: completedCount,
        totalCompletedAmount: completedAmount._sum?.internal_total_amount
          ? parseFloat(completedAmount._sum.internal_total_amount.toString())
          : 0,
        byType: Object.entries(statsByType).map(([type, stats]) => ({
          type: type as ChargeType,
          count: stats.pending.count + stats.completed.count,
          amount: stats.pending.amount + stats.completed.amount,
          pendingCount: stats.pending.count,
          pendingAmount: stats.pending.amount,
          completedCount: stats.completed.count,
          completedAmount: stats.completed.amount,
        })),
        byOrganisation: [],
        byCurrency: [],
      },
    };
  }

  // Create charges payment
  async createChargesPayment(
    data: CreateChargesPaymentRequest,
    userId: string
  ): Promise<ChargesPaymentResponse> {
    return await prisma.$transaction(async (tx) => {
      const customerOrgnisation = await tx.organisation.findFirst({
        where: {
          type: "CUSTOMER",
        },
      });

      if (!customerOrgnisation) {
        throw new AppError("Customer organisation not found", 404);
      }
      // Validate transaction charges exist and are approved
      const transactionCharges = await tx.transactionCharge.findMany({
        where: {
          id: { in: data.transaction_charge_ids },
          status: "APPROVED" as const,
        },
        include: {
          transaction: {
            include: {
              origin_currency: true,
              destination_organisation: true,
              origin_organisation: true,
            },
          },
          charge: true,
        },
      });

      if (transactionCharges.length !== data.transaction_charge_ids.length) {
        throw new AppError(
          "Some transaction charges are invalid or not approved",
          400
        );
      }

      // Group charges by type and destination organization
      const groupedCharges = new Map<string, typeof transactionCharges>();

      transactionCharges.forEach((tc) => {
        const originOrgId = tc.transaction.origin_organisation_id || "null";
        const destinationOrgId =
          tc.transaction.destination_organisation_id || "null";
        const key = `${tc.type}_${originOrgId}_${destinationOrgId}`;
        if (!groupedCharges.has(key)) {
          groupedCharges.set(key, []);
        }
        groupedCharges.get(key)!.push(tc);
      });

      const createdPayments: any[] = [];

      // Create a payment for each group
      for (const [key, charges] of groupedCharges) {
        const [chargeType, originOrgId, destOrgId] = key.split("_");
        const destOrgIdValue = destOrgId === "null" ? null : destOrgId;
        const originOrgIdValue = originOrgId === "null" ? null : originOrgId;
        // Get currency from first transaction in the group
        const currency = charges[0].transaction?.origin_currency;
        if (!currency) {
          throw new NotFoundError("Currency not found for transaction");
        }

        // Calculate totals for this group
        const totalCost = charges.reduce(
          (sum, tc) => sum + parseFloat((tc.amount || 0).toString()),
          0
        );
        const internalTotal = charges.reduce(
          (sum, tc) => sum + parseFloat((tc.internal_amount || 0).toString()),
          0
        );
        const externalTotal = charges.reduce(
          (sum, tc) => sum + parseFloat((tc.external_amount || 0).toString()),
          0
        );

        const originTotal = charges.reduce(
          (sum, tc) => sum + parseFloat((tc.origin_amount || 0).toString()),
          0
        );
        const destinationTotal = charges.reduce(
          (sum, tc) =>
            sum + parseFloat((tc.destination_amount || 0).toString()),
          0
        );

        // Generate reference number
        const referenceNumber = await this.generateReferenceNumber(
          chargeType as ChargeType,
          customerOrgnisation.id,
          originOrgIdValue ?? "",
          tx
        );

        console.log("referenceNumber", referenceNumber);

        // Create charges payment for this group
        const chargesPayment = await tx.chargesPayment.create({
          data: {
            type: chargeType as ChargeType,
            amount: totalCost,
            internal_total_amount: internalTotal,
            external_total_amount: externalTotal,
            origin_total_amount: originTotal,
            destination_total_amount: destinationTotal,
            reference_number: referenceNumber,
            currency_id: currency.id,
            destination_org_id: destOrgIdValue,
            status: "PENDING" as const,
            date_completed: new Date(), // Will be updated when approved
            notes: data.notes,
            organisation_id: originOrgIdValue,
            created_by: userId,
          } as any,
        });

        // Create payment items for this group
        await Promise.all(
          charges.map((tc) =>
            tx.chargesPaymentItem.create({
              data: {
                charges_payment_id: chargesPayment.id,
                transaction_charges_id: tc.id,
                internal_amount_settled: tc.internal_amount || 0,
                external_amount_settled: tc.external_amount || 0,
                origin_amount_settled: tc.origin_amount || 0,
                destination_amount_settled: tc.destination_amount || 0,
                amount_settled: tc.amount || 0,
              },
            })
          )
        );

        // Update transaction charges status to PROCESSING
        await Promise.all(
          charges.map((tc) =>
            tx.transactionCharge.update({
              where: { id: tc.id },
              data: {
                status: "PROCESSING",
              },
            })
          )
        );

        createdPayments.push(chargesPayment);
      }

      // Get the first created payment with relations (for backward compatibility)
      const firstPayment = createdPayments[0];
      const result = await tx.chargesPayment.findUnique({
        where: { id: firstPayment.id },
        include: {
          currency: true,
          destination_org: true,
          created_by_user: true,
          organisation: true,
          payment_items: {
            include: {
              transaction_charges: {
                include: {
                  transaction: true,
                  charge: true,
                  organisation: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: `Charges payments created successfully (${
          createdPayments.length
        } payment${createdPayments.length > 1 ? "s" : ""} created)`,
        data: {
          ...result!,
          internal_total_amount: parseFloat(
            result!.internal_total_amount?.toString() || "0"
          ),
          external_total_amount: parseFloat(
            result!.external_total_amount?.toString() || "0"
          ),
          date_completed: result!.date_completed?.toISOString() || null,
          created_at: result!.created_at.toISOString(),
          updated_at: result!.updated_at.toISOString(),
          payment_items: result!.payment_items.map((item) => ({
            ...item,
            internal_amount_settled: parseFloat(
              item.internal_amount_settled?.toString() || "0"
            ),
            external_amount_settled: parseFloat(
              item.external_amount_settled?.toString() || "0"
            ),
            origin_amount_settled: parseFloat(
              item.origin_amount_settled?.toString() || "0"
            ),
            destination_amount_settled: parseFloat(
              item.destination_amount_settled?.toString() || "0"
            ),
            amount_settled: parseFloat(item.amount_settled?.toString() || "0"),
            created_at: item.created_at.toISOString(),
          })),
        } as any,
      };
    });
  }

  // Get charges payments
  async getChargesPayments(
    filters: ChargesPaymentFilters
  ): Promise<ChargesPaymentListResponse> {
    const {
      organisation_id,
      page = 1,
      limit = 10,
      search,
      type,
      status,
      destination_org_id,
      currency_id,
      date_from,
      date_to,
      amount_min,
      amount_max,
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (organisation_id) {
      where.OR = [
        { organisation_id: organisation_id },
        { destination_org_id: organisation_id },
      ];
    }
    if (search) {
      where.OR = [
        { reference_number: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) where.type = type;
    if (status) where.status = status;
    if (destination_org_id) where.destination_org_id = destination_org_id;
    if (currency_id) where.currency_id = currency_id;

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (amount_min || amount_max) {
      where.internal_total_amount = {};
      if (amount_min) where.internal_total_amount.gte = amount_min;
      if (amount_max) where.internal_total_amount.lte = amount_max;
    }

    const [chargesPayments, total] = await Promise.all([
      prisma.chargesPayment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          currency: true,
          destination_org: true,
          created_by_user: true,
          organisation: true,
          payment_items: {
            include: {
              transaction_charges: {
                include: {
                  transaction: true,
                  charge: true,
                  organisation: true,
                },
              },
              commission_split: true,
            },
          },
        },
      }),
      prisma.chargesPayment.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Charges payments retrieved successfully",
      data: {
        charges_payments: chargesPayments.map((payment) => ({
          ...payment,
          internal_total_amount: parseFloat(
            payment.internal_total_amount?.toString() || "0"
          ),
          external_total_amount: parseFloat(
            payment.external_total_amount?.toString() || "0"
          ),
          origin_total_amount: parseFloat(
            payment.origin_total_amount?.toString() || "0"
          ),
          destination_total_amount: parseFloat(
            payment.destination_total_amount?.toString() || "0"
          ),
          date_completed: payment.date_completed?.toISOString() || null,
          created_at: payment.created_at.toISOString(),
          updated_at: payment.updated_at.toISOString(),
          payment_items: payment.payment_items.map((item) => ({
            ...item,
            internal_amount_settled: parseFloat(
              item.internal_amount_settled?.toString() || "0"
            ),
            external_amount_settled: parseFloat(
              item.external_amount_settled?.toString() || "0"
            ),
            amount_settled: parseFloat(item.amount_settled?.toString() || "0"),
            created_at: item.created_at.toISOString(),
          })),
        })) as unknown as IChargesPayment[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  }

  // Get charges payment by ID
  async getChargesPaymentById(
    paymentId: string
  ): Promise<ChargesPaymentResponse> {
    const chargesPayment = await prisma.chargesPayment.findUnique({
      where: { id: paymentId },
      include: {
        currency: true,
        destination_org: true,
        created_by_user: true,
        organisation: true,
        payment_items: {
          include: {
            transaction_charges: {
              include: {
                transaction: {
                  include: {
                    customer: true,
                    beneficiary: true,
                    origin_currency: true,
                    dest_currency: true,
                    origin_organisation: true,
                    destination_organisation: true,
                  },
                },
                charge: true,
                organisation: true,
              },
            },
          },
        },
      },
    });

    if (!chargesPayment) {
      throw new NotFoundError("Charges payment not found");
    }

    return {
      success: true,
      message: "Charges payment retrieved successfully",
      data: {
        ...chargesPayment,
        internal_total_amount: parseFloat(
          chargesPayment.internal_total_amount?.toString() || "0"
        ),
        external_total_amount: parseFloat(
          chargesPayment.external_total_amount?.toString() || "0"
        ),
        origin_total_amount: parseFloat(
          chargesPayment.origin_total_amount?.toString() || "0"
        ),
        destination_total_amount: parseFloat(
          chargesPayment.destination_total_amount?.toString() || "0"
        ),
        date_completed: chargesPayment.date_completed?.toISOString() || null,
        created_at: chargesPayment.created_at.toISOString(),
        updated_at: chargesPayment.updated_at.toISOString(),
        payment_items: chargesPayment.payment_items.map((item) => ({
          ...item,
          internal_amount_settled: parseFloat(
            item.internal_amount_settled?.toString() || "0"
          ),
          external_amount_settled: parseFloat(
            item.external_amount_settled?.toString() || "0"
          ),
          created_at: item.created_at.toISOString(),
        })),
      } as any,
    };
  }

  // Approve charges payment
  async approveChargesPayment(
    paymentId: string,
    data: ApproveChargesPaymentRequest
  ): Promise<ChargesPaymentResponse> {
    return await prisma.$transaction(async (tx) => {
      const chargesPayment = await tx.chargesPayment.findUnique({
        where: { id: paymentId },
        include: {
          payment_items: {
            include: {
              transaction_charges: {
                include: {
                  charge: true,
                },
              },
            },
          },
        },
      });

      if (!chargesPayment) {
        throw new NotFoundError("Charges payment not found");
      }

      if (chargesPayment.status !== "PENDING") {
        throw new AppError(
          "Only pending charges payments can be approved",
          400
        );
      }

      // Update charges payment status
      const updatedPayment = await tx.chargesPayment.update({
        where: { id: paymentId },
        data: {
          status: "COMPLETED",
          date_completed: new Date(),
          notes: data.notes
            ? `${chargesPayment.notes || ""}\nApproved: ${data.notes}`.trim()
            : chargesPayment.notes,
          updated_at: new Date(),
        },
      });

      // Update transaction charges status
      if (chargesPayment.payment_items.length > 0) {
        await Promise.all(
          chargesPayment.payment_items.map((item) =>
            tx.transactionCharge.update({
              where: { id: item?.transaction_charges_id || "" },
              data: { status: "PAID" },
            })
          )
        );
      }

      // Prepare GL entries for all payment items
      const glEntries = [];

      for (const item of chargesPayment.payment_items) {
        const transactionCharge = item.transaction_charges;
        const charge = transactionCharge?.charge;

        // Get the REVENUE account for this charge
        const revenueAccount = await tx.glAccount.findFirst({
          where: {
            charge_id: charge?.id,
            organisation_id: chargesPayment.organisation_id,
            type: "REVENUE",
          },
        });

        if (!revenueAccount) {
          throw new AppError(
            `Revenue account not found for charge ${charge?.name}`,
            404
          );
        }

        // Get the LIABILITY (PAYABLE) account for this charge
        const liabilityAccount = await tx.glAccount.findFirst({
          where: {
            charge_id: charge?.id,
            organisation_id: chargesPayment.organisation_id,
            type: "LIABILITY",
          },
        });

        if (!liabilityAccount) {
          throw new AppError(
            `Liability account not found for charge ${charge?.name}`,
            404
          );
        }

        // Add GL entries for this payment item
        glEntries.push(
          {
            gl_account_id: revenueAccount.id,
            amount: parseFloat(item.external_amount_settled?.toString() || "0"),
            dr_cr: "CR" as const,
            description: `Revenue from ${charge?.name} - ${chargesPayment.reference_number}`,
          },
          {
            gl_account_id: liabilityAccount.id,
            amount: parseFloat(item.external_amount_settled?.toString() || "0"),
            dr_cr: "DR" as const,
            description: `Payment of ${charge?.name} liability - ${chargesPayment.reference_number}`,
          }
        );
      }

      // Create GL transaction using the service
      await this.glTransactionService.createGlTransaction(
        chargesPayment.organisation_id!,
        {
          transaction_type: "CHARGES_PAYMENT", // Using existing type temporarily
          amount: parseFloat(
            chargesPayment.external_total_amount?.toString() || "0"
          ),
          currency_id: chargesPayment.currency_id || undefined,
          description: `Charges payment approved - ${chargesPayment.reference_number}`,
          gl_entries: glEntries,
        },
        chargesPayment.created_by!
      );

      // Get updated payment with relations
      const result = await tx.chargesPayment.findUnique({
        where: { id: paymentId },
        include: {
          currency: true,
          destination_org: true,
          created_by_user: true,
          organisation: true,
          payment_items: {
            include: {
              transaction_charges: {
                include: {
                  transaction: true,
                  charge: true,
                  organisation: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: "Charges payment approved successfully",
        data: {
          ...result!,
          internal_total_amount: parseFloat(
            result!.internal_total_amount?.toString() || "0"
          ),
          external_total_amount: parseFloat(
            result!.external_total_amount?.toString() || "0"
          ),
          origin_total_amount: parseFloat(
            result!.origin_total_amount?.toString() || "0"
          ),
          destination_total_amount: parseFloat(
            result!.destination_total_amount?.toString() || "0"
          ),
          date_completed: result!.date_completed?.toISOString() || null,
          created_at: result!.created_at.toISOString(),
          updated_at: result!.updated_at.toISOString(),
          payment_items: result!.payment_items.map((item) => ({
            ...item,
            internal_amount_settled: parseFloat(
              item.internal_amount_settled?.toString() || "0"
            ),
            external_amount_settled: parseFloat(
              item.external_amount_settled?.toString() || "0"
            ),
            amount_settled: parseFloat(item.amount_settled?.toString() || "0"),
            created_at: item.created_at.toISOString(),
          })),
        } as any,
      };
    });
  }

  // Reverse charges payment
  async reverseChargesPayment(
    paymentId: string,
    data: ReverseChargesPaymentRequest,
    userId: string
  ): Promise<ChargesPaymentResponse> {
    return await prisma.$transaction(async (tx) => {
      const chargesPayment = await tx.chargesPayment.findUnique({
        where: { id: paymentId },
        include: {
          payment_items: {
            include: {
              transaction_charges: {
                include: {
                  charge: true,
                },
              },
            },
          },
        },
      });

      if (!chargesPayment) {
        throw new NotFoundError("Charges payment not found");
      }

      if (chargesPayment.status !== "COMPLETED") {
        throw new AppError(
          "Only completed charges payments can be reversed",
          400
        );
      }

      // Update charges payment status
      await tx.chargesPayment.update({
        where: { id: paymentId },
        data: {
          status: "FAILED",
          notes: `${chargesPayment.notes || ""}\nReversed: ${data.reason}${
            data.notes ? ` - ${data.notes}` : ""
          }`.trim(),
          updated_at: new Date(),
        },
      });

      // Update transaction charges status back to pending
      if (chargesPayment.payment_items.length > 0) {
        await Promise.all(
          chargesPayment.payment_items.map(
            (item: { transaction_charges_id: any }) =>
              tx.transactionCharge.update({
                where: { id: item.transaction_charges_id || "" },
                data: { status: "PENDING" },
              })
          )
        );
      }

      // Prepare GL entries for all payment items
      const glEntries = [];

      for (const item of chargesPayment.payment_items) {
        const transactionCharge = item.transaction_charges;
        const charge = transactionCharge?.charge;

        // Get the REVENUE account for this charge
        const revenueAccount = await tx.glAccount.findFirst({
          where: {
            charge_id: charge?.id,
            organisation_id: chargesPayment.organisation_id,
            type: "REVENUE",
          },
        });

        if (!revenueAccount) {
          throw new AppError(
            `Revenue account not found for charge ${charge?.name}`,
            404
          );
        }

        // Get the LIABILITY (PAYABLE) account for this charge
        const liabilityAccount = await tx.glAccount.findFirst({
          where: {
            charge_id: charge?.id,
            organisation_id: chargesPayment.organisation_id,
            type: "LIABILITY",
          },
        });

        if (!liabilityAccount) {
          throw new AppError(
            `Liability account not found for charge ${charge?.name}`,
            404
          );
        }

        // Add GL entries for this payment item
        glEntries.push(
          {
            gl_account_id: revenueAccount.id,
            amount: parseFloat(item.external_amount_settled?.toString() || "0"),
            dr_cr: "DR" as const,
            description: `Reversal of Revenue from ${charge?.name} - ${chargesPayment.reference_number}`,
          },
          {
            gl_account_id: liabilityAccount.id,
            amount: parseFloat(item.external_amount_settled?.toString() || "0"),
            dr_cr: "CR" as const,
            description: `Reversal of Payment of ${charge?.name} liability - ${chargesPayment.reference_number}`,
          }
        );
      }
      await this.glTransactionService.createGlTransaction(
        chargesPayment.organisation_id!,
        {
          transaction_type: "CHARGES_PAYMENT_REVERSAL", // Using existing type temporarily
          amount: parseFloat(
            chargesPayment.external_total_amount?.toString() || "0"
          ),
          currency_id: chargesPayment.currency_id || undefined,
          description: `Charges payment reversed - ${chargesPayment.reference_number}`,
          gl_entries: glEntries,
        },
        chargesPayment.created_by!
      );

      // Get updated payment with relations
      const result = await tx.chargesPayment.findUnique({
        where: { id: paymentId },
        include: {
          currency: true,
          destination_org: true,
          created_by_user: true,
          organisation: true,
          payment_items: {
            include: {
              transaction_charges: {
                include: {
                  transaction: true,
                  charge: true,
                  organisation: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        message: "Charges payment reversed successfully",
        data: {
          ...result!,
          internal_total_amount: parseFloat(
            result!.internal_total_amount?.toString() || "0"
          ),
          external_total_amount: parseFloat(
            result!.external_total_amount?.toString() || "0"
          ),
          origin_total_amount: parseFloat(
            result!.origin_total_amount?.toString() || "0"
          ),
          destination_total_amount: parseFloat(
            result!.destination_total_amount?.toString() || "0"
          ),
          date_completed: result!.date_completed?.toISOString() || null,
          created_at: result!.created_at.toISOString(),
          updated_at: result!.updated_at.toISOString(),
          payment_items: result!.payment_items.map((item) => ({
            ...item,
            internal_amount_settled: parseFloat(
              item.internal_amount_settled?.toString() || "0"
            ),
            external_amount_settled: parseFloat(
              item.external_amount_settled?.toString() || "0"
            ),
            amount_settled: parseFloat(item.amount_settled?.toString() || "0"),
            created_at: item.created_at.toISOString(),
          })),
        } as any,
      };
    });
  }

  async getPendingCommissions({
    filters,
  }: {
    filters: PendingTransactionChargesFilters;
  }): Promise<PendingCommissionSplitResponse> {
    const {
      organisation_id,
      page = 1,
      limit = 10,
      search,
      currency_id,
      date_from,
      date_to,
      destination_org_id,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    where.status = "PENDING";
    where.transaction = {
      ...where.transaction,
      status: "COMPLETED",
      remittance_status: "PAID",
    };

    if (organisation_id) {
      // Return commissions where the requesting organisation is a beneficiary of the split
      where.organisation_id = organisation_id;
    }

    if (search) {
      where.OR = [
        {
          transaction: {
            transaction_no: { contains: search, mode: "insensitive" },
          },
        },
        {
          transaction_charge: {
            charge: { name: { contains: search, mode: "insensitive" } },
          },
        },
      ];
    }

    if (currency_id) {
      where.currency_id = currency_id;
    }

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    const [commissionSplits, total] = await Promise.all([
      prisma.commissionSplit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          transaction: true,
          organisation: true,
          currency: true,
          transaction_charge: {
            include: {
              charge: true,
            },
          },
        },
      }),
      prisma.commissionSplit.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Pending commission splits retrieved successfully",
      data: {
        commission_splits: commissionSplits.map((split: any) => ({
          ...split,
          // Align relation property name with interface (transaction_charges)
          transaction_charges: split.transaction_charge,
          amount: parseFloat(split.amount.toString()),
          created_at: split.created_at?.toISOString?.() || split.created_at,
          updated_at: split.updated_at?.toISOString?.() || split.updated_at,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  }

  // Get pending commissions stats
  async getPendingCommissionStats(
    filters: PendingTransactionChargesFilters
  ): Promise<ChargesPaymentStatsResponse> {
    const { organisation_id, currency_id, date_from, date_to } = filters;
    console.log("filters", filters);

    const where: any = {};
    where.status = "PENDING";
    where.transaction = {
      ...where.transaction,
      status: "COMPLETED",
      remittance_status: "PAID",
    };

    if (organisation_id) {
      where.organisation_id = organisation_id;
    }

    if (currency_id) {
      // use transaction origin currency for consistency with pending charges
      where.transaction = {
        ...where.transaction,
        origin_currency_id: currency_id,
      };
    }

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) {
        where.created_at.gte = new Date(date_from);
      }
      if (date_to) {
        const endDate = new Date(date_to);
        endDate.setDate(endDate.getDate() + 1);
        where.created_at.lte = endDate;
      }
    }

    console.log("where", where);

    const [totalCount, amountAgg] = await Promise.all([
      prisma.commissionSplit.count({ where }),
      prisma.commissionSplit.aggregate({ where, _sum: { amount: true } }),
    ]);

    console.log("totalCount", totalCount);
    console.log("amountAgg", amountAgg);

    return {
      success: true,
      message: "Pending commissions stats retrieved successfully",
      data: {
        totalPendingCharges: totalCount,
        totalPendingAmount: amountAgg._sum?.amount
          ? parseFloat(amountAgg._sum.amount.toString())
          : 0,
        byType: [
          {
            type: "COMMISSION" as ChargeType,
            count: totalCount,
            amount: amountAgg._sum?.amount
              ? parseFloat(amountAgg._sum.amount.toString())
              : 0,
          },
        ],
        byOrganisation: [],
        byCurrency: [],
      },
    };
  }

  // Process commissions: create charges payments from commission splits
  async processCommissions(
    commissionSplitIds: string[],
    userId: string
  ): Promise<ChargesPaymentResponse> {
    return await prisma.$transaction(async (tx) => {
      if (!commissionSplitIds || commissionSplitIds.length === 0) {
        throw new ValidationError("No commission splits provided");
      }

      // Fetch commission splits that are pending and requested
      const commissionSplits = await tx.commissionSplit.findMany({
        where: {
          id: { in: commissionSplitIds },
          status: "PENDING",
        },
        include: {
          transaction_charge: {
            include: {
              charge: true,
            },
          },
          organisation: true,
          transaction: {
            include: {
              origin_currency: true,
              destination_organisation: true,
              origin_organisation: true,
            },
          },
        },
      });

      if (commissionSplits.length === 0) {
        throw new AppError("No pending commission splits to process", 400);
      }

      // Customer organisation is used for reference generation (consistent with charges payments)
      const customerOrganisation = await tx.organisation.findFirst({
        where: { type: "CUSTOMER" },
      });
      if (!customerOrganisation) {
        throw new NotFoundError("Customer organisation not found");
      }

      // Group by type (COMMISSION), origin org and beneficiary org
      const grouped = new Map<string, typeof commissionSplits>();
      for (const split of commissionSplits) {
        const organisationId = split.organisation_id;
        const currencyId = split.currency_id;
        const key = `COMMISSION_${organisationId}_${currencyId}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(split as any);
      }

      console.log("grouped", grouped);

      const createdPayments: any[] = [];

      for (const [key, splits] of grouped) {
        const [, organisationId, currencyId] = key.split("_");
        const organisationIdVal =
          organisationId === "null" ? null : organisationId;
        const currencyIdVal = currencyId === "null" ? null : currencyId;

        const totalAmount = splits.reduce(
          (sum, s) => sum + parseFloat((s.amount || 0).toString()),
          0
        );

        const referenceNumber = await this.generateReferenceNumber(
          "COMMISSION",
          customerOrganisation.id,
          organisationIdVal ?? "",
          tx
        );

        const chargesPayment = await tx.chargesPayment.create({
          data: {
            type: "COMMISSION",
            amount: totalAmount,
            reference_number: referenceNumber,
            currency_id: currencyIdVal ?? "",
            status: "PENDING",
            date_completed: new Date(),
            notes: undefined,
            organisation_id: organisationIdVal ?? "",
            created_by: userId,
          } as any,
        });

        // Create payment items for each split
        await Promise.all(
          splits.map((s) =>
            tx.chargesPaymentItem.create({
              data: {
                charges_payment_id: chargesPayment.id,
                commission_split_id: s.id,
                transaction_charges_id: s.transaction_charges_id,
                amount_settled: s.amount,
              },
            })
          )
        );

        // Mark the splits as PROCESSING to avoid double-processing
        await tx.commissionSplit.updateMany({
          where: { id: { in: splits.map((s) => s.id) } },
          data: { status: "PROCESSING" },
        });

        createdPayments.push(chargesPayment);
      }

      // Return first created payment (for backward compatibility)
      const firstPayment = createdPayments[0];
      const result = await tx.chargesPayment.findUnique({
        where: { id: firstPayment.id },
        include: {
          currency: true,
          destination_org: true,
          created_by_user: true,
          organisation: true,
          payment_items: true,
        },
      });

      return {
        success: true,
        message: `Commission payment created successfully (${
          createdPayments.length
        } payment${createdPayments.length > 1 ? "s" : ""} created)`,
        data: {
          ...result!,
          amount: parseFloat(result!.amount?.toString() || "0"),
          date_completed: result!.date_completed?.toISOString() || null,
          created_at: result!.created_at.toISOString(),
          updated_at: result!.updated_at.toISOString(),
        } as any,
      };
    });
  }

  // Approve commission payment
  async approveCommissionPayment(
    paymentId: string,
    data: ApproveChargesPaymentRequest,
    userId?: string
  ): Promise<ChargesPaymentResponse> {
    return await prisma.$transaction(async (tx) => {
      const commissionPayment = await tx.chargesPayment.findUnique({
        where: { id: paymentId },
        include: {
          payment_items: {
            include: {
              commission_split: {
                include: {
                  transaction_charge: {
                    include: {
                      charge: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!commissionPayment) {
        throw new NotFoundError("Commission payment not found");
      }

      if (commissionPayment.status !== "PENDING") {
        throw new AppError(
          "Only pending commission payments can be approved",
          400
        );
      }

      const customerOrganisation = await tx.organisation.findFirst({
        where: {
          type: "CUSTOMER",
        },
      });
      if (!customerOrganisation) {
        throw new NotFoundError("Customer organisation not found");
      }

      // Update commission payment status
      await tx.chargesPayment.update({
        where: { id: paymentId },
        data: {
          status: "COMPLETED",
          date_completed: new Date(),
          notes: data.notes
            ? `${commissionPayment.notes || ""}\nApproved: ${data.notes}`.trim()
            : commissionPayment.notes,
          updated_at: new Date(),
          approved_by: userId ?? undefined,
        },
      });

      // Process each commission split and topup balances
      const glEntries: CreateGlEntryRequest[] = [];
      const balanceUpdates: {
        [key: string]: { amount: number; currency_id: string };
      } = {};

      for (const item of commissionPayment.payment_items) {
        const commissionSplit = item.commission_split;
        if (!commissionSplit) continue;

        const transactionCharge = commissionSplit.transaction_charge;
        if (!transactionCharge) continue;

        // Update commission split status
        await tx.commissionSplit.update({
          where: { id: commissionSplit.id },
          data: {
            status: "SETTLED",
            settled_by: userId ?? undefined,
            settled_at: new Date(),
            updated_at: new Date(),
          },
        });

        // Update transaction charge based on commission split role
        const updateData: any = {};
        const settledAmount = parseFloat(item.amount_settled.toString());

        switch (commissionSplit.role) {
          case "INTERNAL":
            updateData.internal_amount = settledAmount;
            break;
          case "ORIGIN":
            updateData.origin_amount = settledAmount;
            break;
          case "DESTINATION":
            updateData.destination_amount = settledAmount;
            break;
        }

        // Check if all commission splits for this transaction charge are settled
        const allSplits = await tx.commissionSplit.findMany({
          where: { transaction_charges_id: transactionCharge.id },
        });
        const settledSplits = allSplits.filter((s) => s.status === "SETTLED");

        if (settledSplits.length === allSplits.length) {
          updateData.status = "PAID";
        }

        await tx.transactionCharge.update({
          where: { id: transactionCharge.id },
          data: updateData,
        });

        // Topup balance for the organization involved in the commission
        if (commissionSplit.organisation_id && settledAmount > 0) {
          const orgId = commissionSplit.organisation_id;
          const currencyId = commissionPayment.currency_id;

          // Find or create org balance for the organization
          let orgBalance = await tx.orgBalance.findFirst({
            where: {
              base_org_id: customerOrganisation.id,
              dest_org_id: orgId,
              currency_id: currencyId,
            },
          });

          if (!orgBalance) {
            orgBalance = await tx.orgBalance.create({
              data: {
                base_org_id: customerOrganisation.id,
                dest_org_id: orgId,
                currency_id: currencyId,
                balance: 0,
                locked_balance: 0,
              },
            });
          }

          // Update the organization's balance
          const currentBalance = new Decimal(
            orgBalance.balance?.toString() || 0
          );
          const newBalance = currentBalance.plus(new Decimal(settledAmount));

          await tx.orgBalance.update({
            where: { id: orgBalance.id },
            data: {
              balance: newBalance,
              updated_at: new Date(),
            },
          });

          // Create balance history
          await tx.balanceHistory.create({
            data: {
              action_type: "TOPUP",
              entity_type: "AGENCY_FLOAT",
              entity_id: orgBalance.id,
              currency_id: currencyId,
              old_balance: currentBalance,
              new_balance: newBalance,
              change_amount: settledAmount,
              description: `Commission payment approved - ${commissionPayment.reference_number}`,
              created_by: userId ?? commissionPayment.created_by ?? "",
              org_balance_id: orgBalance.id,
              float_org_id: orgId,
              organisation_id: customerOrganisation.id,
            },
          });

          // Accumulate balance updates for GL posting
          const balanceKey = `${orgId}_${currencyId}`;
          if (!balanceUpdates[balanceKey]) {
            balanceUpdates[balanceKey] = { amount: 0, currency_id: currencyId };
          }
          balanceUpdates[balanceKey].amount += settledAmount;
        }
      }

      // Create GL entries for balance topups
      for (const [key, update] of Object.entries(balanceUpdates)) {
        const [orgId, currencyId] = key.split("_");

        // Get the organization's GL account
        const orgGlAccountId =
          await this.glTransactionService.getGlAccountForEntity(
            "AGENCY_FLOAT",
            orgId,
            commissionPayment.organisation_id!,
            tx
          );

        if (orgGlAccountId) {
          glEntries.push({
            gl_account_id: orgGlAccountId,
            amount: update.amount,
            dr_cr: "DR",
            description: `Commission payment to ${orgId} - ${commissionPayment.reference_number}`,
          });
        }
      }

      // Create GL transaction for commission payment
      if (glEntries.length > 0) {
        await this.glTransactionService.createGlTransaction(
          commissionPayment.organisation_id!,
          {
            transaction_type: "CHARGES_PAYMENT",
            amount: parseFloat(commissionPayment?.amount?.toString() || "0"),
            currency_id: commissionPayment.currency_id || undefined,
            description: `Commission payment approved - ${commissionPayment.reference_number}`,
            gl_entries: glEntries,
          },
          userId ?? commissionPayment.created_by ?? ""
        );
      }

      // Get updated payment with relations
      const result = await tx.chargesPayment.findUnique({
        where: { id: paymentId },
        include: {
          currency: true,
          destination_org: true,
          created_by_user: true,
          organisation: true,
          payment_items: {
            include: {
              commission_split: true,
              transaction_charges: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Commission payment approved successfully",
        data: {
          ...result!,
          amount: parseFloat(result!.amount?.toString() || "0"),
          date_completed: result!.date_completed?.toISOString() || null,
          created_at: result!.created_at.toISOString(),
          updated_at: result!.updated_at.toISOString(),
        } as any,
      };
    });
  }
}
