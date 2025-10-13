import type { Currency } from "./CurrenciesTypes";
import type { Organisation } from "./OrganisationsTypes";
import type { BankAccount } from "./BankAccountsTypes";
import type { Till } from "./TillsTypes";
import type { Charge } from "./ChargesTypes";
import type { Vault } from "./VaultsTypes";
import type { User } from "./UsersTypes";
import type { GlEntry } from "./GlTransactionsTypes";

export const GlAccountType = {
  ASSET: "ASSET",
  LIABILITY: "LIABILITY",
  EQUITY: "EQUITY",
  REVENUE: "REVENUE",
  EXPENSE: "EXPENSE",
} as const;
export type GlAccountType = (typeof GlAccountType)[keyof typeof GlAccountType];
export interface GlAccount {
  id: string;
  name: string;
  type: GlAccountType;
  balance?: number | null;
  currency_id?: string | null;
  currency?: Currency | null;
  locked_balance?: number | null;
  max_balance?: number | null;
  min_balance?: number | null;
  closed_at?: string | null;
  close_reason?: string | null;
  frozen_at?: string | null;
  frozen_reason?: string | null;
  created_at: string;
  updated_at: string;
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
  counter_party_organisation_id?: string | null;
  counter_party_organisation?: Organisation | null;
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
}

export interface GlAccountListResponse {
  success: boolean;
  message: string;
  data: {
    glAccounts: GlAccount[];
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
  data: GlAccount;
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
}

export interface GenerateAccountsRequest {
  organisation_id: string;
  generate_for_bank_accounts?: boolean;
  generate_for_tills?: boolean;
  generate_for_vaults?: boolean;
  generate_for_charges?: boolean;
  generate_for_charges_payments?: boolean;
  generate_for_org_balances?: boolean;
  generate_for_inbound_beneficiary_payments?: boolean;
  generate_for_agency_floats?: boolean;
  generate_for_float_transit_payables?: boolean;
}

export interface GenerateAccountsResponse {
  success: boolean;
  message: string;
  data: {
    generated_count: number;
    accounts: GlAccount[];
  };
  error?: string;
}
