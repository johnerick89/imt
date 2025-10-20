import type { Charge } from "./ChargesTypes";
import type { Currency } from "./CurrenciesTypes";
import type { Organisation } from "./OrganisationsTypes";
import type { Transaction } from "./TransactionsTypes";
import type { User } from "./UsersTypes";

export const ChargeType = {
  TAX: "TAX",
  INTERNAL_FEE: "INTERNAL_FEE",
  COMMISSION: "COMMISSION",
  OTHER: "OTHER",
} as const;
export type ChargeType = (typeof ChargeType)[keyof typeof ChargeType];

export const ChargesPaymentStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type ChargesPaymentStatus =
  (typeof ChargesPaymentStatus)[keyof typeof ChargesPaymentStatus];

export const CommissionRole = {
  ORIGIN: "ORIGIN",
  DESTINATION: "DESTINATION",
  INTERNAL: "INTERNAL",
  INTERMEDIARY: "INTERMEDIARY",
} as const;
export type CommissionRole =
  (typeof CommissionRole)[keyof typeof CommissionRole];

export const CommissionSplitStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  SETTLED: "SETTLED",
  REJECTED: "REJECTED",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
};

// Charges Payment Interface
export interface ChargesPayment {
  id: string;
  type: ChargeType;
  internal_total_amount: number;
  external_total_amount: number;
  reference_number: string;
  date_completed: string | null;
  currency_id: string;
  destination_org_id: string | null;
  status: ChargesPaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  organisation_id: string;
  commission_splits?: CommissionSplit[];
  total_amount_settled?: number;
  origin_amount_settled?: number;
  destination_amount_settled?: number;
  internal_amount_settled?: number;
  amount_settled?: number;
  amount?: number;
  // Relations
  currency?: Currency;
  destination_org?: Organisation;
  created_by_user?: User;
  organisation?: Organisation;
  payment_items?: ChargesPaymentItem[];
  origin_total_amount: number;
  destination_total_amount: number;
}

export type CommissionSplitStatus =
  (typeof CommissionRole)[keyof typeof CommissionRole];
export interface CommissionSplit {
  id: string;
  transaction_charges_id: string;
  organisation_id: string;
  transaction_id: string;
  amount: number;
  role?: CommissionRole;
  notes?: string | null;
  created_at: Date;
  updated_at: Date;
  status: CommissionSplitStatus;
  settled_at?: Date | null;
  settled_by?: string | null;
  currency_id?: string | null;

  transaction_charge?: TransactionCharge | null;
  organisation?: Organisation | null;
  transaction?: Transaction | null;
  settled_by_user?: User | null;
  charges_payment_items: ChargesPaymentItem[];
  currency?: Currency | null;
}

export interface PendingCommissionSplitResponse {
  success: boolean;
  message: string;
  data: {
    commission_splits: CommissionSplit[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Charges Payment Item Interface
export interface ChargesPaymentItem {
  id: string;
  charges_payment_id: string;
  transaction_charges_id?: string;
  commission_split_id?: string;
  internal_amount_settled: number;
  external_amount_settled: number;
  amount_settled: number;
  origin_amount_settled: number;
  destination_amount_settled: number;
  created_at: string;
  // Relations
  charges_payment?: ChargesPayment;
  transaction_charges?: TransactionCharge;
  transaction?: Transaction;
  commission_split?: CommissionSplit;
  // Relations
  transaction_charge?: TransactionCharge;
  organisation?: Organisation;
}

// Transaction Charge Interface (for pending charges)
export interface TransactionCharge {
  id: string;
  transaction_id: string;
  charge_id: string;
  type: ChargeType;
  amount: number;
  internal_amount: number | null;
  external_amount: number | null;
  rate: number | null;
  is_reversible: boolean;
  description: string | null;
  status: string;
  organisation_id: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  transaction?: Transaction;
  charge?: Charge;
  organisation?: Organisation;
  origin_amount: number | null;
  destination_amount: number | null;
}

// Create Charges Payment Request
export interface CreateChargesPaymentRequest {
  transaction_charge_ids: string[];
  notes?: string;
}

// Approve Charges Payment Request
export interface ApproveChargesPaymentRequest {
  notes?: string;
}

// Reverse Charges Payment Request
export interface ReverseChargesPaymentRequest {
  reason: string;
  notes?: string;
}

// Charges Payment Filters
export interface ChargesPaymentFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: ChargeType;
  status?: ChargesPaymentStatus;
  destination_org_id?: string;
  currency_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  organisation_id?: string;
}

// Pending Transaction Charges Filters
export interface PendingTransactionChargesFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: ChargeType;
  destination_org_id?: string;
  currency_id?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
  organisation_id?: string;
}

// Charges Payment List Response
export interface ChargesPaymentListResponse {
  success: boolean;
  message: string;
  data: {
    charges_payments: ChargesPayment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Charges Payment Response
export interface ChargesPaymentResponse {
  success: boolean;
  message: string;
  data: ChargesPayment;
}

// Charges Payment Items Response
export interface ChargesPaymentItemsResponse {
  success: boolean;
  message: string;
  data: {
    charges_payment: ChargesPayment;
    payment_items: ChargesPaymentItem[];
  };
}

// Pending Transaction Charges Response
export interface PendingTransactionChargesResponse {
  success: boolean;
  message: string;
  data: {
    transaction_charges: TransactionCharge[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Charges Payment Stats
export interface ChargesPaymentStats {
  totalPendingCharges: number;
  totalPendingAmount: number;
  totalCompletedPayments?: number;
  totalCompletedAmount?: number;
  byType: Array<{
    type: ChargeType;
    count: number;
    amount: number;
    pendingCount?: number;
    pendingAmount?: number;
    completedCount?: number;
    completedAmount?: number;
  }>;
  byOrganisation: Array<{
    organisation_id: string;
    organisation_name: string;
    count: number;
    amount: number;
  }>;
  byCurrency: Array<{
    currency_id: string;
    currency_code: string;
    count: number;
    amount: number;
  }>;
}

// Charges Payment Stats Response
export interface ChargesPaymentStatsResponse {
  success: boolean;
  message: string;
  data: ChargesPaymentStats;
}
