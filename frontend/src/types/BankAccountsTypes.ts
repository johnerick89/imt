export interface BankAccount {
  id: string;
  name: string;
  account_number: string;
  bank_name: string;
  swift_code?: string | null;
  currency_id: string;
  currency: {
    id: string;
    currency_code: string;
    currency_name: string;
  };
  balance: number;
  locked_balance?: number | null;
  organisation_id?: string | null;
  organisation?: {
    id: string;
    name: string;
    type: string;
  } | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface BankAccountFilters {
  page?: number;
  limit?: number;
  search?: string;
  currency_id?: string;
  organisation_id?: string;
  created_by?: string;
}

export interface BankAccountListResponse {
  success: boolean;
  message: string;
  data: {
    bankAccounts: BankAccount[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface BankAccountResponse {
  success: boolean;
  message: string;
  data: BankAccount;
  error?: string;
}

export interface BankAccountStats {
  totalBankAccounts: number;
  totalBalance: number;
  totalLockedBalance: number;
  byCurrency: {
    currency_id: string;
    currency_code: string;
    count: number;
    total_balance: number;
  }[];
}

export interface BankAccountStatsResponse {
  success: boolean;
  message: string;
  data: BankAccountStats;
  error?: string;
}

export interface CreateBankAccountRequest {
  name: string;
  account_number: string;
  bank_name: string;
  swift_code?: string;
  currency_id: string;
  organisation_id?: string;
  balance: number;
  locked_balance?: number;
}

export interface UpdateBankAccountRequest {
  name?: string;
  account_number?: string;
  bank_name?: string;
  swift_code?: string;
  currency_id?: string;
  organisation_id?: string;
  balance?: number;
  locked_balance?: number;
}

// Balance operation interfaces
export interface TopupRequest {
  amount: number;
  source_type: "BANK_ACCOUNT" | "VAULT";
  source_id: string;
  description?: string;
}

export interface WithdrawalRequest {
  amount: number;
  destination_type: "BANK_ACCOUNT" | "VAULT";
  destination_id: string;
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
    operation_type: "TOPUP" | "WITHDRAWAL";
  };
  error?: string;
}
