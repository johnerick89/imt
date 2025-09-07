import type { Vault } from "./VaultsTypes";
import type { Till } from "./TillsTypes";
import type { Organisation } from "./OrganisationsTypes";
import type { Customer } from "./CustomersTypes";
import type { Currency } from "./CurrenciesTypes";
import type { User } from "./UsersTypes";

export const GLTransactionType = {
  VAULT_WITHDRAWAL: "VAULT_WITHDRAWAL",
  VAULT_DEPOSIT: "VAULT_DEPOSIT",
  TILL_OPEN: "TILL_OPEN",
  TILL_CLOSE: "TILL_CLOSE",
  TILL_TOPUP: "TILL_TOPUP",
  TILL_WITHDRAWAL: "TILL_WITHDRAWAL",
} as const;
export type GLTransactionType =
  (typeof GLTransactionType)[keyof typeof GLTransactionType];

export const GLTransactionStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  POSTED: "POSTED",
  FAILED: "FAILED",
} as const;
export type GLTransactionStatus =
  (typeof GLTransactionStatus)[keyof typeof GLTransactionStatus];
export interface GlTransaction {
  id: string;
  transaction_type: GLTransactionType;
  status: GLTransactionStatus;
  amount: number;
  currency_id?: string | null;
  currency?: Currency | null;
  description: string;
  vault_id?: string | null;
  vault?: Vault | null;
  user_till_id?: string | null;
  user_till?: {
    id: string;
    till: Till;
    user: User;
  } | null;
  organisation_id?: string | null;
  organisation?: Organisation | null;
  customer_id?: string | null;
  customer?: Customer | null;
  transaction_id?: string | null;
  transaction?: {
    id: string;
    reference: string;
    direction: "OUTBOUND" | "INBOUND";
  } | null;
  gl_entries?: GlEntry[];
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  created_by_user?: User | null;
}

export interface GlEntry {
  id: string;
  gl_account_id: string;
  gl_account?: {
    id: string;
    name: string;
    type: string;
    currency?: {
      id: string;
      currency_code: string;
    } | null;
  } | null;
  gl_transaction_id: string;
  amount: number;
  dr_cr: "DR" | "CR";
  description: string;
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

export interface GlTransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  transaction_type?:
    | "VAULT_WITHDRAWAL"
    | "VAULT_DEPOSIT"
    | "TILL_OPEN"
    | "TILL_CLOSE"
    | "TILL_TOPUP"
    | "TILL_WITHDRAWAL"
    | "OUTBOUND_TRANSACTION"
    | "OUTBOUND_TRANSACTION_REVERSAL"
    | "INBOUND_TRANSACTION"
    | "INBOUND_TRANSACTION_REVERSAL";
  status?: "PENDING" | "APPROVED" | "POSTED" | "FAILED";
  currency_id?: string;
  vault_id?: string;
  user_till_id?: string;
  customer_id?: string;
  transaction_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface GlTransactionListResponse {
  success: boolean;
  message: string;
  data: {
    glTransactions: GlTransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface GlTransactionResponse {
  success: boolean;
  message: string;
  data: GlTransaction;
  error?: string;
}

export interface GlTransactionStats {
  totalTransactions: number;
  totalAmount: number;
  byStatus: {
    status: string;
    count: number;
    total_amount: number;
  }[];
  byType: {
    type: string;
    count: number;
    total_amount: number;
  }[];
  byCurrency: {
    currency_id: string;
    currency_code: string;
    count: number;
    total_amount: number;
  }[];
}

export interface GlTransactionStatsResponse {
  success: boolean;
  message: string;
  data: GlTransactionStats;
  error?: string;
}

export interface ReverseGlTransactionRequest {
  description?: string;
}

export interface ReverseGlTransactionResponse {
  success: boolean;
  message: string;
  data: {
    original_transaction: GlTransaction;
    reversal_transaction: GlTransaction;
  };
  error?: string;
}
