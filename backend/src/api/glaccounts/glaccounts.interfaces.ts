import {
  GlAccountType,
  Currency,
  User,
  Organisation,
  BankAccount,
  Vault,
  Charge,
  Till,
  GlEntry,
} from "@prisma/client";

export interface IGlAccount {
  id: string;
  name: string;
  type: GlAccountType;
  balance?: number | null;
  currency_id?: string | null;
  currency?: Currency | null;
  locked_balance?: number | null;
  max_balance?: number | null;
  min_balance?: number | null;
  closed_at?: Date | string | null;
  close_reason?: string | null;
  frozen_at?: Date | string | null;
  frozen_reason?: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  opened_by?: string | null;
  opened_by_user?: User | null;
  organisation_id?: string | null;
  organisation?: Organisation | null;
  bank_account_id?: string | null;
  bank_account?: BankAccount | null;
  till_id?: string | null;
  till?: Till | null;
  charge_id?: string | null;
  charge?: Charge | null;
  vault_id?: string | null;
  vault?: Vault | null;
  gl_entries?: GlEntry[] | null;
}

export interface GlAccountFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: GlAccountType;
  currency_id?: string;
  organisation_id?: string;
  opened_by?: string;
  is_closed?: boolean;
  is_frozen?: boolean;
  till_id?: string;
  charge_id?: string;
  vault_id?: string;
}

export interface GlAccountListResponse {
  success: boolean;
  message: string;
  data?: {
    glAccounts: IGlAccount[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface GlAccountResponse {
  success: boolean;
  message: string;
  data?: IGlAccount;
  error?: string;
}

export interface GlAccountStats {
  totalGlAccounts: number;
  totalBalance: number;
  totalLockedBalance: number;
  byType: {
    type: string;
    count: number;
    total_balance: number;
  }[];
  byCurrency: {
    currency_id: string;
    currency_code: string;
    count: number;
    total_balance: number;
  }[];
}

export interface GlAccountStatsResponse {
  success: boolean;
  message: string;
  data: GlAccountStats;
  error?: string;
}

export interface CreateGlAccountRequest {
  name: string;
  type: GlAccountType;
  balance?: number;
  currency_id?: string;
  locked_balance?: number;
  max_balance?: number;
  min_balance?: number;
  organisation_id?: string;
  bank_account_id?: string;
  till_id?: string;
  charge_id?: string;
  vault_id?: string;
}

export interface UpdateGlAccountRequest {
  name?: string;
  type?: GlAccountType;
  balance?: number;
  currency_id?: string;
  locked_balance?: number;
  max_balance?: number;
  min_balance?: number;
  organisation_id?: string;
  bank_account_id?: string;
  close_reason?: string;
  frozen_reason?: string;
  till_id?: string;
  charge_id?: string;
  vault_id?: string;
}

export interface GenerateAccountsRequest {
  organisation_id: string;
  generate_for_bank_accounts?: boolean;
  generate_for_tills?: boolean;
  generate_for_vaults?: boolean;
  generate_for_charges?: boolean;
  generate_for_org_balances?: boolean;
  generate_for_charges_payments?: boolean;
  generate_for_inbound_beneficiary_payments?: boolean;
}

export interface GenerateAccountsResponse {
  success: boolean;
  message: string;
  data?: {
    generated_count: number;
    accounts: IGlAccount[];
  };
  error?: string;
}
