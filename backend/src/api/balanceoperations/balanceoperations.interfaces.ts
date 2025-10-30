import type {
  Organisation,
  Currency,
  BalanceHistory,
  PeriodicOrgBalance,
} from "@prisma/client";
export interface BalanceOperationRequest {
  amount: number;
  source_type?: "BANK_ACCOUNT" | "VAULT" | "TILL";
  source_id?: string;
  destination_type?: "BANK_ACCOUNT" | "VAULT" | "TILL";
  destination_id?: string;
  description?: string;
}

export interface BalanceOperationResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    old_balance: number;
    new_balance: number;
    change_amount: number;
    operation_type: "TOPUP" | "WITHDRAWAL" | "TRANSFER";
    source_entity?: {
      type: string;
      id: string;
      name: string;
    };
    destination_entity?: {
      type: string;
      id: string;
      name: string;
    };
  };
  error?: string;
}

export interface OrgBalanceOperationRequest {
  amount: number;
  source_type: "BANK_ACCOUNT";
  source_id: string;
  description?: string;
}

export interface OrgFloatBalanceRequest {
  amount: number;
  dest_org_id: string; // Agency organisation ID
  currency_id: string; // Agency base currency
  source_id?: string; // Optional bank account ID
  description?: string;
  bank_account_id?: string;
  limit?: number;
}

export interface OrgBalanceResponse {
  success: boolean;
  message: string;
  data: OrgBalance;
  error?: string;
}

export interface TillBalanceOperationRequest {
  amount: number;
  source_type: "VAULT";
  source_id: string;
  description?: string;
}

export interface VaultBalanceOperationRequest {
  amount: number;
  source_type: "BANK_ACCOUNT";
  source_id: string;
  description?: string;
}

export interface OrgBalance {
  id: string;
  base_org_id: string;
  base_org: Organisation;
  dest_org_id: string;
  dest_org: Organisation;
  currency_id: string;
  currency: Currency;
  balance: number;
  locked_balance?: number | null;
  created_at: string;
  updated_at: string;
  balance_histories: BalanceHistory[];
  periodic_org_balances: PeriodicOrgBalance[];
}

export interface OrgBalanceListResponse {
  success: boolean;
  message: string;
  data: {
    balances: OrgBalance[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface OrgBalanceStats {
  totalBalances: number;
  totalBalance: number;
  totalLockedBalance: number;
  totalLimit: number;
  totalMovements: number;
  finalBalance: number;
  openingBalance: number;
  byCurrency: {
    currency_id: string;
    currency_code: string;
    count: number;
    total_balance: number;
  }[];
}

export interface OrgBalanceStatsResponse {
  success: boolean;
  message: string;
  data: OrgBalanceStats;
  error?: string;
}
