import { PrismaClient, ChargeType, ChargesPaymentStatus } from "@prisma/client";
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

const prisma = new PrismaClient();

export class ChargesPaymentService {
  // Generate reference number for charges payment
  private async generateReferenceNumber(
    type: ChargeType,
    organisationId: string
  ): Promise<string> {
    const date = new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const org = await prisma.organisation.findUnique({
      where: { id: organisationId },
      select: { name: true },
    });
    const orgCode = org?.name?.substring(0, 3).toUpperCase() || "ORG";

    // Get count of payments for this type today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await prisma.chargesPayment.count({
      where: {
        type,
        organisation_id: organisationId,
        created_at: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const sequence = (count + 1).toString().padStart(3, "0");
    return `PAY-${dateStr}-${type.toUpperCase()}-${orgCode}-${sequence}`;
  }

  // Get pending transaction charges
  async getPendingTransactionCharges(
    organisationId: string,
    filters: PendingTransactionChargesFilters
  ): Promise<PendingTransactionChargesResponse> {
    try {
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
      } = filters;

      const skip = (page - 1) * limit;
      const where: any = {
        organisation_id: organisationId,
        status: "PENDING" as const, // Only pending charges
      };

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
      if (destination_org_id) {
        where.transaction = {
          ...where.transaction,
          destination_organisation_id: destination_org_id,
        };
      }
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
                customer: {
                  select: {
                    id: true,
                    first_name: true,
                    last_name: true,
                  },
                },
                beneficiary: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                origin_currency: {
                  select: {
                    id: true,
                    currency_code: true,
                  },
                },
                dest_currency: {
                  select: {
                    id: true,
                    currency_code: true,
                  },
                },
                origin_organisation: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                destination_organisation: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            charge: true,
            organisation: {
              select: {
                id: true,
                name: true,
              },
            },
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
    } catch (error) {
      console.error("Error fetching pending transaction charges:", error);
      throw new Error("Failed to fetch pending transaction charges");
    }
  }

  // Get pending charges stats
  async getPendingChargesStats(
    organisationId: string
  ): Promise<ChargesPaymentStatsResponse> {
    try {
      const where = {
        organisation_id: organisationId,
        status: "PENDING" as const,
      };

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
    } catch (error) {
      console.error("Error fetching pending charges stats:", error);
      throw new Error("Failed to fetch pending charges stats");
    }
  }

  // Get charge payments stats
  async getChargePaymentsStats(
    organisationId: string
  ): Promise<ChargesPaymentStatsResponse> {
    try {
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
            organisation_id: organisationId,
            status: "PENDING" as const,
          },
        }),
        prisma.chargesPayment.aggregate({
          where: {
            organisation_id: organisationId,
            status: "PENDING" as const,
          },
          _sum: { internal_total_amount: true },
        }),
        // Completed payments
        prisma.chargesPayment.count({
          where: {
            organisation_id: organisationId,
            status: "COMPLETED" as const,
          },
        }),
        prisma.chargesPayment.aggregate({
          where: {
            organisation_id: organisationId,
            status: "COMPLETED" as const,
          },
          _sum: { internal_total_amount: true },
        }),
        // By type
        prisma.chargesPayment.groupBy({
          by: ["type", "status"],
          where: {
            organisation_id: organisationId,
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
    } catch (error) {
      console.error("Error fetching charge payments stats:", error);
      throw new Error("Failed to fetch charge payments stats");
    }
  }

  // Create charges payment
  async createChargesPayment(
    organisationId: string,
    data: CreateChargesPaymentRequest,
    userId: string
  ): Promise<ChargesPaymentResponse> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Validate transaction charges exist and are pending
        const transactionCharges = await tx.transactionCharge.findMany({
          where: {
            id: { in: data.transaction_charge_ids },
            organisation_id: organisationId,
            status: "PENDING" as const,
          },
          include: {
            transaction: {
              include: {
                origin_currency: true,
                destination_organisation: true,
              },
            },
            charge: true,
          },
        });

        if (transactionCharges.length !== data.transaction_charge_ids.length) {
          throw new Error(
            "Some transaction charges are invalid or not pending"
          );
        }

        // Validate all charges are of the same type
        const chargeTypes = [
          ...new Set(transactionCharges.map((tc) => tc.type)),
        ];
        if (chargeTypes.length > 1) {
          throw new Error("All selected charges must be of the same type");
        }

        // Get currency from first transaction
        const currency = (transactionCharges[0] as any).transaction
          ?.origin_currency;
        if (!currency) {
          throw new Error("Currency not found for transaction");
        }

        // Calculate totals
        const internalTotal = transactionCharges.reduce(
          (sum, tc) => sum + parseFloat((tc.internal_amount || 0).toString()),
          0
        );
        const externalTotal = transactionCharges.reduce(
          (sum, tc) => sum + parseFloat((tc.external_amount || 0).toString()),
          0
        );

        // Generate reference number
        const referenceNumber = await this.generateReferenceNumber(
          data.type,
          organisationId
        );

        // Create charges payment
        const chargesPayment = await tx.chargesPayment.create({
          data: {
            type: data.type,
            internal_total_amount: internalTotal,
            external_total_amount: externalTotal,
            reference_number: referenceNumber,
            currency_id: currency.id,
            destination_org_id: data.destination_org_id,
            status: "PENDING" as const,
            date_completed: new Date(), // Will be updated when approved
            notes: data.notes,
            organisation_id: organisationId,
            created_by: userId,
          } as any,
        });

        // Create payment items
        await Promise.all(
          transactionCharges.map((tc) =>
            tx.chargesPaymentItem.create({
              data: {
                charges_payment_id: chargesPayment.id,
                transaction_charges_id: tc.id,
                internal_amount_settled: tc.internal_amount || 0,
                external_amount_settled: tc.external_amount || 0,
              },
            })
          )
        );

        // Get created payment with relations
        const result = await tx.chargesPayment.findUnique({
          where: { id: chargesPayment.id },
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
          message: "Charges payment created successfully",
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
              created_at: item.created_at.toISOString(),
            })),
          } as any,
        };
      });
    } catch (error) {
      console.error("Error creating charges payment:", error);
      throw new Error("Failed to create charges payment");
    }
  }

  // Get charges payments
  async getChargesPayments(
    organisationId: string,
    filters: ChargesPaymentFilters
  ): Promise<ChargesPaymentListResponse> {
    try {
      const {
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
      const where: any = {
        organisation_id: organisationId,
      };

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
    } catch (error) {
      console.error("Error fetching charges payments:", error);
      throw new Error("Failed to fetch charges payments");
    }
  }

  // Get charges payment by ID
  async getChargesPaymentById(
    paymentId: string
  ): Promise<ChargesPaymentResponse> {
    try {
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
        throw new Error("Charges payment not found");
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
    } catch (error) {
      console.error("Error fetching charges payment:", error);
      throw new Error("Failed to fetch charges payment");
    }
  }

  // Approve charges payment
  async approveChargesPayment(
    paymentId: string,
    data: ApproveChargesPaymentRequest,
    userId: string
  ): Promise<ChargesPaymentResponse> {
    try {
      return await prisma.$transaction(async (tx) => {
        const chargesPayment = await tx.chargesPayment.findUnique({
          where: { id: paymentId },
          include: {
            payment_items: {
              include: {
                transaction_charges: true,
              },
            },
          },
        });

        if (!chargesPayment) {
          throw new Error("Charges payment not found");
        }

        if (chargesPayment.status !== "PENDING") {
          throw new Error("Only pending charges payments can be approved");
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

        // TODO: Add GL postings and balance updates here
        // This would involve:
        // 1. Creating GL entries for the payment
        // 2. Updating organisation balances
        // 3. Creating audit trail entries

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
              created_at: item.created_at.toISOString(),
            })),
          } as any,
        };
      });
    } catch (error) {
      console.error("Error approving charges payment:", error);
      throw new Error("Failed to approve charges payment");
    }
  }

  // Reverse charges payment
  async reverseChargesPayment(
    paymentId: string,
    data: ReverseChargesPaymentRequest,
    userId: string
  ): Promise<ChargesPaymentResponse> {
    try {
      return await prisma.$transaction(async (tx) => {
        const chargesPayment = await tx.chargesPayment.findUnique({
          where: { id: paymentId },
          include: {
            payment_items: {
              include: {
                transaction_charges: true,
              },
            },
          },
        });

        if (!chargesPayment) {
          throw new Error("Charges payment not found");
        }

        if (chargesPayment.status !== "COMPLETED") {
          throw new Error("Only completed charges payments can be reversed");
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

        // TODO: Add reverse GL postings and balance updates here
        // This would involve:
        // 1. Creating reverse GL entries
        // 2. Reversing organisation balance updates
        // 3. Creating audit trail entries

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
              created_at: item.created_at.toISOString(),
            })),
          } as any,
        };
      });
    } catch (error) {
      console.error("Error reversing charges payment:", error);
      throw new Error("Failed to reverse charges payment");
    }
  }
}
