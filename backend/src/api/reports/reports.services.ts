import { prisma } from "../../lib/prisma.lib";
import { AppError } from "../../utils/AppError";

class ReportsService {
  // Outbound Transactions Report
  static async getOutboundTransactionsReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      status,
      corridor_id,
      customer_id,
      organisation_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    const userOrganisation = await prisma.organisation.findUnique({
      where: {
        id: user_organisation_id,
      },
    });

    let isCustomerOrganisation = userOrganisation?.type === "CUSTOMER";

    const where: any = {
      ...(!isCustomerOrganisation && {
        origin_organisation_id: user_organisation_id,
      }),
      direction: "OUTBOUND",
      status: {
        in: ["READY", "APPROVED", "COMPLETED"],
      },
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (status) where.status = status;
    if (corridor_id) where.corridor_id = corridor_id;
    if (customer_id) where.customer_id = customer_id;
    if (organisation_id) where.destination_organisation_id = organisation_id;
    if (currency_id) where.origin_currency_id = currency_id;

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        customer: true,
        beneficiary: true,
        dest_currency: true,
        origin_currency: true,
        corridor: {
          include: {
            base_currency: true,
            destination_country: true,
            organisation: true,
            origin_country: true,
            origin_organisation: true,
            destination_organisation: true,
          },
        },
        transaction_charges: {
          include: {
            charge: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    console.log("transactions", transactions);

    const total = await prisma.transaction.count({ where });

    return {
      success: true,
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Inbound Transactions Report
  static async getInboundTransactionsReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      status,
      corridor_id,
      customer_id,
      organisation_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    const userOrganisation = await prisma.organisation.findUnique({
      where: {
        id: user_organisation_id,
      },
    });

    let isCustomerOrganisation = userOrganisation?.type === "CUSTOMER";

    const where: any = {
      ...(!isCustomerOrganisation && {
        destination_organisation_id: user_organisation_id,
      }),
      direction: "INBOUND",
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (status) where.status = status;
    if (corridor_id) where.corridor_id = corridor_id;
    if (customer_id) where.customer_id = customer_id;
    if (organisation_id) where.origin_organisation_id = organisation_id;
    if (currency_id) where.destination_currency_id = currency_id;

    console.log("where", where, "filters", filters);

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        dest_currency: true,
        corridor: {
          include: {
            base_currency: true,
            destination_country: true,
            organisation: true,
            origin_country: true,
            origin_organisation: true,
            destination_organisation: true,
          },
        },
        transaction_charges: {
          include: {
            charge: true,
          },
        },
        origin_organisation: true,
        sender_trasaction_party: true,
        receiver_trasaction_party: true,
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.transaction.count({ where });

    return {
      success: true,
      data: {
        transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Commissions & Other Revenues Report
  static async getCommissionsReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      organisation_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    const userOrganisation = await prisma.organisation.findUnique({
      where: {
        id: user_organisation_id,
      },
    });

    let isCustomerOrganisation = userOrganisation?.type === "CUSTOMER";

    const where: any = {
      ...(!isCustomerOrganisation && {
        organisation_id: user_organisation_id,
      }),
      transaction: {
        status: {
          in: ["READY", "APPROVED", "COMPLETED"],
        },
      },
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (organisation_id)
      where.transaction.destination_organisation_id = organisation_id;
    if (currency_id) where.currency_id = currency_id;

    const agencyCommissions = await prisma.commissionSplit.findMany({
      where,
      include: {
        organisation: true,
        transaction: true,
        currency: true,
        transaction_charge: {
          include: {
            charge: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.commissionSplit.count({ where });

    return {
      success: true,
      data: {
        agencyCommissions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Taxes Report
  static async getTaxesReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      tax_type,
      organisation_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {
      transaction: {
        status: {
          in: ["APPROVED", "COMPLETED"],
        },
        origin_organisation_id: user_organisation_id,
      },
      charge: {
        type: "TAX",
      },
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (tax_type) where.charge_type = tax_type;
    if (organisation_id)
      where.transaction.destination_organisation_id = organisation_id;
    if (currency_id) where.currency_id = currency_id;

    const taxes = await prisma.transactionCharge.findMany({
      where,
      include: {
        charge: true,
        transaction: {
          include: {
            corridor: {
              include: {
                organisation: true,
              },
            },
            origin_currency: true,
          },
        },
        destination_organisation: true,
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.transactionCharge.count({ where });

    return {
      success: true,
      data: {
        taxes,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // User Tills Report
  static async getUserTillsReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      user_id,
      till_id,
      status,
      organisation_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {
      till: {
        organisation_id: user_organisation_id,
      },
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (user_id) where.user_id = user_id;
    if (till_id) where.till_id = till_id;
    if (status) where.status = status;
    if (organisation_id) where.till.organisation_id = organisation_id;

    const userTills = await prisma.userTill.findMany({
      where,
      include: {
        user: true,
        till: {
          include: {
            currency: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.userTill.count({ where });

    return {
      success: true,
      data: {
        userTills,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Balances History Report
  static async getBalancesHistoryReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      entity_type,
      entity_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {
      OR: [
        { entity_type: "ORG_BALANCE", entity_id: user_organisation_id },
        {
          entity_type: "TILL",
          till: { organisation_id: user_organisation_id },
        },
        {
          entity_type: "VAULT",
          vault: { organisation_id: user_organisation_id },
        },
        {
          entity_type: "BANK_ACCOUNT",
          bank_account: { organisation_id: user_organisation_id },
        },
      ],
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (entity_type) where.entity_type = entity_type;
    if (entity_id) where.entity_id = entity_id;

    if (currency_id) where.currency_id = currency_id;

    const balanceHistory = await prisma.balanceHistory.findMany({
      where,
      include: {
        currency: true,
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.balanceHistory.count({ where });

    return {
      success: true,
      data: {
        balanceHistory,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Organisation Balances History Report
  static async getOrganisationBalancesHistoryReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      organisation_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    // Use the provided organisation_id or default to user's organisation
    const targetOrgId = organisation_id || user_organisation_id;

    const where: any = {
      entity_type: "AGENCY_FLOAT",
      float_org_id: targetOrgId,
      // organisation_id: targetOrgId,
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (currency_id) where.currency_id = currency_id;

    console.log("where", where);

    const balanceHistory = await prisma.balanceHistory.findMany({
      where,
      include: {
        currency: true,
        transaction: {
          include: {
            customer: true,
            beneficiary: true,
            corridor: {
              include: {
                origin_organisation: true,
                destination_organisation: true,
              },
            },
          },
        },
        org_balance: {
          include: {
            dest_org: true,
            base_org: true,
          },
        },
        till: {
          include: {
            organisation: true,
          },
        },
        vault: {
          include: {
            organisation: true,
          },
        },
        bank_account: {
          include: {
            organisation: true,
          },
        },
        float_org: true,
        created_by_user: true,
        gl_transactions: {
          include: {
            gl_entries: true,
          },
        },
        commission_split: {
          include: {
            transaction_charge: {
              include: {
                charge: true,
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    console.log("balanceHistory", balanceHistory);

    const total = await prisma.balanceHistory.count({ where });

    // Get organisation balance summary
    const orgBalance = await prisma.orgBalance.findFirst({
      where: { dest_org_id: targetOrgId },
      include: {
        dest_org: true,
        currency: true,
      },
    });

    // Get periodic balance summary
    const periodicBalance = await prisma.periodicOrgBalance.findFirst({
      where: {
        OR: [
          { organisation_id: targetOrgId },
          { org_balance: { dest_org_id: targetOrgId } },
        ],
        is_current: true,
      },
      include: {
        org_balance: {
          include: {
            dest_org: true,
            currency: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        balanceHistory,
        summary: {
          currentBalance: orgBalance?.balance || 0,
          currency: orgBalance?.currency?.currency_code || "N/A",
          organisation: orgBalance?.dest_org?.name || "N/A",
          periodicBalance: periodicBalance
            ? {
                openingBalance: periodicBalance.opening_balance,
                closingBalance: periodicBalance.closing_balance,
                transactionsIn: periodicBalance.transactions_in,
                transactionsOut: periodicBalance.transactions_out,
                commissions: periodicBalance.commissions,
                depositsAmount: periodicBalance.deposits_amount,
                withdrawalsAmount: periodicBalance.withdrawals_amount,
                period: {
                  year: periodicBalance.year,
                  month: periodicBalance.month,
                  dateFrom: periodicBalance.date_from,
                  dateTo: periodicBalance.date_to,
                },
              }
            : null,
        },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // GL Accounts Report
  static async getGlAccountsReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      account_id,
      type,
      date_from,
      date_to,
      organisation_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {
      organisation_id: user_organisation_id,
    };

    if (account_id) where.id = account_id;
    if (type) where.type = type;
    if (organisation_id) where.organisation_id = organisation_id;
    if (currency_id) where.currency_id = currency_id;

    const glAccounts = await prisma.glAccount.findMany({
      where,
      include: {
        currency: true,
        organisation: true,
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.glAccount.count({ where });

    return {
      success: true,
      data: {
        glAccounts,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Profit and Loss Report
  static async getProfitLossReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const { date_from, date_to, organisation_id, currency_id } = filters;

    const where: any = {
      organisation_id: user_organisation_id,
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (organisation_id) where.organisation_id = organisation_id;
    if (currency_id) where.currency_id = currency_id;

    // Get revenue accounts
    const revenueAccounts = await prisma.glAccount.findMany({
      where: {
        ...where,
        type: "REVENUE",
      },
      include: {
        currency: true,
      },
    });

    // Get expense accounts
    const expenseAccounts = await prisma.glAccount.findMany({
      where: {
        ...where,
        type: "EXPENSE",
      },
      include: {
        currency: true,
      },
    });

    const totalRevenue = revenueAccounts.reduce(
      (sum, account) =>
        sum +
        (typeof account.balance === "number"
          ? account.balance
          : account.balance
          ? Number(account.balance)
          : 0),
      0
    );
    const totalExpenses = expenseAccounts.reduce(
      (sum, account) =>
        sum +
        (typeof account.balance === "number"
          ? account.balance
          : account.balance
          ? Number(account.balance)
          : 0),
      0
    );
    const netProfit = totalRevenue - totalExpenses;

    return {
      success: true,
      data: {
        totalRevenue,
        totalExpenses,
        netProfit,
        revenueAccounts,
        expenseAccounts,
        period: {
          from: date_from,
          to: date_to,
        },
      },
    };
  }

  // Balance Sheet Report
  static async getBalanceSheetReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const { date_from, date_to, organisation_id } = filters;

    const where: any = {
      organisation_id: user_organisation_id,
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (organisation_id) where.organisation_id = organisation_id;

    // Get assets
    const assets = await prisma.glAccount.findMany({
      where: {
        ...where,
        type: "ASSET",
      },
      include: {
        currency: true,
      },
    });

    // Get liabilities
    const liabilities = await prisma.glAccount.findMany({
      where: {
        ...where,
        type: "LIABILITY",
      },
      include: {
        currency: true,
      },
    });

    // Get equity
    const equity = await prisma.glAccount.findMany({
      where: {
        ...where,
        type: "EQUITY",
      },
      include: {
        currency: true,
      },
    });

    const totalAssets = assets.reduce(
      (sum, account) =>
        sum +
        (typeof account.balance === "number"
          ? account.balance
          : account.balance
          ? Number(account.balance)
          : 0),
      0
    );
    const totalLiabilities = liabilities.reduce(
      (sum, account) =>
        sum +
        (typeof account.balance === "number"
          ? account.balance
          : account.balance
          ? Number(account.balance)
          : 0),
      0
    );
    const totalEquity = equity.reduce(
      (sum, account) =>
        sum +
        (typeof account.balance === "number"
          ? account.balance
          : account.balance
          ? Number(account.balance)
          : 0),
      0
    );

    return {
      success: true,
      data: {
        assets,
        liabilities,
        equity,
        totalAssets,
        totalLiabilities,
        totalEquity,
        period: {
          from: date_from,
          to: date_to,
        },
      },
    };
  }

  // Partner Balances Report
  static async getPartnerBalancesReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      partner_org_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {
      base_org_id: user_organisation_id,
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (partner_org_id) where.dest_org_id = partner_org_id;
    if (currency_id) where.currency_id = currency_id;

    const partnerBalances = await prisma.orgBalance.findMany({
      where,
      include: {
        base_org: true,
        dest_org: true,
        currency: true,
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.orgBalance.count({ where });

    return {
      success: true,
      data: {
        partnerBalances,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Customer and Beneficiary Compliance Report
  static async getComplianceReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      risk_rating,
      customer_type,
      nationality,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {
      organisation_id: user_organisation_id,
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (risk_rating) where.risk_rating = risk_rating;
    if (customer_type) where.type = customer_type;
    if (nationality) where.nationality = nationality;

    const customers = await prisma.customer.findMany({
      where,
      include: {
        transactions: {
          select: {
            id: true,
            origin_amount: true,
            status: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.customer.count({ where });

    return {
      success: true,
      data: {
        customers,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Exchange Rates Report
  static async getExchangeRatesReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      corridor_id,
      currency_pair,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {
      corridor: {
        origin_organisation_id: user_organisation_id,
      },
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (corridor_id) where.corridor_id = corridor_id;
    if (currency_pair) where.currency_pair = currency_pair;

    const exchangeRates = await prisma.exchangeRate.findMany({
      where,

      include: {
        from_currency: true,
        to_currency: true,
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.exchangeRate.count({ where });

    return {
      success: true,
      data: {
        exchangeRates,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Audit Trail Report
  static async getAuditTrailReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      user_id,
      entity_type,
      organisation_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {
      user: {
        organisation_id: user_organisation_id,
      },
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (user_id) where.user_id = user_id;
    if (entity_type) where.entity_type = entity_type;
    if (organisation_id) where.user.organisation_id = organisation_id;

    const auditTrail = await prisma.userActivity.findMany({
      where,
      include: {
        user: true,
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.userActivity.count({ where });

    return {
      success: true,
      data: {
        auditTrail,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Corridor Performance Report
  static async getCorridorPerformanceReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      corridor_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {
      origin_organisation_id: user_organisation_id,
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (corridor_id) where.corridor_id = corridor_id;
    if (currency_id) where.origin_currency_id = currency_id;

    const corridors = await prisma.corridor.findMany({
      where: corridor_id
        ? { id: corridor_id, origin_organisation_id: user_organisation_id }
        : { origin_organisation_id: user_organisation_id },
      include: {
        base_currency: true,
        origin_organisation: {
          include: {
            base_currency: true,
          },
        },
        organisation: true,
        transactions: {
          where,
          include: {
            transaction_charges: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.corridor.count({
      where: corridor_id ? { id: corridor_id } : {},
    });

    return {
      success: true,
      data: {
        corridors,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // User Performance Report
  static async getUserPerformanceReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      user_id,
      till_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {
      till: {
        organisation_id: user_organisation_id,
      },
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (user_id) where.user_id = user_id;
    if (till_id) where.till_id = till_id;

    const userTills = await prisma.userTill.findMany({
      where,
      include: {
        user: true,
        till: {
          include: {
            currency: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.userTill.count({ where });

    return {
      success: true,
      data: {
        userTills,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Integration Status Report
  static async getIntegrationStatusReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      integration_type,
      partner_org_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {
      organisation_id: user_organisation_id,
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (integration_type) where.type = integration_type;
    if (partner_org_id) where.partner_org_id = partner_org_id;

    const integrations = await prisma.integration.findMany({
      where,
      include: {
        organisation: true,
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.integration.count({ where });

    return {
      success: true,
      data: {
        integrations,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  // Cash Position Report
  static async getCashPositionReport({
    filters,
    user_organisation_id,
  }: {
    filters: any;
    user_organisation_id: string;
  }) {
    const {
      date_from,
      date_to,
      entity_type,
      organisation_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {
      OR: [
        { entity_type: "ORGANISATION", entity_id: user_organisation_id },
        {
          entity_type: "TILL",
          till: { organisation_id: user_organisation_id },
        },
        {
          entity_type: "VAULT",
          vault: { organisation_id: user_organisation_id },
        },
      ],
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = date_from;
      if (date_to) where.created_at.lte = date_to;
    }

    if (entity_type) where.entity_type = entity_type;
    if (organisation_id) {
      where.OR = [
        { entity_type: "ORGANISATION", entity_id: organisation_id },
        { entity_type: "TILL", till: { organisation_id: organisation_id } },
        { entity_type: "VAULT", vault: { organisation_id: organisation_id } },
      ];
    }

    const cashPositions = await prisma.balanceHistory.findMany({
      where,
      include: {
        currency: true,
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.balanceHistory.count({ where });

    return {
      success: true,
      data: {
        cashPositions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }
}

export default ReportsService;
