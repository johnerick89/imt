import { prisma } from "../../lib/prisma.lib";
import type {
  IBankAccount,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
  BankAccountFilters,
  BankAccountListResponse,
  BankAccountResponse,
  BankAccountStats,
  BankAccountStatsResponse,
  TopupRequest,
  WithdrawalRequest,
  BalanceOperationResponse,
} from "./bankaccounts.interfaces";
import { NotFoundError, InsufficientFundsError } from "../../utils/AppError";

export class BankAccountService {
  async createBankAccount(
    data: CreateBankAccountRequest,
    userId: string
  ): Promise<BankAccountResponse> {
    const bankAccount = await prisma.bankAccount.create({
      data: {
        ...data,
        created_by: userId,
      },
      include: {
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        currency: true,
        organisation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Bank account created successfully",
      data: {
        ...bankAccount,
        balance: parseFloat(bankAccount.balance.toString()),
        locked_balance: bankAccount.locked_balance
          ? parseFloat(bankAccount.locked_balance.toString())
          : null,
      } as IBankAccount,
    };
  }

  async getBankAccounts(
    filters: BankAccountFilters
  ): Promise<BankAccountListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      currency_id,
      organisation_id,
      created_by,
    } = filters;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { account_number: { contains: search, mode: "insensitive" } },
        { bank_name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (currency_id) where.currency_id = currency_id;
    if (organisation_id) where.organisation_id = organisation_id;
    if (created_by) where.created_by = created_by;

    const [bankAccounts, total] = await Promise.all([
      prisma.bankAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          currency: true,
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      }),
      prisma.bankAccount.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Bank accounts retrieved successfully",
      data: {
        bankAccounts: bankAccounts.map((account) => ({
          ...account,
          balance: parseFloat(account.balance.toString()),
          locked_balance: account.locked_balance
            ? parseFloat(account.locked_balance.toString())
            : null,
        })) as IBankAccount[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  }

  async getBankAccountById(id: string): Promise<BankAccountResponse> {
    const bankAccount = await prisma.bankAccount.findUnique({
      where: { id },
      include: {
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        currency: true,
        organisation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!bankAccount) {
      throw new NotFoundError("Bank account not found");
    }

    return {
      success: true,
      message: "Bank account retrieved successfully",
      data: {
        ...bankAccount,
        balance: parseFloat(bankAccount.balance.toString()),
        locked_balance: bankAccount.locked_balance
          ? parseFloat(bankAccount.locked_balance.toString())
          : null,
      } as IBankAccount,
    };
  }

  async updateBankAccount(
    id: string,
    data: UpdateBankAccountRequest
  ): Promise<BankAccountResponse> {
    const bankAccount = await prisma.bankAccount.update({
      where: { id },
      data: {
        ...data,
        updated_at: new Date(),
      },
      include: {
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        currency: true,
        organisation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Bank account updated successfully",
      data: {
        ...bankAccount,
        balance: parseFloat(bankAccount.balance.toString()),
        locked_balance: bankAccount.locked_balance
          ? parseFloat(bankAccount.locked_balance.toString())
          : null,
      } as IBankAccount,
    };
  }

  async deleteBankAccount(id: string): Promise<BankAccountResponse> {
    const bankAccount = await prisma.bankAccount.delete({
      where: { id },
      include: {
        created_by_user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        currency: true,
        organisation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Bank account deleted successfully",
      data: {
        ...bankAccount,
        balance: parseFloat(bankAccount.balance.toString()),
        locked_balance: bankAccount.locked_balance
          ? parseFloat(bankAccount.locked_balance.toString())
          : null,
      } as IBankAccount,
    };
  }

  async getBankAccountStats(
    organisationId?: string
  ): Promise<BankAccountStatsResponse> {
    const where = organisationId ? { organisation_id: organisationId } : {};

    const [totalCount, balanceData, currencyData] = await Promise.all([
      prisma.bankAccount.count({ where }),
      prisma.bankAccount.aggregate({
        where,
        _sum: {
          balance: true,
          locked_balance: true,
        },
      }),
      prisma.bankAccount.groupBy({
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
      message: "Bank account stats retrieved successfully",
      data: {
        totalBankAccounts: totalCount,
        totalBalance: balanceData._sum.balance
          ? parseFloat(balanceData._sum.balance.toString())
          : 0,
        totalLockedBalance: balanceData._sum.locked_balance
          ? parseFloat(balanceData._sum.locked_balance.toString())
          : 0,
        byCurrency: currencyStats,
      },
    };
  }

  async topupBankAccount(
    id: string,
    data: TopupRequest,
    userId: string
  ): Promise<BalanceOperationResponse> {
    return await prisma.$transaction(async (tx) => {
      // Get current bank account
      const bankAccount = await tx.bankAccount.findUnique({
        where: { id },
      });

      if (!bankAccount) {
        throw new NotFoundError("Bank account not found");
      }

      const oldBalance = parseFloat(bankAccount.balance.toString());
      const newBalance = oldBalance + data.amount;

      // Update bank account balance
      await tx.bankAccount.update({
        where: { id },
        data: {
          balance: newBalance,
          updated_at: new Date(),
        },
      });

      // Create balance history record
      await tx.balanceHistory.create({
        data: {
          entity_type: "BANK_ACCOUNT",
          entity_id: id,
          currency_id: bankAccount.currency_id,
          old_balance: oldBalance,
          new_balance: newBalance,
          change_amount: data.amount,
          description: data.description,
          created_by: userId,
        },
      });

      return {
        success: true,
        message: "Bank account topped up successfully",
        data: {
          id,
          old_balance: oldBalance,
          new_balance: newBalance,
          change_amount: data.amount,
          operation_type: "TOPUP",
        },
      };
    });
  }

  async withdrawFromBankAccount(
    id: string,
    data: WithdrawalRequest,
    userId: string
  ): Promise<BalanceOperationResponse> {
    return await prisma.$transaction(async (tx) => {
      // Get current bank account
      const bankAccount = await tx.bankAccount.findUnique({
        where: { id },
      });

      if (!bankAccount) {
        throw new NotFoundError("Bank account not found");
      }

      const oldBalance = parseFloat(bankAccount.balance.toString());
      const newBalance = oldBalance - data.amount;

      if (newBalance < 0) {
        throw new InsufficientFundsError("Insufficient balance");
      }

      // Update bank account balance
      await tx.bankAccount.update({
        where: { id },
        data: {
          balance: newBalance,
          updated_at: new Date(),
        },
      });

      // Create balance history record
      await tx.balanceHistory.create({
        data: {
          entity_type: "BANK_ACCOUNT",
          entity_id: id,
          currency_id: bankAccount.currency_id,
          old_balance: oldBalance,
          new_balance: newBalance,
          change_amount: -data.amount,
          description: data.description,
          created_by: userId,
        },
      });

      return {
        success: true,
        message: "Withdrawal from bank account successful",
        data: {
          id,
          old_balance: oldBalance,
          new_balance: newBalance,
          change_amount: -data.amount,
          operation_type: "WITHDRAWAL",
        },
      };
    });
  }
}
