import { PrismaClient } from "@prisma/client";
import type {
  IVault,
  CreateVaultRequest,
  UpdateVaultRequest,
  VaultFilters,
  VaultListResponse,
  VaultResponse,
  VaultStats,
} from "./vaults.interfaces";

const prisma = new PrismaClient();

export class VaultService {
  async createVault({
    data,
    userId,
  }: {
    data: CreateVaultRequest;
    userId: string;
  }): Promise<VaultResponse> {
    try {
      const vault = await prisma.vault.create({
        data: {
          ...data,
          created_by: userId,
        },
        include: {
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
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
          created_by_user: {
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
        message: "Vault created successfully",
        data: vault as unknown as IVault,
      };
    } catch (error) {
      console.error("Error creating vault:", error);
      throw new Error("Failed to create vault");
    }
  }

  async getVaults(filters: VaultFilters): Promise<VaultListResponse> {
    try {
      const { page = 1, limit = 10, search, ...otherFilters } = filters;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          {
            organisation: { name: { contains: search, mode: "insensitive" } },
          },
        ];
      }

      // Add other filters
      Object.keys(otherFilters).forEach((key) => {
        if (otherFilters[key as keyof typeof otherFilters] !== undefined) {
          where[key] = otherFilters[key as keyof typeof otherFilters];
        }
      });

      const [vaults, total] = await Promise.all([
        prisma.vault.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            organisation: true,
            currency: true,
          },
        }),
        prisma.vault.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Vaults retrieved successfully",
        data: {
          vaults: vaults as IVault[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching vaults:", error);
      throw new Error("Failed to fetch vaults");
    }
  }

  async getVaultById(id: string): Promise<VaultResponse> {
    try {
      const vault = await prisma.vault.findUnique({
        where: { id },
        include: {
          organisation: true,
          currency: true,
        },
      });

      if (!vault) {
        throw new Error("Vault not found");
      }

      return {
        success: true,
        message: "Vault retrieved successfully",
        data: vault as IVault,
      };
    } catch (error) {
      console.error("Error fetching vault:", error);
      throw new Error("Failed to fetch vault");
    }
  }

  async updateVault(
    id: string,
    data: UpdateVaultRequest
  ): Promise<VaultResponse> {
    try {
      // Filter out undefined values and prepare update data
      const updateData: any = {};

      // Only include fields that have defined values
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof UpdateVaultRequest];
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      const vault = await prisma.vault.update({
        where: { id },
        data: updateData,
        include: {
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
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

      return {
        success: true,
        message: "Vault updated successfully",
        data: vault as unknown as IVault,
      };
    } catch (error) {
      console.error("Error updating vault:", error);
      throw new Error("Failed to update vault");
    }
  }

  async deleteVault(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.vault.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Vault deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting vault:", error);
      throw new Error("Failed to delete vault");
    }
  }

  async getVaultStats(filters: VaultFilters): Promise<{
    success: boolean;
    message: string;
    data: VaultStats;
  }> {
    try {
      const { organisation_id } = filters;

      const total = await prisma.vault.count();

      // Get vaults by organisation
      const organisationStats = await prisma.vault.groupBy({
        by: ["organisation_id"],
        _count: {
          id: true,
        },
        where: {
          organisation_id: organisation_id,
        },
      });

      const vaultsByOrganisation = organisationStats.reduce((acc, stat) => {
        acc[stat.organisation_id] = stat._count.id;
        return acc;
      }, {} as { [key: string]: number });

      // Get vaults by currency
      const currencyStats = await prisma.vault.groupBy({
        by: ["currency_id"],
        _count: {
          id: true,
        },
        where: {
          organisation_id: organisation_id,
          currency_id: {
            not: null,
          },
        },
      });

      const vaultsByCurrency = currencyStats.reduce((acc, stat) => {
        const currencyId = stat.currency_id || "unassigned";
        acc[currencyId] = stat._count.id;
        return acc;
      }, {} as { [key: string]: number });

      return {
        success: true,
        message: "Vault stats retrieved successfully",
        data: {
          totalVaults: total,
          vaultsByOrganisation,
          vaultsByCurrency,
        },
      };
    } catch (error) {
      console.error("Error fetching vault stats:", error);
      throw new Error("Failed to fetch vault stats");
    }
  }
}
