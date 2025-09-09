import { PrismaClient } from "@prisma/client";
import { AppError } from "../../utils/AppError";

const prisma = new PrismaClient();

class ReportsService {
  // Outbound Transactions Report
  static async getOutboundTransactionsReport(filters: any) {
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

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (status) where.status = status;
    if (corridor_id) where.corridor_id = corridor_id;
    if (customer_id) where.customer_id = customer_id;
    if (organisation_id) where.organisation_id = organisation_id;
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
  static async getInboundTransactionsReport(filters: any) {
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

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (status) where.status = status;
    if (corridor_id) where.corridor_id = corridor_id;
    if (customer_id) where.customer_id = customer_id;
    if (organisation_id) where.organisation_id = organisation_id;
    if (currency_id) where.destination_currency_id = currency_id;

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
  static async getCommissionsReport(filters: any) {
    const {
      date_from,
      date_to,
      charge_type,
      organisation_id,
      corridor_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (charge_type) where.charge_type = charge_type;
    if (organisation_id) where.organisation_id = organisation_id;
    if (corridor_id) where.corridor_id = corridor_id;
    if (currency_id) where.currency_id = currency_id;

    const charges = await prisma.transactionCharge.findMany({
      where,
      include: {
        charge: true,
        transaction: {
          include: {
            corridor: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.transactionCharge.count({ where });

    return {
      success: true,
      data: {
        charges,
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
  static async getTaxesReport(filters: any) {
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
      charge_type: "TAX",
    };

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (tax_type) where.charge_type = tax_type;
    if (organisation_id) where.organisation_id = organisation_id;
    if (currency_id) where.currency_id = currency_id;

    const taxes = await prisma.transactionCharge.findMany({
      where,
      include: {
        charge: true,
        transaction: {
          include: {
            corridor: true,
          },
        },
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
  static async getUserTillsReport(filters: any) {
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

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (user_id) where.user_id = user_id;
    if (till_id) where.till_id = till_id;
    if (status) where.status = status;
    if (organisation_id) where.organisation_id = organisation_id;

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
  static async getBalancesHistoryReport(filters: any) {
    const {
      date_from,
      date_to,
      entity_type,
      entity_id,
      organisation_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (entity_type) where.entity_type = entity_type;
    if (entity_id) where.entity_id = entity_id;
    if (organisation_id) where.organisation_id = organisation_id;
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

  // GL Accounts Report
  static async getGlAccountsReport(filters: any) {
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

    const where: any = {};

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
  static async getProfitLossReport(filters: any) {
    const { date_from, date_to, organisation_id, currency_id } = filters;

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
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
  static async getBalanceSheetReport(filters: any) {
    const { date_from, date_to, organisation_id } = filters;

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
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
  static async getPartnerBalancesReport(filters: any) {
    const {
      date_from,
      date_to,
      partner_org_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (partner_org_id) where.base_org_id = partner_org_id;
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
  static async getComplianceReport(filters: any) {
    const {
      date_from,
      date_to,
      risk_rating,
      customer_type,
      nationality,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
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
  static async getExchangeRatesReport(filters: any) {
    const {
      date_from,
      date_to,
      corridor_id,
      currency_pair,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
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
  static async getAuditTrailReport(filters: any) {
    const {
      date_from,
      date_to,
      user_id,
      entity_type,
      organisation_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (user_id) where.user_id = user_id;
    if (entity_type) where.entity_type = entity_type;
    if (organisation_id) where.organisation_id = organisation_id;

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
  static async getCorridorPerformanceReport(filters: any) {
    const {
      date_from,
      date_to,
      corridor_id,
      currency_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (corridor_id) where.corridor_id = corridor_id;
    if (currency_id) where.origin_currency_id = currency_id;

    const corridors = await prisma.corridor.findMany({
      where: corridor_id ? { id: corridor_id } : {},
      include: {
        base_currency: true,
        origin_organisation: {
          include: {
            base_currency: true,
          },
        },
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
  static async getUserPerformanceReport(filters: any) {
    const {
      date_from,
      date_to,
      user_id,
      till_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
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
  static async getIntegrationStatusReport(filters: any) {
    const {
      date_from,
      date_to,
      integration_type,
      partner_org_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
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
  static async getCashPositionReport(filters: any) {
    const {
      date_from,
      date_to,
      entity_type,
      organisation_id,
      page = 1,
      limit = 100,
    } = filters;

    const where: any = {};

    if (date_from || date_to) {
      where.created_at = {};
      if (date_from) where.created_at.gte = new Date(date_from);
      if (date_to) where.created_at.lte = new Date(date_to);
    }

    if (entity_type) where.entity_type = entity_type;
    if (organisation_id) where.organisation_id = organisation_id;

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
