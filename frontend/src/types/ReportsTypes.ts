import type { Corridor } from "./CorridorsTypes";
import type { Integration } from "./IntegrationsTypes";
import type { OrgBalance } from "./BalanceOperationsTypes";
import type { GlAccount } from "./GlAccountsTypes";
import type { Organisation } from "./OrganisationsTypes";
import type { Customer } from "./CustomersTypes";
import type { ExchangeRate } from "./ExchangeRatesTypes";
import type { UserTill } from "./TillsTypes";
import type { Transaction, TransactionCharge } from "./TransactionsTypes";

// Base report interfaces
export interface BaseReportFilters {
  date_from?: string;
  date_to?: string;
  organisation_id?: string;
  currency_id?: string;
  page?: number;
  limit?: number;
}

export interface BaseReportResponse<T> {
  success: boolean;
  data: {
    [key: string]:
      | T[]
      | {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Outbound Transactions Report
export interface OutboundTransactionsReportFilters extends BaseReportFilters {
  status?: string;
  corridor_id?: string;
  customer_id?: string;
}

export interface OutboundTransactionReportItem {
  id: string;
  transaction_id: string;
  origin_amount: number;
  dest_amount: number;
  status: string;
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  beneficiary: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  corridor: {
    id: string;
    name: string;
    base_currency: {
      currency_code: string;
    };
    destination_currency: {
      currency_code: string;
    };
  };
  transaction_charges: Array<{
    amount: number;
    charge: {
      name: string;
      type: string;
    };
  }>;
  created_at: string;
}

// Inbound Transactions Report
export interface InboundTransactionsReportFilters extends BaseReportFilters {
  status?: string;
  corridor_id?: string;
  customer_id?: string;
}

export interface InboundTransactionReportItem {
  id: string;
  transaction_id: string;
  origin_amount: number;
  dest_amount: number;
  status: string;
  customer: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  beneficiary: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  corridor: {
    id: string;
    name: string;
    base_currency: {
      currency_code: string;
    };
    destination_currency: {
      currency_code: string;
    };
  };
  transaction_charges: Array<{
    amount: number;
    charge: {
      name: string;
      type: string;
    };
  }>;
  created_at: string;
}

// Commissions & Other Revenues Report
export interface CommissionsReportFilters extends BaseReportFilters {
  charge_type?: string;
  corridor_id?: string;
}

export interface CommissionReportItem {
  id: string;
  amount: number;
  charge_type: string;
  currency_id: string;
  transaction: {
    id: string;
    transaction_id: string;
    corridor: {
      name: string;
    };
  };
  charge: {
    name: string;
    type: string;
  };
  created_at: string;
}

// Taxes Report
export interface TaxesReportFilters extends BaseReportFilters {
  tax_type?: string;
}

export interface TaxReportItem {
  id: string;
  amount: number;
  charge_type: string;
  currency_id: string;
  transaction: {
    id: string;
    transaction_id: string;
    corridor: {
      name: string;
    };
  };
  charge: {
    name: string;
    type: string;
  };
  created_at: string;
}

// User Tills Report
export interface UserTillsReportFilters extends BaseReportFilters {
  user_id?: string;
  till_id?: string;
  status?: string;
}

export interface UserTillReportItem {
  id: string;
  opening_balance: number;
  closing_balance: number;
  net_transactions_total: number;
  status: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  till: {
    id: string;
    name: string;
    currency: {
      currency_code: string;
    };
  };
  created_at: string;
  closed_at?: string;
}

// Balances History Report
export interface BalancesHistoryReportFilters extends BaseReportFilters {
  entity_type?: string;
  entity_id?: string;
}

export interface BalanceHistoryReportItem {
  id: string;
  entity_type: string;
  entity_id: string;
  old_balance: number;
  new_balance: number;
  change_amount: number;
  currency: {
    currency_code: string;
  };
  created_at: string;
}

// GL Accounts Report
export interface GlAccountsReportFilters extends BaseReportFilters {
  account_id?: string;
  type?: string;
}

export interface GlAccountReportItem {
  id: string;
  name: string;
  type: string;
  balance: number;
  locked_balance: number;
  currency: {
    currency_code: string;
  };
  organisation: {
    name: string;
  };
  created_at: string;
}

export interface ProfitLossReportData {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  revenueAccounts: GlAccountReportItem[];
  expenseAccounts: GlAccountReportItem[];
  period: {
    from?: string;
    to?: string;
  };
}

export interface BalanceSheetReportData {
  assets: GlAccountReportItem[];
  liabilities: GlAccountReportItem[];
  equity: GlAccountReportItem[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  period: {
    from?: string;
    to?: string;
  };
}

// Partner Balances Report
export interface PartnerBalancesReportFilters extends BaseReportFilters {
  partner_org_id?: string;
}

export interface PartnerBalanceReportItem {
  id: string;
  balance: number;
  locked_balance: number;
  organisation: {
    id: string;
    name: string;
  };
  currency: {
    currency_code: string;
  };
  created_at: string;
}

// Customer and Beneficiary Compliance Report
export interface ComplianceReportFilters extends BaseReportFilters {
  risk_rating?: string;
  customer_type?: string;
  nationality?: string;
}

export interface ComplianceReportItem {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  risk_rating: string;
  type: string;
  nationality: string;
  transactions: Array<{
    id: string;
    origin_amount: number;
    status: string;
  }>;
  created_at: string;
}

// Exchange Rates Report
export interface ExchangeRatesReportFilters extends BaseReportFilters {
  corridor_id?: string;
  currency_pair?: string;
}

export interface ExchangeRateReportItem {
  id: string;
  rate: number;
  currency_pair: string;
  corridor: {
    id: string;
    name: string;
    base_currency: {
      currency_code: string;
    };
    destination_currency: {
      currency_code: string;
    };
  };
  created_at: string;
}

// Audit Trail Report
export interface AuditTrailReportFilters extends BaseReportFilters {
  user_id?: string;
  entity_type?: string;
}

export interface AuditTrailReportItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  old_values: unknown;
  new_values: unknown;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  created_at: string;
}

// Corridor Performance Report
export interface CorridorPerformanceReportFilters extends BaseReportFilters {
  corridor_id?: string;
}

export interface CorridorPerformanceReportItem {
  id: string;
  name: string;
  base_currency: {
    currency_code: string;
  };
  destination_currency: {
    currency_code: string;
  };
  transactions: Array<{
    id: string;
    origin_amount: number;
    status: string;
    transaction_charges: Array<{
      amount: number;
    }>;
  }>;
  created_at: string;
}

// User Performance Report
export interface UserPerformanceReportFilters extends BaseReportFilters {
  user_id?: string;
  till_id?: string;
}

export interface UserPerformanceReportItem {
  id: string;
  opening_balance: number;
  closing_balance: number;
  net_transactions_total: number;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  till: {
    id: string;
    name: string;
    currency: {
      currency_code: string;
    };
  };
  created_at: string;
  closed_at?: string;
}

// Integration Status Report
export interface IntegrationStatusReportFilters extends BaseReportFilters {
  integration_type?: string;
  partner_org_id?: string;
}

export interface IntegrationStatusReportItem {
  id: string;
  type: string;
  status: string;
  success_rate: number;
  partner_organisation: {
    id: string;
    name: string;
  };
  created_at: string;
}

// Cash Position Report
export interface CashPositionReportFilters extends BaseReportFilters {
  entity_type?: string;
}

export interface CashPositionReportItem {
  id: string;
  entity_type: string;
  entity_id: string;
  balance: number;
  currency: {
    currency_code: string;
  };
  created_at: string;
}

// Report types
export const ReportType = {
  OUTBOUND_TRANSACTIONS: "outbound-transactions",
  INBOUND_TRANSACTIONS: "inbound-transactions",
  COMMISSIONS: "commissions",
  TAXES: "taxes",
  USER_TILLS: "user-tills",
  BALANCES_HISTORY: "balances-history",
  GL_ACCOUNTS: "gl-accounts",
  PROFIT_LOSS: "profit-loss",
  BALANCE_SHEET: "balance-sheet",
  PARTNER_BALANCES: "partner-balances",
  COMPLIANCE: "compliance",
  EXCHANGE_RATES: "exchange-rates",
  AUDIT_TRAIL: "audit-trail",
  CORRIDOR_PERFORMANCE: "corridor-performance",
  USER_PERFORMANCE: "user-performance",
  INTEGRATION_STATUS: "integration-status",
  CASH_POSITION: "cash-position",
} as const;

export type ReportType = (typeof ReportType)[keyof typeof ReportType];

// Report metadata
export interface ReportMetadata {
  type: ReportType;
  name: string;
  description: string;
  filters: string[];
  exportFormats: string[];
}

export const REPORT_METADATA: Record<ReportType, ReportMetadata> = {
  [ReportType.OUTBOUND_TRANSACTIONS]: {
    type: ReportType.OUTBOUND_TRANSACTIONS,
    name: "Outbound Transactions Report",
    description: "Tracks funds sent to beneficiaries",
    filters: [
      "date_from",
      "date_to",
      "status",
      "corridor_id",
      "customer_id",
      "organisation_id",
      "currency_id",
    ],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.INBOUND_TRANSACTIONS]: {
    type: ReportType.INBOUND_TRANSACTIONS,
    name: "Inbound Transactions Report",
    description: "Tracks funds received from senders",
    filters: [
      "date_from",
      "date_to",
      "status",
      "corridor_id",
      "customer_id",
      "organisation_id",
      "currency_id",
    ],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.COMMISSIONS]: {
    type: ReportType.COMMISSIONS,
    name: "Commissions & Other Revenues Report",
    description: "Summarizes revenue from commissions and internal charges",
    filters: [
      "date_from",
      "date_to",
      "charge_type",
      "organisation_id",
      "corridor_id",
      "currency_id",
    ],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.TAXES]: {
    type: ReportType.TAXES,
    name: "Taxes Report",
    description: "Tracks tax liabilities collected and paid",
    filters: [
      "date_from",
      "date_to",
      "tax_type",
      "organisation_id",
      "currency_id",
    ],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.USER_TILLS]: {
    type: ReportType.USER_TILLS,
    name: "User Tills Report",
    description: "Monitors user sessions and reconciliation",
    filters: [
      "date_from",
      "date_to",
      "user_id",
      "till_id",
      "status",
      "organisation_id",
    ],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.BALANCES_HISTORY]: {
    type: ReportType.BALANCES_HISTORY,
    name: "Balances History Report",
    description: "Logs balance changes for tills, vaults, or orgs",
    filters: [
      "date_from",
      "date_to",
      "entity_type",
      "entity_id",
      "organisation_id",
      "currency_id",
    ],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.GL_ACCOUNTS]: {
    type: ReportType.GL_ACCOUNTS,
    name: "GL Accounts Report",
    description: "Details individual GL account balances and entries",
    filters: [
      "account_id",
      "type",
      "date_from",
      "date_to",
      "organisation_id",
      "currency_id",
    ],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.PROFIT_LOSS]: {
    type: ReportType.PROFIT_LOSS,
    name: "Profit and Loss Report",
    description: "Summarizes revenues minus expenses",
    filters: ["date_from", "date_to", "organisation_id", "currency_id"],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.BALANCE_SHEET]: {
    type: ReportType.BALANCE_SHEET,
    name: "Balance Sheet Report",
    description: "Shows assets, liabilities, equity snapshot",
    filters: ["date_from", "date_to", "organisation_id"],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.PARTNER_BALANCES]: {
    type: ReportType.PARTNER_BALANCES,
    name: "Partner Balances Report",
    description: "Tracks receivables/payables with partner orgs",
    filters: ["date_from", "date_to", "partner_org_id", "currency_id"],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.COMPLIANCE]: {
    type: ReportType.COMPLIANCE,
    name: "Customer and Beneficiary Compliance Report",
    description: "Lists customer/beneficiary risk and KYC status",
    filters: [
      "date_from",
      "date_to",
      "risk_rating",
      "customer_type",
      "nationality",
    ],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.EXCHANGE_RATES]: {
    type: ReportType.EXCHANGE_RATES,
    name: "Exchange Rates Report",
    description: "Tracks historical/current rates and FX gains/losses",
    filters: ["date_from", "date_to", "corridor_id", "currency_pair"],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.AUDIT_TRAIL]: {
    type: ReportType.AUDIT_TRAIL,
    name: "Audit Trail Report",
    description: "Logs system changes for auditing",
    filters: [
      "date_from",
      "date_to",
      "user_id",
      "entity_type",
      "organisation_id",
    ],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.CORRIDOR_PERFORMANCE]: {
    type: ReportType.CORRIDOR_PERFORMANCE,
    name: "Corridor Performance Report",
    description: "Analyzes transaction volumes and revenue by corridor",
    filters: ["date_from", "date_to", "corridor_id", "currency_id"],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.USER_PERFORMANCE]: {
    type: ReportType.USER_PERFORMANCE,
    name: "User Performance Report",
    description: "Evaluates teller performance via sessions and transactions",
    filters: ["date_from", "date_to", "user_id", "till_id"],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.INTEGRATION_STATUS]: {
    type: ReportType.INTEGRATION_STATUS,
    name: "Integration Status Report",
    description: "Monitors partner integration performance",
    filters: ["date_from", "date_to", "integration_type", "partner_org_id"],
    exportFormats: ["csv", "pdf"],
  },
  [ReportType.CASH_POSITION]: {
    type: ReportType.CASH_POSITION,
    name: "Cash Position Report",
    description: "Summarizes cash across tills, vaults, bank accounts",
    filters: ["date_from", "date_to", "entity_type", "organisation_id"],
    exportFormats: ["csv", "pdf"],
  },
};

export type ReportItem =
  | Transaction
  | TransactionCharge
  | UserTill
  | OrgBalance
  | GlAccount
  | Organisation
  | Customer
  | ExchangeRate
  | Corridor
  | Integration;
