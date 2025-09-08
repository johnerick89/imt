import { PrismaClient } from "@prisma/client";
import { GlTransactionService } from "../gltransactions/gltransactions.services";
import type {
  BalanceOperationRequest,
  BalanceOperationResponse,
  OrgBalanceOperationRequest,
  TillBalanceOperationRequest,
  VaultBalanceOperationRequest,
  OrgBalance,
  OrgBalanceListResponse,
  OrgBalanceStats,
  OrgBalanceStatsResponse,
} from "./balanceoperations.interfaces";

const prisma = new PrismaClient();
const glTransactionService = new GlTransactionService();

export class BalanceOperationService {
  // Organisation Balance Operations
  async prefundOrganisation(
    orgId: string,
    data: OrgBalanceOperationRequest,
    userId: string
  ): Promise<BalanceOperationResponse> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get source bank account
        const sourceBankAccount = await tx.bankAccount.findUnique({
          where: { id: data.source_id },
        });

        if (!sourceBankAccount) {
          throw new Error("Source bank account not found");
        }

        // Check if source has sufficient balance
        const sourceBalance = parseFloat(sourceBankAccount.balance.toString());
        if (sourceBalance < data.amount) {
          throw new Error("Insufficient balance in source bank account");
        }

        // Get or create organisation balance
        let orgBalance = await tx.orgBalance.findFirst({
          where: {
            base_org_id: orgId,
            dest_org_id: orgId, // Self-balance
            currency_id: sourceBankAccount.currency_id,
          },
        });

        if (!orgBalance) {
          // Create new organisation balance
          orgBalance = await tx.orgBalance.create({
            data: {
              base_org_id: orgId,
              dest_org_id: orgId,
              currency_id: sourceBankAccount.currency_id,
              balance: 0,
              locked_balance: 0,
            },
          });
        }

        const oldBalance = parseFloat(orgBalance.balance.toString());
        const newBalance = oldBalance + data.amount;

        // Update organisation balance
        await tx.orgBalance.update({
          where: { id: orgBalance.id },
          data: {
            balance: newBalance,
            updated_at: new Date(),
          },
        });

        // Update source bank account balance
        await tx.bankAccount.update({
          where: { id: data.source_id },
          data: {
            balance: sourceBalance - data.amount,
            updated_at: new Date(),
          },
        });

        // Create balance history records
        await tx.balanceHistory.create({
          data: {
            entity_type: "ORG_BALANCE",
            entity_id: orgBalance.id,
            currency_id: sourceBankAccount.currency_id,
            old_balance: oldBalance,
            new_balance: newBalance,
            change_amount: data.amount,
            description: data.description,
            created_by: userId,
          },
        });

        await tx.balanceHistory.create({
          data: {
            entity_type: "BANK_ACCOUNT",
            entity_id: data.source_id,
            currency_id: sourceBankAccount.currency_id,
            old_balance: sourceBalance,
            new_balance: sourceBalance - data.amount,
            change_amount: -data.amount,
            description: data.description,
            created_by: userId,
          },
        });

        // Create GL Transaction for Organisation Prefund
        const orgGlAccountId = await glTransactionService.getGlAccountForEntity(
          "ORG_BALANCE",
          orgBalance.id,
          orgId
        );
        const bankGlAccountId =
          await glTransactionService.getGlAccountForEntity(
            "BANK_ACCOUNT",
            data.source_id,
            orgId
          );

        if (orgGlAccountId && bankGlAccountId) {
          await glTransactionService.createGlTransaction(
            orgId,
            {
              transaction_type: "VAULT_DEPOSIT", // Using closest match for org prefund
              amount: data.amount,
              currency_id: sourceBankAccount.currency_id,
              description: `Organisation prefund: ${data.description}`,
              gl_entries: [
                {
                  gl_account_id: orgGlAccountId,
                  amount: data.amount,
                  dr_cr: "DR",
                  description: `Organisation balance increased by ${data.amount}`,
                },
                {
                  gl_account_id: bankGlAccountId,
                  amount: data.amount,
                  dr_cr: "CR",
                  description: `Bank account decreased by ${data.amount}`,
                },
              ],
            },
            userId
          );
        }

        return {
          success: true,
          message: "Organisation prefunded successfully",
          data: {
            id: orgBalance.id,
            old_balance: oldBalance,
            new_balance: newBalance,
            change_amount: data.amount,
            operation_type: "TOPUP",
            source_entity: {
              type: "BANK_ACCOUNT",
              id: data.source_id,
              name: sourceBankAccount.name,
            },
          },
        };
      });
    } catch (error) {
      console.error("Error prefunding organisation:", error);
      throw new Error("Failed to prefund organisation");
    }
  }

  // Till Balance Operations
  async topupTill(
    tillId: string,
    data: TillBalanceOperationRequest,
    userId: string
  ): Promise<BalanceOperationResponse> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get source vault
        const sourceVault = await tx.vault.findUnique({
          where: { id: data.source_id },
          include: { vault_balances: true },
        });

        if (!sourceVault) {
          throw new Error("Source vault not found");
        }

        // Get till
        const till = await tx.till.findUnique({
          where: { id: tillId },
        });

        if (!till) {
          throw new Error("Till not found");
        }

        // Get or create vault balance
        let vaultBalance = sourceVault.vault_balances.find(
          (vb) => vb.currency_id === till.currency_id
        );

        if (!vaultBalance) {
          vaultBalance = await tx.vaultBalance.create({
            data: {
              vault_id: data.source_id,
              currency_id: till.currency_id!,
              balance: 0,
              locked_balance: 0,
            },
          });
        }

        // Check if vault has sufficient balance
        const vaultBalanceAmount = parseFloat(vaultBalance.balance.toString());
        if (vaultBalanceAmount < data.amount) {
          throw new Error("Insufficient balance in source vault");
        }

        // Get or create till balance
        let tillBalance = await tx.tillBalance.findFirst({
          where: {
            till_id: tillId,
            currency_id: till.currency_id!,
          },
        });

        if (!tillBalance) {
          tillBalance = await tx.tillBalance.create({
            data: {
              till_id: tillId,
              currency_id: till.currency_id!,
              balance: 0,
              locked_balance: 0,
            },
          });
        }

        const oldTillBalance = parseFloat(tillBalance.balance.toString());
        const newTillBalance = oldTillBalance + data.amount;
        const newVaultBalance = vaultBalanceAmount - data.amount;

        // Update balances
        await tx.tillBalance.update({
          where: { id: tillBalance.id },
          data: {
            balance: newTillBalance,
            updated_at: new Date(),
          },
        });

        await tx.vaultBalance.update({
          where: { id: vaultBalance.id },
          data: {
            balance: newVaultBalance,
            updated_at: new Date(),
          },
        });

        // Create balance history records
        await tx.balanceHistory.create({
          data: {
            entity_type: "TILL_BALANCE",
            entity_id: tillBalance.id,
            currency_id: till.currency_id!,
            old_balance: oldTillBalance,
            new_balance: newTillBalance,
            change_amount: data.amount,
            description: data.description,
            created_by: userId,
          },
        });

        await tx.balanceHistory.create({
          data: {
            entity_type: "VAULT_BALANCE",
            entity_id: vaultBalance.id,
            currency_id: till.currency_id!,
            old_balance: vaultBalanceAmount,
            new_balance: newVaultBalance,
            change_amount: -data.amount,
            description: data.description,
            created_by: userId,
          },
        });

        // Create GL Transaction for Till Topup
        const tillGlAccountId =
          await glTransactionService.getGlAccountForEntity(
            "TILL",
            tillId,
            till.organisation_id!
          );
        const vaultGlAccountId =
          await glTransactionService.getGlAccountForEntity(
            "VAULT",
            data.source_id,
            till.organisation_id!
          );

        if (tillGlAccountId && vaultGlAccountId) {
          await glTransactionService.createGlTransaction(
            till.organisation_id!,
            {
              transaction_type: "TILL_TOPUP",
              amount: data.amount,
              currency_id: till.currency_id || undefined,
              description: `Till topup: ${data.description}`,
              vault_id: data.source_id,
              user_till_id: tillId,
              gl_entries: [
                {
                  gl_account_id: tillGlAccountId,
                  amount: data.amount,
                  dr_cr: "DR",
                  description: `Till balance increased by ${data.amount}`,
                },
                {
                  gl_account_id: vaultGlAccountId,
                  amount: data.amount,
                  dr_cr: "CR",
                  description: `Vault balance decreased by ${data.amount}`,
                },
              ],
            },
            userId
          );
        }

        return {
          success: true,
          message: "Till topped up successfully",
          data: {
            id: tillBalance.id,
            old_balance: oldTillBalance,
            new_balance: newTillBalance,
            change_amount: data.amount,
            operation_type: "TOPUP",
            source_entity: {
              type: "VAULT",
              id: data.source_id,
              name: sourceVault.name,
            },
          },
        };
      });
    } catch (error) {
      console.error("Error topping up till:", error);
      throw new Error("Failed to top up till");
    }
  }

  // Vault Balance Operations
  async topupVault(
    vaultId: string,
    data: VaultBalanceOperationRequest,
    userId: string
  ): Promise<BalanceOperationResponse> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get source bank account
        const sourceBankAccount = await tx.bankAccount.findUnique({
          where: { id: data.source_id },
        });

        if (!sourceBankAccount) {
          throw new Error("Source bank account not found");
        }

        // Get vault
        const vault = await tx.vault.findUnique({
          where: { id: vaultId },
        });

        if (!vault) {
          throw new Error("Vault not found");
        }

        // Check if source has sufficient balance
        const sourceBalance = parseFloat(sourceBankAccount.balance.toString());
        if (sourceBalance < data.amount) {
          throw new Error("Insufficient balance in source bank account");
        }

        // Get or create vault balance
        let vaultBalance = await tx.vaultBalance.findFirst({
          where: {
            vault_id: vaultId,
            currency_id: sourceBankAccount.currency_id,
          },
        });

        if (!vaultBalance) {
          vaultBalance = await tx.vaultBalance.create({
            data: {
              vault_id: vaultId,
              currency_id: sourceBankAccount.currency_id,
              balance: 0,
              locked_balance: 0,
            },
          });
        }

        const oldVaultBalance = parseFloat(vaultBalance.balance.toString());
        const newVaultBalance = oldVaultBalance + data.amount;
        const newSourceBalance = sourceBalance - data.amount;

        // Update balances
        await tx.vaultBalance.update({
          where: { id: vaultBalance.id },
          data: {
            balance: newVaultBalance,
            updated_at: new Date(),
          },
        });

        await tx.bankAccount.update({
          where: { id: data.source_id },
          data: {
            balance: newSourceBalance,
            updated_at: new Date(),
          },
        });

        // Create balance history records
        await tx.balanceHistory.create({
          data: {
            entity_type: "VAULT_BALANCE",
            entity_id: vaultBalance.id,
            currency_id: sourceBankAccount.currency_id,
            old_balance: oldVaultBalance,
            new_balance: newVaultBalance,
            change_amount: data.amount,
            description: data.description,
            created_by: userId,
          },
        });

        await tx.balanceHistory.create({
          data: {
            entity_type: "BANK_ACCOUNT",
            entity_id: data.source_id,
            currency_id: sourceBankAccount.currency_id,
            old_balance: sourceBalance,
            new_balance: newSourceBalance,
            change_amount: -data.amount,
            description: data.description,
            created_by: userId,
          },
        });

        // Create GL Transaction for Vault Topup
        const vaultGlAccountId =
          await glTransactionService.getGlAccountForEntity(
            "VAULT",
            vaultId,
            vault.organisation_id!
          );
        const bankGlAccountId =
          await glTransactionService.getGlAccountForEntity(
            "BANK_ACCOUNT",
            data.source_id,
            vault.organisation_id!
          );

        if (vaultGlAccountId && bankGlAccountId) {
          await glTransactionService.createGlTransaction(
            vault.organisation_id!,
            {
              transaction_type: "VAULT_DEPOSIT",
              amount: data.amount,
              currency_id: sourceBankAccount.currency_id,
              description: `Vault topup: ${data.description}`,
              vault_id: vaultId,
              gl_entries: [
                {
                  gl_account_id: vaultGlAccountId,
                  amount: data.amount,
                  dr_cr: "DR",
                  description: `Vault balance increased by ${data.amount}`,
                },
                {
                  gl_account_id: bankGlAccountId,
                  amount: data.amount,
                  dr_cr: "CR",
                  description: `Bank account decreased by ${data.amount}`,
                },
              ],
            },
            userId
          );
        }

        return {
          success: true,
          message: "Vault topped up successfully",
          data: {
            id: vaultBalance.id,
            old_balance: oldVaultBalance,
            new_balance: newVaultBalance,
            change_amount: data.amount,
            operation_type: "TOPUP",
            source_entity: {
              type: "BANK_ACCOUNT",
              id: data.source_id,
              name: sourceBankAccount.name,
            },
          },
        };
      });
    } catch (error) {
      console.error("Error topping up vault:", error);
      throw new Error("Failed to top up vault");
    }
  }

  // Till Withdrawal Operations
  async withdrawTill(
    tillId: string,
    data: TillBalanceOperationRequest,
    userId: string
  ): Promise<BalanceOperationResponse> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get destination vault
        const destVault = await tx.vault.findUnique({
          where: { id: data.source_id },
          include: { vault_balances: true },
        });

        if (!destVault) {
          throw new Error("Destination vault not found");
        }

        // Get till
        const till = await tx.till.findUnique({
          where: { id: tillId },
        });

        if (!till) {
          throw new Error("Till not found");
        }

        // Get or create till balance
        let tillBalance = await tx.tillBalance.findFirst({
          where: {
            till_id: tillId,
            currency_id: till.currency_id!,
          },
        });

        if (!tillBalance) {
          throw new Error("Till balance not found");
        }

        // Check if till has sufficient balance
        const tillBalanceAmount = parseFloat(tillBalance.balance.toString());
        if (tillBalanceAmount < data.amount) {
          throw new Error("Insufficient balance in till");
        }

        // Get or create vault balance
        let vaultBalance = destVault.vault_balances.find(
          (vb) => vb.currency_id === till.currency_id
        );

        if (!vaultBalance) {
          vaultBalance = await tx.vaultBalance.create({
            data: {
              vault_id: data.source_id,
              currency_id: till.currency_id!,
              balance: 0,
              locked_balance: 0,
            },
          });
        }

        const oldTillBalance = tillBalanceAmount;
        const newTillBalance = oldTillBalance - data.amount;
        const oldVaultBalance = parseFloat(vaultBalance.balance.toString());
        const newVaultBalance = oldVaultBalance + data.amount;

        // Update balances
        await tx.tillBalance.update({
          where: { id: tillBalance.id },
          data: {
            balance: newTillBalance,
            updated_at: new Date(),
          },
        });

        await tx.vaultBalance.update({
          where: { id: vaultBalance.id },
          data: {
            balance: newVaultBalance,
            updated_at: new Date(),
          },
        });

        // Create balance history records
        await tx.balanceHistory.create({
          data: {
            entity_type: "TILL_BALANCE",
            entity_id: tillBalance.id,
            currency_id: till.currency_id!,
            old_balance: oldTillBalance,
            new_balance: newTillBalance,
            change_amount: -data.amount,
            description: data.description,
            created_by: userId,
          },
        });

        await tx.balanceHistory.create({
          data: {
            entity_type: "VAULT_BALANCE",
            entity_id: vaultBalance.id,
            currency_id: till.currency_id!,
            old_balance: oldVaultBalance,
            new_balance: newVaultBalance,
            change_amount: data.amount,
            description: data.description,
            created_by: userId,
          },
        });

        // Create GL Transaction for Till Withdrawal
        const tillGlAccountId =
          await glTransactionService.getGlAccountForEntity(
            "TILL",
            tillId,
            till.organisation_id!
          );
        const vaultGlAccountId =
          await glTransactionService.getGlAccountForEntity(
            "VAULT",
            data.source_id,
            till.organisation_id!
          );

        if (tillGlAccountId && vaultGlAccountId) {
          await glTransactionService.createGlTransaction(
            till.organisation_id!,
            {
              transaction_type: "TILL_WITHDRAWAL",
              amount: data.amount,
              currency_id: till.currency_id || undefined,
              description: `Till withdrawal: ${data.description}`,
              vault_id: data.source_id,
              user_till_id: tillId,
              gl_entries: [
                {
                  gl_account_id: vaultGlAccountId,
                  amount: data.amount,
                  dr_cr: "DR",
                  description: `Vault balance increased by ${data.amount}`,
                },
                {
                  gl_account_id: tillGlAccountId,
                  amount: data.amount,
                  dr_cr: "CR",
                  description: `Till balance decreased by ${data.amount}`,
                },
              ],
            },
            userId
          );
        }

        return {
          success: true,
          message: "Till withdrawal successful",
          data: {
            id: tillBalance.id,
            old_balance: oldTillBalance,
            new_balance: newTillBalance,
            change_amount: -data.amount,
            operation_type: "WITHDRAWAL",
            source_entity: {
              type: "VAULT",
              id: data.source_id,
              name: destVault.name,
            },
          },
        };
      });
    } catch (error) {
      console.error("Error withdrawing from till:", error);
      throw new Error("Failed to withdraw from till");
    }
  }

  // Vault Withdrawal Operations
  async withdrawVault(
    vaultId: string,
    data: VaultBalanceOperationRequest,
    userId: string
  ): Promise<BalanceOperationResponse> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Get destination bank account
        const destBankAccount = await tx.bankAccount.findUnique({
          where: { id: data.source_id },
        });

        if (!destBankAccount) {
          throw new Error("Destination bank account not found");
        }

        // Get vault
        const vault = await tx.vault.findUnique({
          where: { id: vaultId },
        });

        if (!vault) {
          throw new Error("Vault not found");
        }

        // Get or create vault balance
        let vaultBalance = await tx.vaultBalance.findFirst({
          where: {
            vault_id: vaultId,
            currency_id: destBankAccount.currency_id,
          },
        });

        if (!vaultBalance) {
          throw new Error("Vault balance not found");
        }

        // Check if vault has sufficient balance
        const vaultBalanceAmount = parseFloat(vaultBalance.balance.toString());
        if (vaultBalanceAmount < data.amount) {
          throw new Error("Insufficient balance in vault");
        }

        const oldVaultBalance = vaultBalanceAmount;
        const newVaultBalance = oldVaultBalance - data.amount;
        const oldBankBalance = parseFloat(destBankAccount.balance.toString());
        const newBankBalance = oldBankBalance + data.amount;

        // Update balances
        await tx.vaultBalance.update({
          where: { id: vaultBalance.id },
          data: {
            balance: newVaultBalance,
            updated_at: new Date(),
          },
        });

        await tx.bankAccount.update({
          where: { id: data.source_id },
          data: {
            balance: newBankBalance,
            updated_at: new Date(),
          },
        });

        // Create balance history records
        await tx.balanceHistory.create({
          data: {
            entity_type: "VAULT_BALANCE",
            entity_id: vaultBalance.id,
            currency_id: destBankAccount.currency_id,
            old_balance: oldVaultBalance,
            new_balance: newVaultBalance,
            change_amount: -data.amount,
            description: data.description,
            created_by: userId,
          },
        });

        await tx.balanceHistory.create({
          data: {
            entity_type: "BANK_ACCOUNT",
            entity_id: data.source_id,
            currency_id: destBankAccount.currency_id,
            old_balance: oldBankBalance,
            new_balance: newBankBalance,
            change_amount: data.amount,
            description: data.description,
            created_by: userId,
          },
        });

        // Create GL Transaction for Vault Withdrawal
        const vaultGlAccountId =
          await glTransactionService.getGlAccountForEntity(
            "VAULT",
            vaultId,
            vault.organisation_id!
          );
        const bankGlAccountId =
          await glTransactionService.getGlAccountForEntity(
            "BANK_ACCOUNT",
            data.source_id,
            vault.organisation_id!
          );

        if (vaultGlAccountId && bankGlAccountId) {
          await glTransactionService.createGlTransaction(
            vault.organisation_id!,
            {
              transaction_type: "VAULT_WITHDRAWAL",
              amount: data.amount,
              currency_id: destBankAccount.currency_id,
              description: `Vault withdrawal: ${data.description}`,
              vault_id: vaultId,
              gl_entries: [
                {
                  gl_account_id: bankGlAccountId,
                  amount: data.amount,
                  dr_cr: "DR",
                  description: `Bank account increased by ${data.amount}`,
                },
                {
                  gl_account_id: vaultGlAccountId,
                  amount: data.amount,
                  dr_cr: "CR",
                  description: `Vault balance decreased by ${data.amount}`,
                },
              ],
            },
            userId
          );
        }

        return {
          success: true,
          message: "Vault withdrawal successful",
          data: {
            id: vaultBalance.id,
            old_balance: oldVaultBalance,
            new_balance: newVaultBalance,
            change_amount: -data.amount,
            operation_type: "WITHDRAWAL",
            source_entity: {
              type: "BANK_ACCOUNT",
              id: data.source_id,
              name: destBankAccount.name,
            },
          },
        };
      });
    } catch (error) {
      console.error("Error withdrawing from vault:", error);
      throw new Error("Failed to withdraw from vault");
    }
  }

  // Get Organisation Balances
  async getOrgBalances(filters: any): Promise<OrgBalanceListResponse> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        base_org_id,
        dest_org_id,
        currency_id,
      } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { base_org: { name: { contains: search, mode: "insensitive" } } },
          { dest_org: { name: { contains: search, mode: "insensitive" } } },
        ];
      }

      if (base_org_id) where.base_org_id = base_org_id;
      if (dest_org_id) where.dest_org_id = dest_org_id;
      if (currency_id) where.currency_id = currency_id;

      const [balances, total] = await Promise.all([
        prisma.orgBalance.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            base_org: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            dest_org: {
              select: {
                id: true,
                name: true,
                type: true,
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
        prisma.orgBalance.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Organisation balances retrieved successfully",
        data: {
          balances: balances.map((balance) => ({
            ...balance,
            balance: parseFloat(balance.balance.toString()),
            locked_balance: balance.locked_balance
              ? parseFloat(balance.locked_balance.toString())
              : null,
            created_at: balance.created_at.toISOString(),
            updated_at: balance.updated_at.toISOString(),
          })) as OrgBalance[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching organisation balances:", error);
      throw new Error("Failed to fetch organisation balances");
    }
  }

  // Get Organisation Balance Stats
  async getOrgBalanceStats(
    organisationId?: string
  ): Promise<OrgBalanceStatsResponse> {
    try {
      const where = organisationId
        ? {
            OR: [
              { base_org_id: organisationId },
              { dest_org_id: organisationId },
            ],
          }
        : {};

      const [totalCount, balanceData, currencyData] = await Promise.all([
        prisma.orgBalance.count({ where }),
        prisma.orgBalance.aggregate({
          where,
          _sum: {
            balance: true,
            locked_balance: true,
          },
        }),
        prisma.orgBalance.groupBy({
          by: ["currency_id"],
          where,
          _count: {
            id: true,
          },
          _sum: {
            balance: true,
          },
        }),
      ]);

      const currencyStats = await Promise.all(
        currencyData.map(async (item) => {
          const currency = await prisma.currency.findUnique({
            where: { id: item.currency_id },
            select: { currency_code: true },
          });

          return {
            currency_id: item.currency_id,
            currency_code: currency?.currency_code || "Unknown",
            count: item._count.id,
            total_balance: item._sum.balance
              ? parseFloat(item._sum.balance.toString())
              : 0,
          };
        })
      );

      return {
        success: true,
        message: "Organisation balance stats retrieved successfully",
        data: {
          totalBalances: totalCount,
          totalBalance: balanceData._sum.balance
            ? parseFloat(balanceData._sum.balance.toString())
            : 0,
          totalLockedBalance: balanceData._sum.locked_balance
            ? parseFloat(balanceData._sum.locked_balance.toString())
            : 0,
          byCurrency: currencyStats,
        },
      };
    } catch (error) {
      console.error("Error fetching organisation balance stats:", error);
      throw new Error("Failed to fetch organisation balance stats");
    }
  }

  // Get organisation balance history
  async getOrgBalanceHistory(orgId: string, filters: any = {}): Promise<any> {
    try {
      const { page = 1, limit = 10, currency_id } = filters;
      const skip = (page - 1) * limit;

      const where: any = {
        OR: [{ base_org_id: orgId }, { dest_org_id: orgId }],
      };

      if (currency_id) {
        where.currency_id = currency_id;
      }

      const [histories, total] = await Promise.all([
        prisma.orgBalance.findMany({
          where,
          include: {
            base_org: {
              select: { id: true, name: true, type: true },
            },
            dest_org: {
              select: { id: true, name: true, type: true },
            },
            currency: {
              select: { id: true, currency_code: true, currency_name: true },
            },
          },
          orderBy: { updated_at: "desc" },
          skip,
          take: limit,
        }),
        prisma.orgBalance.count({ where }),
      ]);

      return {
        success: true,
        message: "Organisation balance history retrieved successfully",
        data: {
          histories: histories.map((balance) => ({
            ...balance,
            balance: parseFloat(balance.balance.toString()),
            locked_balance: balance.locked_balance
              ? parseFloat(balance.locked_balance.toString())
              : null,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error fetching organisation balance history:", error);
      throw new Error("Failed to fetch organisation balance history");
    }
  }

  // Get till balance history
  async getTillBalanceHistory(tillId: string, filters: any = {}): Promise<any> {
    try {
      const { page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      const [histories, total] = await Promise.all([
        prisma.tillBalance.findMany({
          where: { till_id: tillId },
          include: {
            currency: {
              select: { id: true, currency_code: true, currency_name: true },
            },
            till: {
              select: {
                id: true,
                name: true,
                organisation: {
                  select: { id: true, name: true, type: true },
                },
              },
            },
          },
          orderBy: { updated_at: "desc" },
          skip,
          take: limit,
        }),
        prisma.tillBalance.count({ where: { till_id: tillId } }),
      ]);

      return {
        success: true,
        message: "Till balance history retrieved successfully",
        data: {
          histories: histories.map((balance) => ({
            ...balance,
            balance: parseFloat(balance.balance.toString()),
            locked_balance: balance.locked_balance
              ? parseFloat(balance.locked_balance.toString())
              : null,
            organisation: balance.till?.organisation,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error fetching till balance history:", error);
      throw new Error("Failed to fetch till balance history");
    }
  }

  // Get vault balance history
  async getVaultBalanceHistory(
    vaultId: string,
    filters: any = {}
  ): Promise<any> {
    try {
      const { page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;

      const [histories, total] = await Promise.all([
        prisma.vaultBalance.findMany({
          where: { vault_id: vaultId },
          include: {
            currency: {
              select: { id: true, currency_code: true, currency_name: true },
            },
            vault: {
              select: {
                id: true,
                name: true,
                organisation: {
                  select: { id: true, name: true, type: true },
                },
              },
            },
          },
          orderBy: { updated_at: "desc" },
          skip,
          take: limit,
        }),
        prisma.vaultBalance.count({ where: { vault_id: vaultId } }),
      ]);

      return {
        success: true,
        message: "Vault balance history retrieved successfully",
        data: {
          histories: histories.map((balance) => ({
            ...balance,
            balance: parseFloat(balance.balance.toString()),
            locked_balance: balance.locked_balance
              ? parseFloat(balance.locked_balance.toString())
              : null,
            organisation: balance.vault?.organisation,
          })),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error fetching vault balance history:", error);
      throw new Error("Failed to fetch vault balance history");
    }
  }
}
