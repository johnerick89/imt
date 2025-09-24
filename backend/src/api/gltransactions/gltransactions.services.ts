import { prisma } from "../../lib/prisma.lib";
import {
  IGlTransaction,
  GlTransactionFilters,
  GlTransactionListResponse,
  GlTransactionResponse,
  GlTransactionStats,
  GlTransactionStatsResponse,
  CreateGlTransactionRequest,
  ReverseGlTransactionRequest,
  ReverseGlTransactionResponse,
} from "./gltransactions.interfaces";

export class GlTransactionService {
  // Get GL Transactions
  async getGlTransactions(
    organisationId: string,
    filters: GlTransactionFilters
  ): Promise<GlTransactionListResponse> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        transaction_type,
        status,
        currency_id,
        vault_id,
        user_till_id,
        customer_id,
        transaction_id,
        date_from,
        date_to,
      } = filters;

      const where: any = {
        organisation_id: organisationId,
      };

      if (search) {
        where.OR = [
          { description: { contains: search, mode: "insensitive" } },
          { transaction_type: { contains: search, mode: "insensitive" } },
        ];
      }

      if (transaction_type) where.transaction_type = transaction_type;
      if (status) where.status = status;
      if (currency_id) where.currency_id = currency_id;
      if (vault_id) where.vault_id = vault_id;
      if (user_till_id) where.user_till_id = user_till_id;
      if (customer_id) where.customer_id = customer_id;
      if (transaction_id) where.transaction_id = transaction_id;

      if (date_from || date_to) {
        where.created_at = {};
        if (date_from) where.created_at.gte = new Date(date_from);
        if (date_to) where.created_at.lte = new Date(date_to);
      }

      const [glTransactions, total] = await Promise.all([
        prisma.gLTransaction.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            currency: true,
            vault: true,
            user_till: {
              include: {
                till: true,
                user: true,
              },
            },
            till: true,
            organisation: true,
            customer: true,
            transaction: true,
            gl_entries: {
              include: {
                gl_account: {
                  include: {
                    currency: true,
                  },
                },
              },
            },
            created_by_user: true,
          },
        }),
        prisma.gLTransaction.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "GL Transactions retrieved successfully",
        data: {
          glTransactions: glTransactions.map((transaction) => ({
            ...transaction,
            amount: parseFloat(transaction.amount.toString()),
            gl_entries: transaction.gl_entries?.map((entry) => ({
              ...entry,
            })),
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
      console.error("Error fetching GL Transactions:", error);
      return {
        success: false,
        message: "Failed to fetch GL Transactions",
        data: {
          glTransactions: [],
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

  // Get GL Transaction by ID
  async getGlTransactionById(
    organisationId: string,
    id: string
  ): Promise<GlTransactionResponse> {
    try {
      const glTransaction = await prisma.gLTransaction.findFirst({
        where: {
          id,
          organisation_id: organisationId,
        },
        include: {
          currency: true,
          vault: true,
          user_till: {
            include: {
              till: true,
              user: true,
            },
          },
          till: true,
          organisation: true,
          customer: true,
          transaction: true,
          gl_entries: {
            include: {
              gl_account: {
                include: {
                  currency: true,
                },
              },
            },
          },
          created_by_user: true,
        },
      });

      if (!glTransaction) {
        return {
          success: false,
          message: "GL Transaction not found",
          data: {} as IGlTransaction,
          error: "GL Transaction not found",
        };
      }

      return {
        success: true,
        message: "GL Transaction retrieved successfully",
        data: {
          ...glTransaction,
          amount: parseFloat(glTransaction.amount.toString()),
          gl_entries: glTransaction.gl_entries?.map((entry) => ({
            ...entry,
            // amount: parseFloat(entry.amount.toString()),
          })),
        },
      };
    } catch (error) {
      console.error("Error fetching GL Transaction:", error);
      return {
        success: false,
        message: "Failed to fetch GL Transaction",
        data: {} as IGlTransaction,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Get GL Transaction Stats
  async getGlTransactionStats(
    organisationId: string
  ): Promise<GlTransactionStatsResponse> {
    try {
      const where = { organisation_id: organisationId };

      const [totalTransactions, transactions] = await Promise.all([
        prisma.gLTransaction.count({ where }),
        prisma.gLTransaction.findMany({
          where,
          include: {
            currency: true,
          },
        }),
      ]);

      const totalAmount = transactions.reduce((sum, transaction) => {
        return sum + parseFloat(transaction.amount.toString());
      }, 0);

      // Group by status
      const byStatus = transactions.reduce((acc, transaction) => {
        const status = transaction.status;
        if (!acc[status]) {
          acc[status] = { count: 0, total_amount: 0 };
        }
        acc[status].count++;
        acc[status].total_amount += parseFloat(transaction.amount.toString());
        return acc;
      }, {} as Record<string, { count: number; total_amount: number }>);

      const byStatusArray = Object.entries(byStatus).map(([status, data]) => ({
        status,
        ...data,
      }));

      // Group by type
      const byType = transactions.reduce((acc, transaction) => {
        const type = transaction.transaction_type;
        if (!acc[type]) {
          acc[type] = { count: 0, total_amount: 0 };
        }
        acc[type].count++;
        acc[type].total_amount += parseFloat(transaction.amount.toString());
        return acc;
      }, {} as Record<string, { count: number; total_amount: number }>);

      const byTypeArray = Object.entries(byType).map(([type, data]) => ({
        type,
        ...data,
      }));

      // Group by currency
      const byCurrency = transactions.reduce((acc, transaction) => {
        if (transaction.currency) {
          const currencyId = transaction.currency.id;
          if (!acc[currencyId]) {
            acc[currencyId] = {
              currency_id: currencyId,
              currency_code: transaction.currency.currency_code,
              count: 0,
              total_amount: 0,
            };
          }
          acc[currencyId].count++;
          acc[currencyId].total_amount += parseFloat(
            transaction.amount.toString()
          );
        }
        return acc;
      }, {} as Record<string, { currency_id: string; currency_code: string; count: number; total_amount: number }>);

      const byCurrencyArray = Object.values(byCurrency);

      return {
        success: true,
        message: "GL Transaction stats retrieved successfully",
        data: {
          totalTransactions,
          totalAmount,
          byStatus: byStatusArray,
          byType: byTypeArray,
          byCurrency: byCurrencyArray,
        },
      };
    } catch (error) {
      console.error("Error fetching GL Transaction stats:", error);
      return {
        success: false,
        message: "Failed to fetch GL Transaction stats",
        data: {
          totalTransactions: 0,
          totalAmount: 0,
          byStatus: [],
          byType: [],
          byCurrency: [],
        },
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Create GL Transaction (internal method for other services)
  async createGlTransaction(
    organisationId: string,
    data: CreateGlTransactionRequest,
    userId: string
  ): Promise<GlTransactionResponse> {
    const result = await prisma.$transaction(async (tx) => {
      // Create the GL Transaction
      const glTransaction = await tx.gLTransaction.create({
        data: {
          transaction_type: data.transaction_type,
          amount: parseFloat(data.amount.toString()),
          currency_id: data.currency_id,
          description: data.description,
          vault_id: data.vault_id,
          till_id: data.till_id,
          customer_id: data.customer_id,
          transaction_id: data.transaction_id,
          organisation_id: organisationId,
          created_by: userId,
          status: "POSTED", // Auto-post transactions created by services
        },
        include: {
          currency: true,
          vault: true,
          user_till: {
            include: {
              till: true,
              user: true,
            },
          },
          till: true,
          organisation: true,
          customer: true,
          transaction: true,
          created_by_user: true,
        },
      });

      // Create GL Entries
      const glEntries = await Promise.all(
        data.gl_entries.map((entry) =>
          tx.glEntry.create({
            data: {
              gl_account_id: entry.gl_account_id,
              gl_transaction_id: glTransaction.id,
              amount: parseFloat(entry.amount.toString()),
              dr_cr: entry.dr_cr,
              description: entry.description,
              created_by: userId,
            },
            include: {
              gl_account: {
                include: {
                  currency: true,
                },
              },
            },
          })
        )
      );

      // Update GL Account balances
      for (const entry of glEntries) {
        const glAccount = await tx.glAccount.findUnique({
          where: { id: entry.gl_account_id },
        });

        if (glAccount) {
          const currentBalance = glAccount.balance
            ? parseFloat(glAccount.balance.toString())
            : 0;
          const entryAmount = parseFloat(entry.amount.toString());
          const newBalance =
            entry.dr_cr === "DR"
              ? currentBalance + entryAmount
              : currentBalance - entryAmount;

          await tx.glAccount.update({
            where: { id: entry.gl_account_id },
            data: {
              balance: newBalance,
            },
          });

          // Note: Balance history for GL accounts is not tracked in the current schema
          // GL account balance changes are tracked through GL entries themselves
        }
      }

      return {
        ...glTransaction,
        amount: parseFloat(glTransaction.amount.toString()),
        gl_entries: glEntries.map((entry) => ({
          ...entry,
          amount: parseFloat(entry.amount.toString()),
        })),
      } as unknown as IGlTransaction;
    });

    return {
      success: true,
      message: "GL Transaction created successfully",
      data: {
        ...result,
        amount: parseFloat(result.amount.toString()),
      },
    };
  }

  // Reverse GL Transaction
  async reverseGlTransaction(
    organisationId: string,
    id: string,
    data: ReverseGlTransactionRequest,
    userId: string
  ): Promise<ReverseGlTransactionResponse> {
    try {
      const result = await prisma.$transaction(async (tx) => {
        // Get the original transaction
        const originalTransaction = await tx.gLTransaction.findFirst({
          where: {
            id,
            organisation_id: organisationId,
          },
          include: {
            gl_entries: {
              include: {
                gl_account: true,
              },
            },
          },
        });

        if (!originalTransaction) {
          throw new Error("GL Transaction not found");
        }

        if (originalTransaction.status !== "POSTED") {
          throw new Error("Only posted transactions can be reversed");
        }

        // Create reversal transaction
        const reversalTransaction = await tx.gLTransaction.create({
          data: {
            transaction_type: originalTransaction.transaction_type.includes(
              "REVERSAL"
            )
              ? originalTransaction.transaction_type
              : (`${originalTransaction.transaction_type}_REVERSAL` as any),
            amount: parseFloat(originalTransaction.amount.toString()),
            currency_id: originalTransaction.currency_id,
            description:
              data.description ||
              `Reversal of: ${originalTransaction.description}`,
            vault_id: originalTransaction.vault_id,
            user_till_id: originalTransaction.user_till_id,
            organisation_id: organisationId,
            customer_id: originalTransaction.customer_id,
            transaction_id: originalTransaction.transaction_id,
            status: "POSTED",
            created_by: userId,
          },
          include: {
            currency: true,
            vault: true,
            user_till: {
              include: {
                till: true,
                user: true,
              },
            },
            organisation: true,
            customer: true,
            transaction: true,
            created_by_user: true,
          },
        });

        // Create reversal GL entries (reverse DR/CR)
        const reversalEntries = await Promise.all(
          originalTransaction.gl_entries.map((entry) =>
            tx.glEntry.create({
              data: {
                gl_account_id: entry.gl_account_id,
                gl_transaction_id: reversalTransaction.id,
                amount: parseFloat(entry.amount.toString()),
                dr_cr: entry.dr_cr === "DR" ? "CR" : "DR", // Reverse DR/CR
                description: `Reversal: ${entry.description}`,
                created_by: userId,
              },
              include: {
                gl_account: {
                  include: {
                    currency: true,
                  },
                },
              },
            })
          )
        );

        // Update GL Account balances for reversal
        for (const entry of reversalEntries) {
          const glAccount = await tx.glAccount.findUnique({
            where: { id: entry.gl_account_id },
          });

          if (glAccount) {
            const currentBalance = glAccount.balance
              ? parseFloat(glAccount.balance.toString())
              : 0;
            const entryAmount = parseFloat(entry.amount.toString());
            const newBalance =
              entry.dr_cr === "DR"
                ? currentBalance + entryAmount
                : currentBalance - entryAmount;

            await tx.glAccount.update({
              where: { id: entry.gl_account_id },
              data: {
                balance: newBalance,
              },
            });

            // Note: Balance history for GL accounts is not tracked in the current schema
            // GL account balance changes are tracked through GL entries themselves
          }
        }

        return {
          original_transaction: {
            ...originalTransaction,
            amount: parseFloat(originalTransaction.amount.toString()),
            gl_entries: originalTransaction.gl_entries.map((entry) => ({
              ...entry,
              amount: parseFloat(entry.amount.toString()),
            })),
          } as unknown as IGlTransaction,
          reversal_transaction: {
            ...reversalTransaction,
            amount: parseFloat(reversalTransaction.amount.toString()),
            gl_entries: reversalEntries.map((entry) => ({
              ...entry,
              amount: parseFloat(entry.amount.toString()),
            })),
          } as unknown as IGlTransaction,
        };
      });

      return {
        success: true,
        message: "GL Transaction reversed successfully",
        data: result,
      };
    } catch (error) {
      console.error("Error reversing GL Transaction:", error);
      return {
        success: false,
        message: "Failed to reverse GL Transaction",
        data: {
          original_transaction: {} as IGlTransaction,
          reversal_transaction: {} as IGlTransaction,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // Helper method to get GL Account for specific entity (for other services)
  async getGlAccountForEntity(
    entityType:
      | "VAULT"
      | "TILL"
      | "BANK_ACCOUNT"
      | "CHARGE"
      | "CUSTOMER"
      | "ORG_BALANCE",
    entityId: string,
    organisationId: string
  ): Promise<string | null> {
    try {
      let glAccount = null;

      switch (entityType) {
        case "VAULT":
          glAccount = await prisma.glAccount.findFirst({
            where: {
              vault_id: entityId,
              organisation_id: organisationId,
            },
          });
          break;
        case "TILL":
          glAccount = await prisma.glAccount.findFirst({
            where: {
              till_id: entityId,
              organisation_id: organisationId,
            },
          });
          break;
        case "BANK_ACCOUNT":
          glAccount = await prisma.glAccount.findFirst({
            where: {
              bank_account_id: entityId,
              organisation_id: organisationId,
            },
          });
          break;
        case "CHARGE":
          glAccount = await prisma.glAccount.findFirst({
            where: {
              charge_id: entityId,
              organisation_id: organisationId,
            },
          });
          break;
        case "CUSTOMER":
          // For customers, we might need a different approach
          // This could be a customer-specific GL account or a general customer account
          glAccount = await prisma.glAccount.findFirst({
            where: {
              name: { contains: "Customer", mode: "insensitive" },
              organisation_id: organisationId,
            },
          });
          break;
        case "ORG_BALANCE":
          // For organisation balances, look for org balance GL account
          glAccount = await prisma.glAccount.findFirst({
            where: {
              org_balance_id: entityId,
              organisation_id: organisationId,
            },
          });
          break;
      }

      return glAccount?.id || null;
    } catch (error) {
      console.error("Error getting GL Account for entity:", error);
      return null;
    }
  }
}
