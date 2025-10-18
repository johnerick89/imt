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
} from "./chargespayments.interfaces";
import {
  AppError,
  InsufficientFundsError,
  NotFoundError,
  ValidationError,
} from "../../utils/AppError";
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
            result!.internal_total_amount.toString()
          ),
          external_total_amount: parseFloat(
            result!.external_total_amount.toString()
          ),
          date_completed: result!.date_completed?.toISOString() || null,
          created_at: result!.created_at.toISOString(),
          updated_at: result!.updated_at.toISOString(),
          payment_items: result!.payment_items.map((item) => ({
            ...item,
            internal_amount_settled: parseFloat(
              item.internal_amount_settled.toString()
            ),
            external_amount_settled: parseFloat(
              item.external_amount_settled.toString()
            ),
            origin_amount_settled: parseFloat(
              item.origin_amount_settled?.toString() || "0"
            ),
            destination_amount_settled: parseFloat(
              item.destination_amount_settled?.toString() || "0"
            ),
            amount_settled: parseFloat(item.amount_settled.toString()),
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
            payment.internal_total_amount.toString()
          ),
          external_total_amount: parseFloat(
            payment.external_total_amount.toString()
          ),
          origin_total_amount: parseFloat(
            payment.origin_total_amount.toString()
          ),
          destination_total_amount: parseFloat(
            payment.destination_total_amount.toString()
          ),
          date_completed: payment.date_completed?.toISOString() || null,
          created_at: payment.created_at.toISOString(),
          updated_at: payment.updated_at.toISOString(),
          payment_items: payment.payment_items.map((item) => ({
            ...item,
            internal_amount_settled: parseFloat(
              item.internal_amount_settled.toString()
            ),
            external_amount_settled: parseFloat(
              item.external_amount_settled.toString()
            ),
            amount_settled: parseFloat(item.amount_settled.toString()),
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
          chargesPayment.internal_total_amount.toString()
        ),
        external_total_amount: parseFloat(
          chargesPayment.external_total_amount.toString()
        ),
        origin_total_amount: parseFloat(
          chargesPayment.origin_total_amount.toString()
        ),
        destination_total_amount: parseFloat(
          chargesPayment.destination_total_amount.toString()
        ),
        date_completed: chargesPayment.date_completed?.toISOString() || null,
        created_at: chargesPayment.created_at.toISOString(),
        updated_at: chargesPayment.updated_at.toISOString(),
        payment_items: chargesPayment.payment_items.map((item) => ({
          ...item,
          internal_amount_settled: parseFloat(
            item.internal_amount_settled.toString()
          ),
          external_amount_settled: parseFloat(
            item.external_amount_settled.toString()
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
      await Promise.all(
        chargesPayment.payment_items.map((item) =>
          tx.transactionCharge.update({
            where: { id: item.transaction_charges_id },
            data: { status: "PAID" },
          })
        )
      );

      // Prepare GL entries for all payment items
      const glEntries = [];

      for (const item of chargesPayment.payment_items) {
        const transactionCharge = item.transaction_charges;
        const charge = transactionCharge.charge;

        // Get the REVENUE account for this charge
        const revenueAccount = await tx.glAccount.findFirst({
          where: {
            charge_id: charge.id,
            organisation_id: chargesPayment.organisation_id,
            type: "REVENUE",
          },
        });

        if (!revenueAccount) {
          throw new AppError(
            `Revenue account not found for charge ${charge.name}`,
            404
          );
        }

        // Get the LIABILITY (PAYABLE) account for this charge
        const liabilityAccount = await tx.glAccount.findFirst({
          where: {
            charge_id: charge.id,
            organisation_id: chargesPayment.organisation_id,
            type: "LIABILITY",
          },
        });

        if (!liabilityAccount) {
          throw new AppError(
            `Liability account not found for charge ${charge.name}`,
            404
          );
        }

        // Add GL entries for this payment item
        glEntries.push(
          {
            gl_account_id: revenueAccount.id,
            amount: parseFloat(item.external_amount_settled.toString()),
            dr_cr: "CR" as const,
            description: `Revenue from ${charge.name} - ${chargesPayment.reference_number}`,
          },
          {
            gl_account_id: liabilityAccount.id,
            amount: parseFloat(item.external_amount_settled.toString()),
            dr_cr: "DR" as const,
            description: `Payment of ${charge.name} liability - ${chargesPayment.reference_number}`,
          }
        );
      }

      // Create GL transaction using the service
      await this.glTransactionService.createGlTransaction(
        chargesPayment.organisation_id!,
        {
          transaction_type: "CHARGES_PAYMENT", // Using existing type temporarily
          amount: parseFloat(chargesPayment.external_total_amount.toString()),
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
            result!.internal_total_amount.toString()
          ),
          external_total_amount: parseFloat(
            result!.external_total_amount.toString()
          ),
          origin_total_amount: parseFloat(
            result!.origin_total_amount.toString()
          ),
          destination_total_amount: parseFloat(
            result!.destination_total_amount.toString()
          ),
          date_completed: result!.date_completed?.toISOString() || null,
          created_at: result!.created_at.toISOString(),
          updated_at: result!.updated_at.toISOString(),
          payment_items: result!.payment_items.map((item) => ({
            ...item,
            internal_amount_settled: parseFloat(
              item.internal_amount_settled.toString()
            ),
            external_amount_settled: parseFloat(
              item.external_amount_settled.toString()
            ),
            amount_settled: parseFloat(item.amount_settled.toString()),
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
      const updatedPayment = await tx.chargesPayment.update({
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
      await Promise.all(
        chargesPayment.payment_items.map((item) =>
          tx.transactionCharge.update({
            where: { id: item.transaction_charges_id },
            data: { status: "PENDING" },
          })
        )
      );

      // Prepare GL entries for all payment items
      const glEntries = [];

      for (const item of chargesPayment.payment_items) {
        const transactionCharge = item.transaction_charges;
        const charge = transactionCharge.charge;

        // Get the REVENUE account for this charge
        const revenueAccount = await tx.glAccount.findFirst({
          where: {
            charge_id: charge.id,
            organisation_id: chargesPayment.organisation_id,
            type: "REVENUE",
          },
        });

        if (!revenueAccount) {
          throw new AppError(
            `Revenue account not found for charge ${charge.name}`,
            404
          );
        }

        // Get the LIABILITY (PAYABLE) account for this charge
        const liabilityAccount = await tx.glAccount.findFirst({
          where: {
            charge_id: charge.id,
            organisation_id: chargesPayment.organisation_id,
            type: "LIABILITY",
          },
        });

        if (!liabilityAccount) {
          throw new AppError(
            `Liability account not found for charge ${charge.name}`,
            404
          );
        }

        // Add GL entries for this payment item
        glEntries.push(
          {
            gl_account_id: revenueAccount.id,
            amount: parseFloat(item.external_amount_settled.toString()),
            dr_cr: "DR" as const,
            description: `Reversal of Revenue from ${charge.name} - ${chargesPayment.reference_number}`,
          },
          {
            gl_account_id: liabilityAccount.id,
            amount: parseFloat(item.external_amount_settled.toString()),
            dr_cr: "CR" as const,
            description: `Reversal of Payment of ${charge.name} liability - ${chargesPayment.reference_number}`,
          }
        );
      }
      await this.glTransactionService.createGlTransaction(
        chargesPayment.organisation_id!,
        {
          transaction_type: "CHARGES_PAYMENT_REVERSAL", // Using existing type temporarily
          amount: parseFloat(chargesPayment.external_total_amount.toString()),
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
            result!.internal_total_amount.toString()
          ),
          external_total_amount: parseFloat(
            result!.external_total_amount.toString()
          ),
          origin_total_amount: parseFloat(
            result!.origin_total_amount.toString()
          ),
          destination_total_amount: parseFloat(
            result!.destination_total_amount.toString()
          ),
          date_completed: result!.date_completed?.toISOString() || null,
          created_at: result!.created_at.toISOString(),
          updated_at: result!.updated_at.toISOString(),
          payment_items: result!.payment_items.map((item) => ({
            ...item,
            internal_amount_settled: parseFloat(
              item.internal_amount_settled.toString()
            ),
            external_amount_settled: parseFloat(
              item.external_amount_settled.toString()
            ),
            amount_settled: parseFloat(item.amount_settled.toString()),
            created_at: item.created_at.toISOString(),
          })),
        } as any,
      };
    });
  }
}
