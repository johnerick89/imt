import { Currency, User, Organisation } from "@prisma/client";

export interface IBankAccount {
  id: string;
  name: string;
  account_number: string;
  bank_name: string;
  swift_code?: string | null;
  currency_id: string;
  currency: Currency;
  balance: number;
  locked_balance?: number | null;
  organisation_id?: string | null;
  organisation?: Organisation | null;
  created_at: Date;
  updated_at: Date;
  created_by?: string | null;
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
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
    bankAccounts: IBankAccount[];
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
  data: IBankAccount;
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
