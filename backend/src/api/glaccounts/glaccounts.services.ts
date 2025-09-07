import { PrismaClient } from "@prisma/client";
import {
  IGlAccount,
  GlAccountFilters,
  GlAccountListResponse,
  GlAccountResponse,
  GlAccountStats,
  GlAccountStatsResponse,
  CreateGlAccountRequest,
  UpdateGlAccountRequest,
  GenerateAccountsRequest,
  GenerateAccountsResponse,
} from "./glaccounts.interfaces";

const prisma = new PrismaClient();

export class GlAccountService {
  // Create GL Account
  async createGlAccount(
    data: CreateGlAccountRequest,
    userId: string
  ): Promise<GlAccountResponse> {
    try {
      const glAccount = await prisma.glAccount.create({
        data: {
          ...data,
          balance: data.balance ? parseFloat(data.balance.toString()) : 0,
          locked_balance: data.locked_balance
            ? parseFloat(data.locked_balance.toString())
            : 0,
          max_balance: data.max_balance
            ? parseFloat(data.max_balance.toString())
            : null,
          min_balance: data.min_balance
            ? parseFloat(data.min_balance.toString())
            : null,
          opened_by: userId,
        },
        include: {
          currency: true,
          organisation: true,
          opened_by_user: true,
          bank_account: true,
          charge: true,
          vault: true,
          till: true,
        },
      });

      return {
        success: true,
        message: "GL Account created successfully",
        data: {
          ...glAccount,
          balance: glAccount.balance
            ? parseFloat(glAccount.balance.toString())
            : null,
          locked_balance: glAccount.locked_balance
            ? parseFloat(glAccount.locked_balance.toString())
            : null,
          max_balance: glAccount.max_balance
            ? parseFloat(glAccount.max_balance.toString())
            : null,
          min_balance: glAccount.min_balance
            ? parseFloat(glAccount.min_balance.toString())
            : null,
        },
      };
    } catch (error) {
      console.error("Error creating GL Account:", error);
      return {
        success: false,
        message: "Failed to create GL Account",
        data: {} as IGlAccount,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get GL Accounts
  async getGlAccounts(
    filters: GlAccountFilters
  ): Promise<GlAccountListResponse> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        type,
        currency_id,
        organisation_id,
        opened_by,
        is_closed,
        is_frozen,
        till_id,
        charge_id,
        vault_id,
      } = filters;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { close_reason: { contains: search, mode: "insensitive" } },
          { frozen_reason: { contains: search, mode: "insensitive" } },
        ];
      }

      if (type) where.type = type;
      if (currency_id) where.currency_id = currency_id;
      if (organisation_id) where.organisation_id = organisation_id;
      if (opened_by) where.opened_by = opened_by;
      if (is_closed !== undefined) {
        where.closed_at = is_closed ? { not: null } : null;
      }
      if (is_frozen !== undefined) {
        where.frozen_at = is_frozen ? { not: null } : null;
      }
      if (till_id) where.till_id = till_id;
      if (charge_id) where.charge_id = charge_id;
      if (vault_id) where.vault_id = vault_id;

      const [glAccounts, total] = await Promise.all([
        prisma.glAccount.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            currency: true,
            organisation: true,
            opened_by_user: true,
            bank_account: true,
            charge: true,
            vault: true,
            till: true,
          },
        }),
        prisma.glAccount.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "GL Accounts retrieved successfully",
        data: {
          glAccounts: glAccounts.map((account) => ({
            ...account,
            balance: account.balance
              ? parseFloat(account.balance.toString())
              : null,
            locked_balance: account.locked_balance
              ? parseFloat(account.locked_balance.toString())
              : null,
            max_balance: account.max_balance
              ? parseFloat(account.max_balance.toString())
              : null,
            min_balance: account.min_balance
              ? parseFloat(account.min_balance.toString())
              : null,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching GL Accounts:", error);
      return {
        success: false,
        message: "Failed to fetch GL Accounts",
        data: {
          glAccounts: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        },
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get GL Account by ID
  async getGlAccountById(id: string): Promise<GlAccountResponse> {
    try {
      const glAccount = await prisma.glAccount.findUnique({
        where: { id },
        include: {
          currency: true,
          organisation: true,
          opened_by_user: true,
          bank_account: true,
          charge: true,
          vault: true,
          till: true,
        },
      });

      if (!glAccount) {
        return {
          success: false,
          message: "GL Account not found",
          data: {} as IGlAccount,
          error: "GL Account not found",
        };
      }

      return {
        success: true,
        message: "GL Account retrieved successfully",
        data: {
          ...glAccount,
          balance: glAccount.balance
            ? parseFloat(glAccount.balance.toString())
            : null,
          locked_balance: glAccount.locked_balance
            ? parseFloat(glAccount.locked_balance.toString())
            : null,
          max_balance: glAccount.max_balance
            ? parseFloat(glAccount.max_balance.toString())
            : null,
          min_balance: glAccount.min_balance
            ? parseFloat(glAccount.min_balance.toString())
            : null,
        },
      };
    } catch (error) {
      console.error("Error fetching GL Account:", error);
      return {
        success: false,
        message: "Failed to fetch GL Account",
        data: {} as IGlAccount,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Update GL Account
  async updateGlAccount(
    id: string,
    data: UpdateGlAccountRequest,
    userId: string
  ): Promise<GlAccountResponse> {
    try {
      const updateData: any = { ...data };

      // Convert Decimal fields
      if (data.balance !== undefined) {
        updateData.balance = parseFloat(data.balance.toString());
      }
      if (data.locked_balance !== undefined) {
        updateData.locked_balance = parseFloat(data.locked_balance.toString());
      }
      if (data.max_balance !== undefined) {
        updateData.max_balance = data.max_balance
          ? parseFloat(data.max_balance.toString())
          : null;
      }
      if (data.min_balance !== undefined) {
        updateData.min_balance = data.min_balance
          ? parseFloat(data.min_balance.toString())
          : null;
      }

      // Handle closing account
      if (data.close_reason) {
        updateData.closed_at = new Date();
      }

      // Handle freezing account
      if (data.frozen_reason) {
        updateData.frozen_at = new Date();
      }

      const glAccount = await prisma.glAccount.update({
        where: { id },
        data: updateData,
        include: {
          currency: true,
          organisation: true,
          opened_by_user: true,
          bank_account: true,
          charge: true,
          vault: true,
          till: true,
        },
      });

      return {
        success: true,
        message: "GL Account updated successfully",
        data: {
          ...glAccount,
          balance: glAccount.balance
            ? parseFloat(glAccount.balance.toString())
            : null,
          locked_balance: glAccount.locked_balance
            ? parseFloat(glAccount.locked_balance.toString())
            : null,
          max_balance: glAccount.max_balance
            ? parseFloat(glAccount.max_balance.toString())
            : null,
          min_balance: glAccount.min_balance
            ? parseFloat(glAccount.min_balance.toString())
            : null,
        },
      };
    } catch (error) {
      console.error("Error updating GL Account:", error);
      return {
        success: false,
        message: "Failed to update GL Account",
        data: {} as IGlAccount,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Delete GL Account
  async deleteGlAccount(id: string): Promise<GlAccountResponse> {
    try {
      await prisma.glAccount.delete({
        where: { id },
      });

      return {
        success: true,
        message: "GL Account deleted successfully",
        data: {} as IGlAccount,
      };
    } catch (error) {
      console.error("Error deleting GL Account:", error);
      return {
        success: false,
        message: "Failed to delete GL Account",
        data: {} as IGlAccount,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get GL Account Stats
  async getGlAccountStats(
    organisationId?: string
  ): Promise<GlAccountStatsResponse> {
    try {
      const where = organisationId ? { organisation_id: organisationId } : {};

      const [totalGlAccounts, accounts] = await Promise.all([
        prisma.glAccount.count({ where }),
        prisma.glAccount.findMany({
          where,
          include: {
            currency: true,
            organisation: true,
            opened_by_user: true,
            bank_account: true,
            charge: true,
            vault: true,
            till: true,
          },
        }),
      ]);

      const totalBalance = accounts.reduce((sum, account) => {
        return (
          sum + (account.balance ? parseFloat(account.balance.toString()) : 0)
        );
      }, 0);

      const totalLockedBalance = accounts.reduce((sum, account) => {
        return (
          sum +
          (account.locked_balance
            ? parseFloat(account.locked_balance.toString())
            : 0)
        );
      }, 0);

      // Group by type
      const byType = accounts.reduce((acc, account) => {
        const type = account.type;
        if (!acc[type]) {
          acc[type] = { count: 0, total_balance: 0 };
        }
        acc[type].count++;
        acc[type].total_balance += account.balance
          ? parseFloat(account.balance.toString())
          : 0;
        return acc;
      }, {} as Record<string, { count: number; total_balance: number }>);

      const byTypeArray = Object.entries(byType).map(([type, data]) => ({
        type,
        ...data,
      }));

      // Group by currency
      const byCurrency = accounts.reduce((acc, account) => {
        if (account.currency) {
          const currencyId = account.currency.id;
          if (!acc[currencyId]) {
            acc[currencyId] = {
              currency_id: currencyId,
              currency_code: account.currency.currency_code,
              count: 0,
              total_balance: 0,
            };
          }
          acc[currencyId].count++;
          acc[currencyId].total_balance += account.balance
            ? parseFloat(account.balance.toString())
            : 0;
        }
        return acc;
      }, {} as Record<string, { currency_id: string; currency_code: string; count: number; total_balance: number }>);

      const byCurrencyArray = Object.values(byCurrency);

      return {
        success: true,
        message: "GL Account stats retrieved successfully",
        data: {
          totalGlAccounts,
          totalBalance,
          totalLockedBalance,
          byType: byTypeArray,
          byCurrency: byCurrencyArray,
        },
      };
    } catch (error) {
      console.error("Error fetching GL Account stats:", error);
      return {
        success: false,
        message: "Failed to fetch GL Account stats",
        data: {
          totalGlAccounts: 0,
          totalBalance: 0,
          totalLockedBalance: 0,
          byType: [],
          byCurrency: [],
        },
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Generate GL Accounts
  async generateGlAccounts(
    data: GenerateAccountsRequest,
    userId: string
  ): Promise<GenerateAccountsResponse> {
    try {
      const {
        organisation_id,
        generate_for_bank_accounts,
        generate_for_tills,
        generate_for_vaults,
        generate_for_charges,
        generate_for_org_balances,
      } = data;

      const generatedAccounts: IGlAccount[] = [];

      await prisma.$transaction(async (tx) => {
        // Generate for Bank Accounts
        if (generate_for_bank_accounts) {
          const bankAccounts = await tx.bankAccount.findMany({
            where: { organisation_id },
            include: { currency: true },
          });

          for (const bankAccount of bankAccounts) {
            const existingAccount = await tx.glAccount.findFirst({
              where: { bank_account_id: bankAccount.id, organisation_id },
            });

            if (!existingAccount) {
              const glAccount = await tx.glAccount.create({
                data: {
                  name: `Bank Account - ${bankAccount.name}`,
                  type: "ASSET",
                  balance: bankAccount.balance
                    ? parseFloat(bankAccount.balance.toString())
                    : 0,
                  currency_id: bankAccount.currency_id,
                  organisation_id,
                  bank_account_id: bankAccount.id,
                  opened_by: userId,
                },
                include: {
                  currency: true,
                  organisation: true,
                  opened_by_user: true,
                  bank_account: true,
                },
              });

              generatedAccounts.push({
                ...glAccount,
                balance: glAccount.balance
                  ? parseFloat(glAccount.balance.toString())
                  : null,
                locked_balance: glAccount.locked_balance
                  ? parseFloat(glAccount.locked_balance.toString())
                  : null,
                max_balance: glAccount.max_balance
                  ? parseFloat(glAccount.max_balance.toString())
                  : null,
                min_balance: glAccount.min_balance
                  ? parseFloat(glAccount.min_balance.toString())
                  : null,
              });
            }
          }
        }

        // Generate for Tills
        if (generate_for_tills) {
          const tills = await tx.till.findMany({
            where: { organisation_id },
            include: { currency: true },
          });

          for (const till of tills) {
            const existingAccount = await tx.glAccount.findFirst({
              where: {
                till_id: till.id,
                organisation_id,
              },
            });

            if (!existingAccount) {
              const glAccount = await tx.glAccount.create({
                data: {
                  name: `Till - ${till.name}`,
                  type: "ASSET",
                  balance: 0,
                  currency_id: till.currency_id,
                  organisation_id,
                  opened_by: userId,
                },
                include: {
                  currency: true,
                  organisation: true,
                  opened_by_user: true,
                  till: true,
                },
              });

              generatedAccounts.push({
                ...glAccount,
                balance: glAccount.balance
                  ? parseFloat(glAccount.balance.toString())
                  : null,
                locked_balance: glAccount.locked_balance
                  ? parseFloat(glAccount.locked_balance.toString())
                  : null,
                max_balance: glAccount.max_balance
                  ? parseFloat(glAccount.max_balance.toString())
                  : null,
                min_balance: glAccount.min_balance
                  ? parseFloat(glAccount.min_balance.toString())
                  : null,
              });
            }
          }
        }

        // Generate for Vaults
        if (generate_for_vaults) {
          const vaults = await tx.vault.findMany({
            where: { organisation_id },
            include: { currency: true },
          });

          for (const vault of vaults) {
            const existingAccount = await tx.glAccount.findFirst({
              where: {
                vault_id: vault.id,
                organisation_id,
              },
            });

            if (!existingAccount) {
              const glAccount = await tx.glAccount.create({
                data: {
                  name: `Vault - ${vault.name}`,
                  type: "ASSET",
                  balance: 0,
                  currency_id: vault.currency_id,
                  organisation_id,
                  opened_by: userId,
                },
                include: {
                  currency: true,
                  organisation: true,
                  opened_by_user: true,
                  vault: true,
                },
              });

              generatedAccounts.push({
                ...glAccount,
                balance: glAccount.balance
                  ? parseFloat(glAccount.balance.toString())
                  : null,
                locked_balance: glAccount.locked_balance
                  ? parseFloat(glAccount.locked_balance.toString())
                  : null,
                max_balance: glAccount.max_balance
                  ? parseFloat(glAccount.max_balance.toString())
                  : null,
                min_balance: glAccount.min_balance
                  ? parseFloat(glAccount.min_balance.toString())
                  : null,
              });
            }
          }
        }

        // Generate for Charges
        if (generate_for_charges) {
          const charges = await tx.charge.findMany({
            where: {
              OR: [
                { origin_organisation_id: organisation_id },
                { destination_organisation_id: organisation_id },
              ],
            },
            include: { currency: true },
          });

          for (const charge of charges) {
            const existingAccount = await tx.glAccount.findFirst({
              where: {
                charge_id: charge.id,
                organisation_id,
              },
            });

            if (!existingAccount) {
              const glAccount = await tx.glAccount.create({
                data: {
                  name: `Charge - ${charge.name}`,
                  type: "REVENUE",
                  balance: 0,
                  currency_id: charge.currency_id,
                  organisation_id,
                  opened_by: userId,
                },
                include: {
                  currency: true,
                  organisation: true,
                  opened_by_user: true,
                  charge: true,
                },
              });

              generatedAccounts.push({
                ...glAccount,
                balance: glAccount.balance
                  ? parseFloat(glAccount.balance.toString())
                  : null,
                locked_balance: glAccount.locked_balance
                  ? parseFloat(glAccount.locked_balance.toString())
                  : null,
                max_balance: glAccount.max_balance
                  ? parseFloat(glAccount.max_balance.toString())
                  : null,
                min_balance: glAccount.min_balance
                  ? parseFloat(glAccount.min_balance.toString())
                  : null,
              });
            }
          }
        }

        // Generate for Org Balances
        if (generate_for_org_balances) {
          const orgBalances = await tx.orgBalance.findMany({
            where: { base_org_id: organisation_id },
            include: { currency: true, base_org: true, dest_org: true },
          });

          for (const orgBalance of orgBalances) {
            const existingAccount = await tx.glAccount.findFirst({
              where: { org_balance_id: orgBalance.id, organisation_id },
            });

            if (!existingAccount) {
              const glAccount = await tx.glAccount.create({
                data: {
                  name: `Org Balance - ${orgBalance.base_org.name} to ${orgBalance.dest_org.name} for ${orgBalance.currency.currency_code}`,
                  type: "ASSET",
                  balance: 0,
                  currency_id: orgBalance.currency_id,
                  org_balance_id: orgBalance.id,
                  organisation_id,
                  opened_by: userId,
                },
                include: {
                  currency: true,
                  organisation: true,
                  opened_by_user: true,
                  org_balance: true,
                },
              });

              generatedAccounts.push({
                ...glAccount,
                balance: glAccount.balance
                  ? parseFloat(glAccount.balance.toString())
                  : null,
                locked_balance: glAccount.locked_balance
                  ? parseFloat(glAccount.locked_balance.toString())
                  : null,
                max_balance: glAccount.max_balance
                  ? parseFloat(glAccount.max_balance.toString())
                  : null,
                min_balance: glAccount.min_balance
                  ? parseFloat(glAccount.min_balance.toString())
                  : null,
              });
            }
          }
        }
      });

      return {
        success: true,
        message: `Successfully generated ${generatedAccounts.length} GL Accounts`,
        data: {
          generated_count: generatedAccounts.length,
          accounts: generatedAccounts,
        },
      };
    } catch (error) {
      console.error("Error generating GL Accounts:", error);
      return {
        success: false,
        message: "Failed to generate GL Accounts",
        data: {
          generated_count: 0,
          accounts: [],
        },
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
