import { prisma } from "../../lib/prisma.lib";
import type {
  DashboardData,
  TransactionSummary,
  FinancialBalances,
  ChargesAndPayments,
  CustomerBeneficiaryInsights,
  OrganisationCorridorActivity,
  SystemHealth,
} from "./dashboard.interfaces";

export class DashboardService {
  async getDashboardData(organisationId: string): Promise<DashboardData> {
    const [
      transactionSummary,
      financialBalances,
      chargesAndPayments,
      customerBeneficiaryInsights,
      organisationCorridorActivity,
      systemHealth,
    ] = await Promise.all([
      this.getTransactionSummary(organisationId),
      this.getFinancialBalances(organisationId),
      this.getChargesAndPayments(organisationId),
      this.getCustomerBeneficiaryInsights(organisationId),
      this.getOrganisationCorridorActivity(organisationId),
      this.getSystemHealth(organisationId),
    ]);

    return {
      transactionSummary,
      financialBalances,
      chargesAndPayments,
      customerBeneficiaryInsights,
      organisationCorridorActivity,
      systemHealth,
    };
  }

  private async getTransactionSummary(
    organisationId: string
  ): Promise<TransactionSummary> {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get organisation's base currency
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
      select: { base_currency_id: true },
    });

    const baseCurrencyId = organisation?.base_currency_id;

    // Transaction counts
    const [todayCount, weekCount, monthCount] = await Promise.all([
      prisma.transaction.count({
        where: {
          OR: [
            { origin_organisation_id: organisationId },
            { destination_organisation_id: organisationId },
          ],
          created_at: { gte: todayStart },
        },
      }),
      prisma.transaction.count({
        where: {
          OR: [
            { origin_organisation_id: organisationId },
            { destination_organisation_id: organisationId },
          ],
          created_at: { gte: weekStart },
        },
      }),
      prisma.transaction.count({
        where: {
          OR: [
            { origin_organisation_id: organisationId },
            { destination_organisation_id: organisationId },
          ],
          created_at: { gte: monthStart },
        },
      }),
    ]);

    // Transaction values
    const [todayValue, weekValue, monthValue] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          OR: [
            { origin_organisation_id: organisationId },
            { destination_organisation_id: organisationId },
          ],
          created_at: { gte: todayStart },
          origin_currency_id: baseCurrencyId ?? undefined,
        },
        _sum: { origin_amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          OR: [
            { origin_organisation_id: organisationId },
            { destination_organisation_id: organisationId },
          ],
          created_at: { gte: weekStart },
          origin_currency_id: baseCurrencyId ?? undefined,
        },
        _sum: { origin_amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          OR: [
            { origin_organisation_id: organisationId },
            { destination_organisation_id: organisationId },
          ],
          created_at: { gte: monthStart },
          origin_currency_id: baseCurrencyId ?? undefined,
        },
        _sum: { origin_amount: true },
      }),
    ]);

    // Pending transactions
    const pendingCount = await prisma.transaction.count({
      where: {
        OR: [
          { origin_organisation_id: organisationId },
          { destination_organisation_id: organisationId },
        ],
        status: { in: ["PENDING", "PENDING_APPROVAL"] },
      },
    });

    // Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        OR: [
          { origin_organisation_id: organisationId },
          { destination_organisation_id: organisationId },
        ],
      },
      include: {
        origin_currency: { select: { currency_code: true } },
      },
      orderBy: { created_at: "desc" },
      take: 10,
    });

    // Transaction trend (last 30 days)
    const trendStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const trendData = await prisma.transaction.groupBy({
      by: ["created_at"],
      where: {
        OR: [
          { origin_organisation_id: organisationId },
          { destination_organisation_id: organisationId },
        ],
        created_at: { gte: trendStart },
      },
      _count: { id: true },
      _sum: { origin_amount: true },
    });

    const currency = await prisma.currency.findUnique({
      where: { id: baseCurrencyId || "" },
      select: { currency_code: true },
    });

    return {
      totalTransactions: {
        today: todayCount,
        week: weekCount,
        month: monthCount,
      },
      transactionValue: {
        today: todayValue._sum?.origin_amount
          ? parseFloat(todayValue._sum.origin_amount.toString())
          : 0,
        week: weekValue._sum?.origin_amount
          ? parseFloat(weekValue._sum.origin_amount.toString())
          : 0,
        month: monthValue._sum?.origin_amount
          ? parseFloat(monthValue._sum.origin_amount.toString())
          : 0,
        currency: currency?.currency_code || "USD",
      },
      pendingTransactions: pendingCount,
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        amount: parseFloat(tx.origin_amount.toString()),
        type: tx.direction,
        status: tx.status,
        created_at: tx.created_at?.toISOString(),
        currency: tx.origin_currency?.currency_code || "USD",
      })),
      transactionTrend: trendData.map((item) => ({
        date: item.created_at?.toISOString().split("T")[0],
        count: item._count?.id || 0,
        value: item._sum?.origin_amount
          ? parseFloat(item._sum.origin_amount.toString())
          : 0,
      })),
    } as unknown as TransactionSummary;
  }

  private async getFinancialBalances(
    organisationId: string
  ): Promise<FinancialBalances> {
    // Till balances
    const tills = await prisma.till.findMany({
      where: { organisation_id: organisationId },
      include: {
        currency: { select: { currency_code: true } },
      },
    });

    const totalTillBalance = tills.reduce((sum, balance) => {
      if (balance.balance === null || balance.balance === undefined) {
        return sum;
      }
      return sum + parseFloat(balance.balance.toString());
    }, 0);

    // Vault balances
    const vaults = await prisma.vault.findMany({
      where: {
        organisation_id: organisationId,
      },
      include: {
        currency: { select: { currency_code: true } },
      },
    });

    const totalVaultBalance = vaults.reduce((sum, balance) => {
      if (balance.balance === null || balance.balance === undefined) {
        return sum;
      }
      return sum + parseFloat(balance.balance.toString());
    }, 0);

    // Bank account balances
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { organisation_id: organisationId },
      include: {
        currency: { select: { currency_code: true } },
      },
    });

    const totalBankBalance = bankAccounts.reduce((sum, account) => {
      return sum + parseFloat(account.balance.toString());
    }, 0);

    // Partner receivables
    const partnerBalances = await prisma.orgBalance.findMany({
      where: {
        OR: [{ base_org_id: organisationId }, { dest_org_id: organisationId }],
      },
      include: {
        base_org: { select: { id: true, name: true } },
        dest_org: { select: { id: true, name: true } },
        currency: { select: { currency_code: true } },
      },
    });

    const totalPartnerBalance = partnerBalances.reduce((sum, balance) => {
      return sum + parseFloat(balance.balance.toString());
    }, 0);

    // Low balance alerts (simplified - would need GL account min balances)
    const lowBalanceAlerts = [
      ...tills
        .filter(
          (balance) =>
            balance.balance !== null &&
            parseFloat(balance.balance.toString()) < 1000 &&
            (balance as any).till // Ensure till property exists
        )
        .map((balance) => ({
          type: "TILL" as const,
          id: (balance as any).till?.id || balance.id,
          name: (balance as any).till?.name || "",
          balance:
            balance.balance !== null
              ? parseFloat(balance.balance.toString())
              : 0,
          minBalance: 1000,
          currency: balance.currency?.currency_code || "USD",
        })),
    ];

    return {
      tillBalances: {
        total: totalTillBalance,
        currency: tills[0]?.currency?.currency_code || "USD",
        lowBalanceTills: lowBalanceAlerts.filter(
          (alert) => alert.type === "TILL"
        ),
      },
      vaultBalances: {
        total: totalVaultBalance,
        currency: vaults[0]?.currency?.currency_code || "USD",
      },
      bankAccountBalances: {
        total: totalBankBalance,
        currency: bankAccounts[0]?.currency?.currency_code || "USD",
      },
      partnerReceivables: {
        total: totalPartnerBalance,
        currency: partnerBalances[0]?.currency?.currency_code || "USD",
        partners: partnerBalances.map((balance) => ({
          orgId: balance.dest_org?.id || balance.base_org?.id || "",
          orgName: balance.dest_org?.name || balance.base_org?.name || "",
          balance:
            balance.balance !== null
              ? parseFloat(balance.balance.toString())
              : 0,
          currency: balance.currency?.currency_code || "USD",
        })),
      },
      lowBalanceAlerts,
    };
  }

  private async getChargesAndPayments(
    organisationId: string
  ): Promise<ChargesAndPayments> {
    // Pending charges
    const pendingCharges = await prisma.transactionCharge.findMany({
      where: {
        transaction: {
          OR: [
            { origin_organisation_id: organisationId },
            { destination_organisation_id: organisationId },
          ],
        },
        status: "PENDING",
      },
      include: {
        transaction: {
          include: {
            origin_currency: { select: { currency_code: true } },
          },
        },
      },
    });

    const totalPendingCharges = pendingCharges.reduce((sum, charge) => {
      return sum + parseFloat(charge.external_amount?.toString() || "0");
    }, 0);

    const chargesByType = pendingCharges.reduce((acc, charge) => {
      const type = charge.type;
      if (!acc[type]) {
        acc[type] = { amount: 0, count: 0 };
      }
      acc[type].amount += parseFloat(charge.external_amount?.toString() || "0");
      acc[type].count += 1;
      return acc;
    }, {} as Record<string, { amount: number; count: number }>);

    // Recent batch payments
    const recentPayments = await prisma.chargesPayment.findMany({
      where: { organisation_id: organisationId },
      orderBy: { date_completed: "desc" },
      take: 5,
    });

    // Charge breakdown (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const chargeBreakdown = await prisma.transactionCharge.groupBy({
      by: ["type"],
      where: {
        transaction: {
          OR: [
            { origin_organisation_id: organisationId },
            { destination_organisation_id: organisationId },
          ],
          created_at: { gte: thirtyDaysAgo },
        },
      },
      _sum: { external_amount: true },
    });

    const totalCharges = chargeBreakdown.reduce((sum, item) => {
      return (
        sum +
        (item._sum?.external_amount
          ? parseFloat(item._sum.external_amount.toString())
          : 0)
      );
    }, 0);

    return {
      pendingCharges: {
        total: totalPendingCharges,
        currency:
          pendingCharges[0]?.transaction?.origin_currency?.currency_code ||
          "USD",
        byType: Object.entries(chargesByType).map(([type, data]) => ({
          type,
          amount: data.amount,
          count: data.count,
        })),
      },
      recentBatchPayments: recentPayments.map((payment) => ({
        id: payment.id,
        referenceNumber: payment.reference_number,
        type: payment.type,
        externalTotalAmount: parseFloat(
          payment.external_total_amount.toString()
        ),
        dateCompleted: payment.date_completed?.toISOString() || "",
        currency: "USD", // Would need to get from related data
      })),
      chargeBreakdown: chargeBreakdown.map((item) => ({
        type: item.type,
        amount: item._sum?.external_amount
          ? parseFloat(item._sum.external_amount.toString())
          : 0,
        percentage:
          totalCharges > 0
            ? ((item._sum?.external_amount
                ? parseFloat(item._sum.external_amount.toString())
                : 0) /
                totalCharges) *
              100
            : 0,
      })),
    };
  }

  private async getCustomerBeneficiaryInsights(
    organisationId: string
  ): Promise<CustomerBeneficiaryInsights> {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total counts
    const [totalCustomers, totalBeneficiaries] = await Promise.all([
      prisma.customer.count({
        where: { organisation_id: organisationId },
      }),
      prisma.beneficiary.count({
        where: { organisation_id: organisationId },
      }),
    ]);

    // New registrations
    const [newCustomersToday, newCustomersWeek, newCustomersMonth] =
      await Promise.all([
        prisma.customer.count({
          where: {
            organisation_id: organisationId,
            created_at: { gte: todayStart },
          },
        }),
        prisma.customer.count({
          where: {
            organisation_id: organisationId,
            created_at: { gte: weekStart },
          },
        }),
        prisma.customer.count({
          where: {
            organisation_id: organisationId,
            created_at: { gte: monthStart },
          },
        }),
      ]);

    // High-risk customers
    const highRiskCustomers = await prisma.customer.count({
      where: {
        organisation_id: organisationId,
        OR: [
          { risk_rating: { gte: 7 } }, // Example threshold
          { has_adverse_media: true },
        ],
      },
    });

    // Customer growth trend (last 30 days)
    const growthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const customerGrowth = await prisma.customer.groupBy({
      by: ["created_at"],
      where: {
        organisation_id: organisationId,
        created_at: { gte: growthStart },
      },
      _count: { id: true },
    });

    return {
      totalCustomers,
      totalBeneficiaries,
      newRegistrations: {
        today: newCustomersToday,
        week: newCustomersWeek,
        month: newCustomersMonth,
      },
      highRiskCustomers,
      customerGrowth: customerGrowth.map((item) => ({
        date: item.created_at.toISOString().split("T")[0],
        customers: item._count?.id || 0,
        beneficiaries: 0, // Would need separate query for beneficiaries
      })),
    };
  }

  private async getOrganisationCorridorActivity(
    organisationId: string
  ): Promise<OrganisationCorridorActivity> {
    // Active corridors
    const corridorActivity = await prisma.transaction.groupBy({
      by: ["destination_country_id"],
      where: {
        origin_organisation_id: organisationId,
      },
      _count: { id: true },
      _sum: { origin_amount: true },
    });

    const activeCorridors = await Promise.all(
      corridorActivity.map(async (item) => {
        const country = await prisma.country.findUnique({
          where: { id: item.destination_country_id || "" },
          select: { name: true },
        });

        return {
          countryId: item.destination_country_id || "",
          countryName: country?.name || "Unknown",
          transactionCount: item._count?.id || 0,
          totalValue: item._sum?.origin_amount
            ? parseFloat(item._sum.origin_amount.toString())
            : 0,
          currency: "USD", // Would need to get from transaction
        };
      })
    );

    // Integration status
    const integrations = await prisma.integration.findMany({
      where: { origin_organisation_id: organisationId },
      include: {
        organisation: {
          select: { id: true, name: true, integration_mode: true },
        },
      },
    });

    const integrationStatus = {
      internalPartners: integrations.filter(
        (i) => i.organisation?.integration_mode === "INTERNAL"
      ).length,
      externalPartners: integrations.filter(
        (i) => i.organisation?.integration_mode === "EXTERNAL"
      ).length,
      pendingIntegrations: integrations.filter((i) => i.status === "PENDING")
        .length,
    };

    // Partner balances
    const partnerBalances = await prisma.orgBalance.findMany({
      where: {
        OR: [{ base_org_id: organisationId }, { dest_org_id: organisationId }],
      },
      include: {
        base_org: { select: { id: true, name: true } },
        dest_org: { select: { id: true, name: true } },
        currency: { select: { currency_code: true } },
      },
    });

    return {
      activeCorridors: activeCorridors
        .sort((a, b) => b.transactionCount - a.transactionCount)
        .slice(0, 10),
      integrationStatus,
      partnerBalances: partnerBalances.map((balance) => ({
        orgId: balance.dest_org?.id || balance.base_org?.id || "",
        orgName: balance.dest_org?.name || balance.base_org?.name || "",
        balance: parseFloat(balance.balance.toString()),
        currency: balance.currency?.currency_code || "USD",
        type: balance.base_org_id === organisationId ? "RECEIVABLE" : "PAYABLE",
      })),
    };
  }

  private async getSystemHealth(organisationId: string): Promise<SystemHealth> {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Failed transactions
    const [failedToday, failedWeek, failedMonth] = await Promise.all([
      prisma.transaction.count({
        where: {
          OR: [
            { origin_organisation_id: organisationId },
            { destination_organisation_id: organisationId },
          ],
          status: "FAILED",
          created_at: { gte: todayStart },
        },
      }),
      prisma.transaction.count({
        where: {
          OR: [
            { origin_organisation_id: organisationId },
            { destination_organisation_id: organisationId },
          ],
          status: "FAILED",
          created_at: { gte: weekStart },
        },
      }),
      prisma.transaction.count({
        where: {
          OR: [
            { origin_organisation_id: organisationId },
            { destination_organisation_id: organisationId },
          ],
          status: "FAILED",
          created_at: { gte: monthStart },
        },
      }),
    ]);

    // Recent till/vault activity (simplified - would need BalanceHistory)
    const recentTills = await prisma.till.findMany({
      where: { organisation_id: organisationId },
      orderBy: { updated_at: "desc" },
      take: 1,
    });

    const recentVaults = await prisma.vault.findMany({
      where: { organisation_id: organisationId },
      orderBy: { updated_at: "desc" },
      take: 1,
    });

    return {
      tillVaultActivity: {
        lastTillTopup: recentTills[0]
          ? {
              amount: 0, // Would need to get from BalanceHistory
              date: recentTills[0].updated_at.toISOString(),
              tillName: recentTills[0].name,
              currency: "USD",
            }
          : null,
        lastVaultTopup: recentVaults[0]
          ? {
              amount: 0, // Would need to get from BalanceHistory
              date: recentVaults[0].updated_at.toISOString(),
              vaultName: recentVaults[0].name,
              currency: "USD",
            }
          : null,
        recentActivity: [], // Would need BalanceHistory implementation
      },
      failedTransactions: {
        today: failedToday,
        week: failedWeek,
        month: failedMonth,
      },
      systemAlerts: [
        ...(failedToday > 0
          ? [
              {
                type: "WARNING" as const,
                message: `${failedToday} failed transactions today`,
                count: failedToday,
              },
            ]
          : []),
      ],
    };
  }
}
