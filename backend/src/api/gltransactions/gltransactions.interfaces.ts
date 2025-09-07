import {
  GLTransactionType,
  GLTransactionStatus,
  Currency,
  Vault,
  UserTill,
  Organisation,
  Customer,
  Transaction,
  GlEntry,
  GlAccount,
  User,
} from "@prisma/client";

export interface IGlTransaction {
  id: string;
  transaction_type: GLTransactionType;
  status: GLTransactionStatus;
  amount: number | any; // Allow Decimal type from Prisma
  currency_id?: string | null;
  currency?: Currency | null;
  description: string;
  vault_id?: string | null;
  vault?: Vault | null;
  user_till_id?: string | null;
  user_till?: UserTill | null;
  organisation_id?: string | null;
  organisation?: Organisation | null;
  customer_id?: string | null;
  customer?: Customer | null;
  transaction_id?: string | null;
  transaction?: Transaction | null;
  gl_entries?: GlEntry[];
  created_at: Date | string;
  updated_at: Date | string;
  created_by?: string | null;
  created_by_user?: User | null;
}

export interface IGlEntry {
  id: string;
  gl_account_id: string;
  gl_account?: GlAccount | null;
  gl_transaction_id: string;
  amount: number | any; // Allow Decimal type from Prisma
  dr_cr: "DR" | "CR";
  description: string;
  created_at: Date | string;
  updated_at: Date | string;
  created_by?: string | null;
  created_by_user?: User | null;
}

export interface GlTransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  transaction_type?: GLTransactionType;
  status?: GLTransactionStatus;
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
    glTransactions: IGlTransaction[];
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
  data: IGlTransaction;
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

export interface CreateGlTransactionRequest {
  transaction_type: GLTransactionType;
  amount: number;
  currency_id?: string;
  description: string;
  vault_id?: string;
  user_till_id?: string;
  customer_id?: string;
  transaction_id?: string;
  gl_entries: CreateGlEntryRequest[];
}

export interface CreateGlEntryRequest {
  gl_account_id: string;
  amount: number;
  dr_cr: "DR" | "CR";
  description: string;
}

export interface ReverseGlTransactionRequest {
  description?: string;
}

export interface ReverseGlTransactionResponse {
  success: boolean;
  message: string;
  data: {
    original_transaction: IGlTransaction;
    reversal_transaction: IGlTransaction;
  };
  error?: string;
}
