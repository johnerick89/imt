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
  currency_id?: string;
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

// Balance History Types
export interface BalanceHistoryItem {
  id: string;
  balance: number;
  locked_balance?: number | null;
  created_at: string;
  updated_at: string;
  currency?: {
    id: string;
    currency_code: string;
    currency_name: string;
  };
  organisation?: {
    id: string;
    name: string;
    type: string;
  };
  base_org?: {
    id: string;
    name: string;
    type: string;
  };
  dest_org?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface BalanceHistoryResponse {
  success: boolean;
  message: string;
  data: {
    histories: BalanceHistoryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface BalanceHistoryFilters {
  page?: number;
  limit?: number;
  currency_id?: string;
}

// Opening Balance Types
export interface OpeningBalanceRequest {
  amount: number;
  currency_id: string;
  description?: string;
}

// Agency Float Balance Types
export interface AgencyFloatRequest {
  amount: number;
  dest_org_id: string; // Agency organisation ID
  currency_id: string; // Agency base currency
  bank_account_id?: string; // Optional bank account ID to deposit the float
  description?: string;
}

export interface OrgBalanceResponse {
  success: boolean;
  message: string;
  data: OrgBalance;
  error?: string;
}
