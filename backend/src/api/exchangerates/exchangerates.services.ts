import {
  ExchangeRateOperatorStatus,
  ExchangeRateStatus,
  PrismaClient,
} from "@prisma/client";
import type {
  IExchangeRate,
  CreateExchangeRateRequest,
  UpdateExchangeRateRequest,
  ApproveExchangeRateRequest,
  ExchangeRateFilters,
  ExchangeRateListResponse,
  ExchangeRateResponse,
  ExchangeRateStats,
} from "./exchangerates.interfaces";

const prisma = new PrismaClient();

export class ExchangeRateService {
  async createExchangeRate(
    data: CreateExchangeRateRequest,
    userId: string
  ): Promise<ExchangeRateResponse> {
    try {
      const exchangeRate = await prisma.exchangeRate.create({
        data: {
          ...data,
          created_by: userId,
          status: data.status || ExchangeRateStatus.PENDING_APPROVAL,
        },
        include: {
          from_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          to_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          origin_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          destination_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Exchange rate created successfully",
        data: exchangeRate as unknown as IExchangeRate,
      };
    } catch (error) {
      console.error("Error creating exchange rate:", error);
      throw new Error("Failed to create exchange rate");
    }
  }

  async getExchangeRates(
    filters: ExchangeRateFilters
  ): Promise<ExchangeRateListResponse> {
    try {
      const { page = 1, limit = 10, search, ...otherFilters } = filters;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          {
            from_currency: { name: { contains: search, mode: "insensitive" } },
          },
          {
            from_currency: { code: { contains: search, mode: "insensitive" } },
          },
          {
            to_currency: { name: { contains: search, mode: "insensitive" } },
          },
          {
            to_currency: { code: { contains: search, mode: "insensitive" } },
          },
        ];
      }

      // Add other filters
      Object.keys(otherFilters).forEach((key) => {
        if (otherFilters[key as keyof typeof otherFilters] !== undefined) {
          where[key] = otherFilters[key as keyof typeof otherFilters];
        }
      });

      const [exchangeRates, total] = await Promise.all([
        prisma.exchangeRate.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            from_currency: {
              select: {
                id: true,
                currency_name: true,
                currency_code: true,
                currency_symbol: true,
              },
            },
            to_currency: {
              select: {
                id: true,
                currency_name: true,
                currency_code: true,
                currency_symbol: true,
              },
            },
            origin_country: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            destination_country: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            created_by_user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        }),
        prisma.exchangeRate.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Exchange rates retrieved successfully",
        data: {
          exchangeRates: exchangeRates as unknown as IExchangeRate[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
      throw new Error("Failed to fetch exchange rates");
    }
  }

  async getExchangeRateById(id: string): Promise<ExchangeRateResponse> {
    try {
      const exchangeRate = await prisma.exchangeRate.findUnique({
        where: { id },
        include: {
          from_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          to_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          origin_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          destination_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      if (!exchangeRate) {
        throw new Error("Exchange rate not found");
      }

      return {
        success: true,
        message: "Exchange rate retrieved successfully",
        data: exchangeRate as unknown as IExchangeRate,
      };
    } catch (error) {
      console.error("Error fetching exchange rate:", error);
      throw new Error("Failed to fetch exchange rate");
    }
  }

  async updateExchangeRate(
    id: string,
    data: UpdateExchangeRateRequest
  ): Promise<ExchangeRateResponse> {
    try {
      // Filter out undefined values and prepare update data
      const updateData: any = {};

      // Only include fields that have defined values
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof UpdateExchangeRateRequest];
        if (value !== undefined) {
          if (key === "valid_from" || key === "valid_to") {
            updateData[key] = value ? new Date(value as string) : null;
          } else {
            updateData[key] = value;
          }
        }
      });

      const exchangeRate = await prisma.exchangeRate.update({
        where: { id },
        data: updateData,
        include: {
          from_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          to_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          origin_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          destination_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Exchange rate updated successfully",
        data: exchangeRate as unknown as IExchangeRate,
      };
    } catch (error) {
      console.error("Error updating exchange rate:", error);
      throw new Error("Failed to update exchange rate");
    }
  }

  async deleteExchangeRate(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.exchangeRate.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Exchange rate deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting exchange rate:", error);
      throw new Error("Failed to delete exchange rate");
    }
  }

  async getExchangeRateStats(): Promise<{
    success: boolean;
    message: string;
    data: ExchangeRateStats;
  }> {
    try {
      const [total, active, inactive, pendingApproval, approved, rejected] =
        await Promise.all([
          prisma.exchangeRate.count(),
          prisma.exchangeRate.count({
            where: { status: ExchangeRateStatus.ACTIVE },
          }),
          prisma.exchangeRate.count({
            where: { status: ExchangeRateStatus.INACTIVE },
          }),
          prisma.exchangeRate.count({
            where: { status: ExchangeRateStatus.PENDING_APPROVAL },
          }),
          prisma.exchangeRate.count({
            where: { status: ExchangeRateStatus.APPROVED },
          }),
          prisma.exchangeRate.count({
            where: { status: ExchangeRateStatus.REJECTED },
          }),
        ]);

      const exchangeRatesByStatus = {
        ACTIVE: active,
        INACTIVE: inactive,
        PENDING_APPROVAL: pendingApproval,
        APPROVED: approved,
        REJECTED: rejected,
      };

      // Get exchange rates by currency
      const currencyStats = await prisma.exchangeRate.groupBy({
        by: ["from_currency_id"],
        _count: {
          id: true,
        },
        where: {
          from_currency_id: {
            not: null,
          },
        },
      });

      const exchangeRatesByCurrency = currencyStats.reduce((acc, stat) => {
        const currencyId = stat.from_currency_id || "unknown";
        acc[currencyId] = stat._count.id;
        return acc;
      }, {} as { [key: string]: number });

      return {
        success: true,
        message: "Exchange rate stats retrieved successfully",
        data: {
          totalExchangeRates: total,
          activeExchangeRates: active,
          inactiveExchangeRates: inactive,
          pendingApprovalExchangeRates: pendingApproval,
          exchangeRatesByStatus,
          exchangeRatesByCurrency,
        },
      };
    } catch (error) {
      console.error("Error fetching exchange rate stats:", error);
      throw new Error("Failed to fetch exchange rate stats");
    }
  }

  async approveExchangeRate(
    id: string,
    data: ApproveExchangeRateRequest,
    userId: string
  ): Promise<ExchangeRateResponse> {
    try {
      // Check if exchange rate exists
      const existingExchangeRate = await prisma.exchangeRate.findUnique({
        where: { id },
        include: {
          from_currency: {
            select: {
              id: true,
              currency_code: true,
              currency_name: true,
            },
          },
          to_currency: {
            select: {
              id: true,
              currency_code: true,
              currency_name: true,
            },
          },
          origin_country: {
            select: {
              id: true,
              name: true,
            },
          },
          destination_country: {
            select: {
              id: true,
              name: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
          approved_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      if (!existingExchangeRate) {
        return {
          success: false,
          message: "Exchange rate not found",
          data: {} as unknown as IExchangeRate,
          error: "EXCHANGE_RATE_NOT_FOUND",
        };
      }

      // Start a transaction to handle the approval logic
      await prisma.$transaction(async (tx) => {
        // If approving the exchange rate, deactivate other active rates for the same currency pair and organisation
        if (
          data.status === ExchangeRateStatus.APPROVED ||
          data.status === ExchangeRateStatus.ACTIVE
        ) {
          await tx.exchangeRate.updateMany({
            where: {
              from_currency_id: existingExchangeRate.from_currency_id,
              to_currency_id: existingExchangeRate.to_currency_id,
              organisation_id: existingExchangeRate.organisation_id,
              status: {
                in: [ExchangeRateStatus.ACTIVE, ExchangeRateStatus.APPROVED],
              },
              id: {
                not: id,
              },
            },
            data: {
              status: ExchangeRateStatus.INACTIVE,
              date_to: new Date(),
            },
          });
        }

        // Update the current exchange rate
        await tx.exchangeRate.update({
          where: { id },
          data: {
            status: data.status,
            operator_status: data.operator_status,
            approved_by: userId,
          },
        });
      });

      // Fetch the updated exchange rate
      const updatedExchangeRate = await prisma.exchangeRate.findUnique({
        where: { id },
        include: {
          from_currency: {
            select: {
              id: true,
              currency_code: true,
              currency_name: true,
            },
          },
          to_currency: {
            select: {
              id: true,
              currency_code: true,
              currency_name: true,
            },
          },
          origin_country: {
            select: {
              id: true,
              name: true,
            },
          },
          destination_country: {
            select: {
              id: true,
              name: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
          approved_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Exchange rate approved successfully",
        data: updatedExchangeRate as unknown as IExchangeRate,
      };
    } catch (error) {
      console.error("Error approving exchange rate:", error);
      return {
        success: false,
        message: "Failed to approve exchange rate",
        data: {} as unknown as IExchangeRate,
        error: "APPROVE_FAILED",
      };
    }
  }
}
