export interface OrgBalance {
  id: string;
  base_org_id: string;
  base_org: {
    id: string;
    name: string;
    type: string;
  };
  dest_org_id: string;
  dest_org: {
    id: string;
    name: string;
    type: string;
  };
  currency_id: string;
  currency: {
    id: string;
    currency_code: string;
    currency_name: string;
  };
  balance: number;
  locked_balance?: number | null;
  created_at: string;
  updated_at: string;
}

export interface OrgBalanceFilters {
  page?: number;
  limit?: number;
  search?: string;
  base_org_id?: string;
  dest_org_id?: string;
  currency_id?: string;
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

export interface PrefundRequest {
  amount: number;
  source_type: "BANK_ACCOUNT";
  source_id: string;
  description?: string;
}

export interface TillTopupRequest {
  amount: number;
  source_type: "VAULT";
  source_id: string;
  description?: string;
}

export interface VaultTopupRequest {
  amount: number;
  source_type: "BANK_ACCOUNT";
  source_id: string;
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
