import { AppError } from "../../utils/AppError";
import { prisma } from "../../lib/prisma.lib";
import { OrgBalance, PeriodicOrgBalance } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import { startOfMonth, endOfMonth, differenceInDays } from "date-fns";
import { IUpdateOrgBalance } from "./orgabalances.interfaces";

export class OrgBalanceService {
  async getCurrentPeriodicOrgBalance({
    organisationId,
  }: {
    organisationId: string;
  }) {
    let periodicBalance = await prisma.periodicOrgBalance.findFirst({
      where: {
        OR: [
          { organisation_id: organisationId },
          { org_balance: { dest_org_id: organisationId } },
        ],
        is_current: true,
      },
      include: {
        org_balance: true,
      },
    });

    if (!periodicBalance) {
      await this.createPeriodicOrgBalance({
        organisationId,
      });

      periodicBalance = await prisma.periodicOrgBalance.findFirst({
        where: {
          OR: [
            { organisation_id: organisationId },
            { org_balance: { dest_org_id: organisationId } },
          ],
          is_current: true,
        },
        include: {
          org_balance: true,
        },
      });
    }
    return periodicBalance as unknown as PeriodicOrgBalance & {
      org_balance: OrgBalance;
    };
  }
  async updatePeriodicOrgBalance({
    organisationId,
    amount,
    type,
    userId,
    balanceHistoryId,
  }: IUpdateOrgBalance) {
    return await prisma.$transaction(async (tx) => {
      // Get current periodic balance or create one
      let currentPeriodic = await tx.periodicOrgBalance.findFirst({
        where: {
          OR: [
            { organisation_id: organisationId },
            { org_balance: { dest_org_id: organisationId } },
          ],
          is_current: true,
        },
        include: {
          org_balance: true,
        },
      });

      if (!currentPeriodic) {
        // Create periodic balance using closePeriodicOrgBalance logic
        await this.createPeriodicOrgBalance({
          userId,
          organisationId,
        });

        // Fetch the newly created periodic balance
        currentPeriodic = await tx.periodicOrgBalance.findFirst({
          where: {
            OR: [
              { organisation_id: organisationId },
              { org_balance: { dest_org_id: organisationId } },
            ],
            is_current: true,
          },
          include: {
            org_balance: true,
          },
        });
      }

      if (!currentPeriodic) {
        throw new AppError("Failed to get or create periodic balance", 500);
      }

      const amountDecimal = new Decimal(amount || 0);
      let updateData: any = {};

      // Update appropriate column based on type
      switch (type) {
        case "deposit":
          updateData.deposits_amount = (
            currentPeriodic.deposits_amount || new Decimal(0)
          ).add(amountDecimal);
          break;
        case "withdrawal":
          updateData.withdrawals_amount = (
            currentPeriodic.withdrawals_amount || new Decimal(0)
          ).add(amountDecimal);
          break;
        case "commission":
          updateData.commissions = (
            currentPeriodic.commissions || new Decimal(0)
          ).add(amountDecimal);
          break;
        case "transaction_in":
          updateData.transactions_in = (
            currentPeriodic.transactions_in || new Decimal(0)
          ).add(amountDecimal);
          break;
        case "transaction_out":
          updateData.transactions_out = (
            currentPeriodic.transactions_out || new Decimal(0)
          ).add(amountDecimal);
          break;
        default:
          throw new AppError(`Invalid update type: ${type}`, 400);
      }

      // Update the periodic balance
      const updatedPeriodic = await tx.periodicOrgBalance.update({
        where: { id: currentPeriodic.id },
        data: updateData,
        include: {
          org_balance: true,
        },
      });

      // Backfill balance history if balanceHistoryId is provided
      if (balanceHistoryId) {
        await tx.balanceHistory.update({
          where: { id: balanceHistoryId },
          data: {
            periodic_org_balance_id: currentPeriodic.id,
          },
        });
      }

      return updatedPeriodic;
    });
  }

  async createPeriodicOrgBalance({
    userId,
    organisationId,
  }: {
    userId?: string;
    organisationId: string;
  }) {
    return await prisma.$transaction(async (tx) => {
      const periodStart = startOfMonth(new Date());

      // Try find an existing OrgBalance for this organisation (as destination)
      let orgBalance = await tx.orgBalance.findFirst({
        where: { dest_org_id: organisationId },
        orderBy: { created_at: "asc" },
      });

      if (!orgBalance) {
        // Create a basic OrgBalance using organisation's base currency; set zero balances/limit
        const org = await tx.organisation.findUnique({
          where: { id: organisationId },
          select: { id: true, base_currency_id: true },
        });

        const customerOrganisation = await tx.organisation.findFirst({
          where: { type: "CUSTOMER" },
        });

        if (!customerOrganisation) {
          throw new AppError("Customer organisation not found", 404);
        }

        if (!org || !org.base_currency_id) {
          throw new AppError(
            "Organisation or its base currency not configured; cannot initialize periodic balance",
            400
          );
        }

        orgBalance = await tx.orgBalance.create({
          data: {
            base_org_id: customerOrganisation.id,
            dest_org_id: org.id,
            currency_id: org.base_currency_id,
            balance: new Decimal(0),
            limit: new Decimal(0),
            created_by: userId,
          },
        });
      }

      // Check if current period already exists
      const existingPeriod = await tx.periodicOrgBalance.findFirst({
        where: {
          org_balance_id: orgBalance.id,
          year: periodStart.getFullYear(),
          month: periodStart.getMonth() + 1,
        },
      });

      if (existingPeriod) {
        console.warn("Periodic balance for current month already exists");
        return existingPeriod;
      }

      return await tx.periodicOrgBalance.create({
        data: {
          org_balance_id: orgBalance.id,
          year: periodStart.getFullYear(),
          month: periodStart.getMonth() + 1,
          date_from: periodStart,
          date_to: null,
          is_current: true,
          opening_balance: new Decimal(0),
          transactions_in: new Decimal(0),
          transactions_out: new Decimal(0),
          commissions: new Decimal(0),
          deposits_amount: new Decimal(0),
          withdrawals_amount: new Decimal(0),
          limit: orgBalance.limit ?? new Decimal(0),
          created_by: userId,
          organisation_id: orgBalance.dest_org_id,
        },
        include: {
          org_balance: true,
        },
      });
    });
  }

  async closePeriodicOrgBalance({
    userId,
    organisationId,
  }: {
    userId: string;
    organisationId?: string;
  }) {
    await prisma.$transaction(async (tx) => {
      // For each OrgBalance (agencies + central)...
      const current = await tx.periodicOrgBalance.findFirst({
        where: {
          OR: [
            { organisation_id: organisationId },
            { org_balance: { dest_org_id: organisationId } },
          ],
          is_current: true,
        },
        include: {
          org_balance: true,
        },
      });

      if (!current) {
        // No current period: initialize one for the current month
        const periodStart = startOfMonth(new Date());

        // Try find an existing OrgBalance for this organisation (as destination)
        let orgBalance = await tx.orgBalance.findFirst({
          where: { dest_org_id: organisationId },
          orderBy: { created_at: "asc" },
        });

        if (!orgBalance) {
          // Create a basic OrgBalance using organisation's base currency; set zero balances/limit
          const org = await tx.organisation.findUnique({
            where: { id: organisationId! },
            select: { id: true, base_currency_id: true },
          });

          const customerOrganisation = await tx.organisation.findFirst({
            where: { type: "CUSTOMER" },
          });

          if (!customerOrganisation) {
            throw new AppError("Customer organisation not found", 404);
          }

          if (!org || !org.base_currency_id) {
            throw new AppError(
              "Organisation or its base currency not configured; cannot initialize periodic balance",
              400
            );
          }

          orgBalance = await tx.orgBalance.create({
            data: {
              base_org_id: customerOrganisation.id,
              dest_org_id: org.id,
              currency_id: org.base_currency_id,
              balance: new Decimal(0),
              limit: new Decimal(0),
              created_by: userId,
            },
          });
        }

        await tx.periodicOrgBalance.create({
          data: {
            org_balance_id: orgBalance.id,
            year: periodStart.getFullYear(),
            month: periodStart.getMonth() + 1,
            date_from: periodStart,
            date_to: null,
            is_current: true,
            opening_balance: orgBalance.balance ?? new Decimal(0),
            transactions_in: new Decimal(0),
            transactions_out: new Decimal(0),
            commissions: new Decimal(0),
            deposits_amount: new Decimal(0),
            withdrawals_amount: new Decimal(0),
            limit: orgBalance.limit ?? new Decimal(0),
            created_by: userId,
            organisation_id: orgBalance.dest_org_id,
          },
        });

        return; // Initialization done; nothing to close this round
      }

      // Check if we're within 3 days of month end before allowing closure
      const now = new Date();
      const currentMonthEnd = endOfMonth(current.date_from);
      const daysToMonthEnd = differenceInDays(currentMonthEnd, now);

      if (daysToMonthEnd > 3) {
        console.warn(
          `Cannot close periodic balance for organisation ${organisationId}: ` +
            `Still ${daysToMonthEnd} days until month end (threshold: 3 days). ` +
            `Current period: ${current.date_from.toISOString().split("T")[0]}`
        );
        return; // Skip closing and continue without error
      }

      // Close: Compute & set closing
      const closing = current.opening_balance
        .add(current.transactions_in ?? new Decimal(0))
        .sub(current.transactions_out ?? new Decimal(0))
        .add(current.commissions ?? new Decimal(0))
        .add(current.deposits_amount ?? new Decimal(0))
        .sub(current.withdrawals_amount ?? new Decimal(0));
      await tx.periodicOrgBalance.update({
        where: { id: current.id },
        data: {
          closing_balance: closing,
          date_to: endOfMonth(current.date_from), // e.g., via date-fns
          is_current: false,
        },
      });

      // Sync to master OrgBalance
      await tx.orgBalance.update({
        where: { id: current.org_balance.id },
        data: { balance: closing },
      });

      // Open next period
      const nextFrom = startOfMonth(
        new Date(current.date_from.setMonth(current.date_from.getMonth() + 1))
      );
      const nextLimit = current.limit ?? current.org_balance.limit; // Carry forward or reset (app logic)
      await tx.periodicOrgBalance.create({
        data: {
          org_balance_id: current.org_balance.id,
          year: nextFrom.getFullYear(),
          month: nextFrom.getMonth() + 1,
          date_from: nextFrom,
          date_to: null,
          is_current: true,
          opening_balance: closing,
          transactions_in: new Decimal(0),
          transactions_out: new Decimal(0),
          commissions: new Decimal(0),
          deposits_amount: new Decimal(0),
          withdrawals_amount: new Decimal(0),
          limit: nextLimit, // Or prompt for reset
          created_by: userId,
          organisation_id: current.org_balance.dest_org_id,
        },
      });
    });
  }

  async closeAllPeriodicOrgBalances({ userId }: { userId: string }) {
    const agencies = await prisma.organisation.findMany({
      where: {
        status: "ACTIVE",
      },
    });

    let successCount = 0;
    let errorCount = 0;

    for (const agency of agencies) {
      try {
        await this.closePeriodicOrgBalance({
          userId,
          organisationId: agency.id,
        });
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(
          `Error closing periodic org balance for agency ${agency.id}:`,
          error
        );
      }
    }

    return {
      success: true,
      message: `All periodic org balances closed successfully. Success: ${successCount}, Error: ${errorCount}`,
    };
  }
}
