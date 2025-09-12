import { TillStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.lib";
import type {
  ITill,
  CreateTillRequest,
  UpdateTillRequest,
  TillFilters,
  TillListResponse,
  TillResponse,
  TillStats,
} from "./tills.interfaces";

export class TillService {
  async createTill({
    data,
    userId,
  }: {
    data: CreateTillRequest;
    userId?: string;
  }): Promise<TillResponse> {
    try {
      const openingBalance = data.opening_balance || 0;

      const till = await prisma.$transaction(async (tx) => {
        // Create the till
        const newTill = await tx.till.create({
          data: {
            ...data,
            status: data.status || TillStatus.ACTIVE,
            opened_at: data.opened_at ? new Date(data.opened_at) : new Date(),
            created_by: userId,
            locked_balance: 0,
            balance: openingBalance,
          },
        });

        // Create initial till balance if opening balance is provided and currency is specified

        // Return the till with all relations
        return await tx.till.findUnique({
          where: { id: newTill.id },
          include: {
            current_teller_user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            vault: {
              select: {
                id: true,
                name: true,
                organisation_id: true,
              },
            },
            currency: {
              select: {
                id: true,
                currency_name: true,
                currency_code: true,
                currency_symbol: true,
              },
            },
            organisation: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });
      });

      return {
        success: true,
        message: "Till created successfully",
        data: till as unknown as ITill,
      };
    } catch (error) {
      console.error("Error creating till:", error);
      throw new Error("Failed to create till");
    }
  }

  async getTills(filters: TillFilters): Promise<TillListResponse> {
    try {
      const { page = 1, limit = 10, search, ...otherFilters } = filters;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ];
      }

      // Add other filters
      Object.keys(otherFilters).forEach((key) => {
        if (otherFilters[key as keyof typeof otherFilters] !== undefined) {
          where[key] = otherFilters[key as keyof typeof otherFilters];
        }
      });

      const [tills, total] = await Promise.all([
        prisma.till.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            organisation: true,
            current_teller_user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            vault: {
              select: {
                id: true,
                name: true,
                organisation_id: true,
              },
            },
            currency: {
              select: {
                id: true,
                currency_name: true,
                currency_code: true,
                currency_symbol: true,
              },
            },
          },
        }),
        prisma.till.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Tills retrieved successfully",
        data: {
          tills: tills as ITill[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching tills:", error);
      throw new Error("Failed to fetch tills");
    }
  }

  async getTillById(id: string): Promise<TillResponse> {
    try {
      const till = await prisma.till.findUnique({
        where: { id },
        include: {
          organisation: true,
          current_teller_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          vault: {
            select: {
              id: true,
              name: true,
              organisation_id: true,
            },
          },
          currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
        },
      });

      if (!till) {
        throw new Error("Till not found");
      }

      return {
        success: true,
        message: "Till retrieved successfully",
        data: till as ITill,
      };
    } catch (error) {
      console.error("Error fetching till:", error);
      throw new Error("Failed to fetch till");
    }
  }

  async updateTill(id: string, data: UpdateTillRequest): Promise<TillResponse> {
    try {
      // Filter out undefined values and prepare update data
      const updateData: any = {};

      // Only include fields that have defined values
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof UpdateTillRequest];
        if (value !== undefined) {
          if (key === "opened_at" || key === "closed_at") {
            updateData[key] = value ? new Date(value as string) : null;
          } else {
            updateData[key] = value;
          }
        }
      });

      const till = await prisma.till.update({
        where: { id },
        data: updateData,
        include: {
          current_teller_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          vault: {
            select: {
              id: true,
              name: true,
              organisation_id: true,
            },
          },
          currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Till updated successfully",
        data: till as unknown as ITill,
      };
    } catch (error) {
      console.error("Error updating till:", error);
      throw new Error("Failed to update till");
    }
  }

  async deleteTill(id: string): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.till.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Till deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting till:", error);
      throw new Error("Failed to delete till");
    }
  }

  async getTillStats(): Promise<{
    success: boolean;
    message: string;
    data: TillStats;
  }> {
    try {
      const [total, active, inactive, pending, blocked] = await Promise.all([
        prisma.till.count(),
        prisma.till.count({ where: { status: TillStatus.ACTIVE } }),
        prisma.till.count({ where: { status: TillStatus.INACTIVE } }),
        prisma.till.count({ where: { status: TillStatus.PENDING } }),
        prisma.till.count({ where: { status: TillStatus.BLOCKED } }),
      ]);

      const tillsByStatus = {
        ACTIVE: active,
        INACTIVE: inactive,
        PENDING: pending,
        BLOCKED: blocked,
      };

      // Get tills by vault
      const vaultStats = await prisma.till.groupBy({
        by: ["vault_id"],
        _count: {
          id: true,
        },
        where: {
          vault_id: {
            not: null,
          },
        },
      });

      const tillsByVault = vaultStats.reduce((acc, stat) => {
        const vaultId = stat.vault_id || "unassigned";
        acc[vaultId] = stat._count.id;
        return acc;
      }, {} as { [key: string]: number });

      return {
        success: true,
        message: "Till stats retrieved successfully",
        data: {
          totalTills: total,
          activeTills: active,
          inactiveTills: inactive,
          pendingTills: pending,
          blockedTills: blocked,
          tillsByStatus,
          tillsByVault,
        },
      };
    } catch (error) {
      console.error("Error fetching till stats:", error);
      throw new Error("Failed to fetch till stats");
    }
  }

  async openTill(tillId: string, userId: string): Promise<TillResponse> {
    try {
      // Check if till can be opened
      const till = await prisma.till.findUnique({
        where: { id: tillId },
      });

      if (!till) {
        throw new Error("Till not found");
      }

      if (
        till.status === TillStatus.BLOCKED ||
        till.status === TillStatus.PENDING
      ) {
        throw new Error("Cannot open till: Till is blocked or pending");
      }

      if (till.current_teller_user_id) {
        throw new Error(
          "Cannot open till: Till is already assigned to another user"
        );
      }

      if (till.opened_at) {
        throw new Error("Cannot open till: Till is already open");
      }

      // Open the till and create UserTill record
      const [updatedTill] = await Promise.all([
        prisma.till.update({
          where: { id: tillId },
          data: {
            current_teller_user_id: userId,
            opened_at: new Date(),
          },
          include: {
            current_teller_user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            vault: {
              select: {
                id: true,
                name: true,
              },
            },
            currency: {
              select: {
                id: true,
                currency_code: true,
                currency_name: true,
              },
            },
          },
        }),
        prisma.userTill.create({
          data: {
            user_id: userId,
            till_id: tillId,
            opening_balance: till.balance || 0, // Default opening balance for user till
            date: new Date(),
            status: "OPEN" as any,
          },
        }),
      ]);

      return {
        success: true,
        message: "Till opened successfully",
        data: updatedTill as unknown as ITill,
      };
    } catch (error) {
      console.error("Error opening till:", error);
      throw new Error("Failed to open till");
    }
  }

  async closeTill(tillId: string): Promise<TillResponse> {
    try {
      const updatedTill = await prisma.till.update({
        where: { id: tillId },
        data: {
          current_teller_user_id: null,
          closed_at: new Date(),
        },
        include: {
          current_teller_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          vault: {
            select: {
              id: true,
              name: true,
            },
          },
          currency: {
            select: {
              id: true,
              currency_code: true,
              currency_name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Till closed successfully",
        data: updatedTill as unknown as ITill,
      };
    } catch (error) {
      console.error("Error closing till:", error);
      throw new Error("Failed to close till");
    }
  }

  async blockTill(tillId: string): Promise<TillResponse> {
    try {
      const updatedTill = await prisma.till.update({
        where: { id: tillId },
        data: {
          status: TillStatus.BLOCKED,
        },
        include: {
          current_teller_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          vault: {
            select: {
              id: true,
              name: true,
            },
          },
          currency: {
            select: {
              id: true,
              currency_code: true,
              currency_name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Till blocked successfully",
        data: updatedTill as unknown as ITill,
      };
    } catch (error) {
      console.error("Error blocking till:", error);
      throw new Error("Failed to block till");
    }
  }

  async deactivateTill(tillId: string): Promise<TillResponse> {
    try {
      const updatedTill = await prisma.till.update({
        where: { id: tillId },
        data: {
          status: TillStatus.INACTIVE,
        },
        include: {
          current_teller_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          vault: {
            select: {
              id: true,
              name: true,
            },
          },
          currency: {
            select: {
              id: true,
              currency_code: true,
              currency_name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Till deactivated successfully",
        data: updatedTill as unknown as ITill,
      };
    } catch (error) {
      console.error("Error deactivating till:", error);
      throw new Error("Failed to deactivate till");
    }
  }
}
