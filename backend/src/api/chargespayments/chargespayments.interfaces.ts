import { ChargeType, ChargesPaymentStatus } from "@prisma/client";

// Charges Payment Interface
export interface IChargesPayment {
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

  // Relations
  currency?: {
    id: string;
    currency_code: string;
    currency_name: string;
  };
  destination_org?: {
    id: string;
    name: string;
    type: string;
  };
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  organisation?: {
    id: string;
    name: string;
    type: string;
  };
  payment_items?: IChargesPaymentItem[];
}

// Charges Payment Item Interface
export interface IChargesPaymentItem {
  id: string;
  charges_payment_id: string;
  transaction_charges_id: string;
  internal_amount_settled: number;
  external_amount_settled: number;
  created_at: string;

  // Relations
  charges_payment?: IChargesPayment;
  transaction_charges?: {
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
    transaction?: {
      id: string;
      transaction_no: string | null;
      direction: string;
      origin_amount: number;
      dest_amount: number;
      status: string;
      created_at: string | null;
    };
    charge?: {
      id: string;
      name: string;
      description: string;
      type: ChargeType;
      rate: number;
      application_method: string;
    };
    organisation?: {
      id: string;
      name: string;
    };
  };
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
    charges_payments: IChargesPayment[];
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
  data: IChargesPayment;
}

// Charges Payment Items Response
export interface ChargesPaymentItemsResponse {
  success: boolean;
  message: string;
  data: {
    charges_payment: IChargesPayment;
    payment_items: IChargesPaymentItem[];
  };
}

// Pending Transaction Charges Response
export interface PendingTransactionChargesResponse {
  success: boolean;
  message: string;
  data: {
    transaction_charges: Array<{
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
      transaction?: {
        id: string;
        transaction_no: string | null;
        direction: string;
        origin_amount: number;
        dest_amount: number;
        status: string;
        created_at: string | null;
        customer?: {
          id: string;
          first_name: string;
          last_name: string;
        };
        beneficiary?: {
          id: string;
          name: string;
        };
        origin_currency?: {
          id: string;
          currency_code: string;
        };
        dest_currency?: {
          id: string;
          currency_code: string;
        };
        origin_organisation?: {
          id: string;
          name: string;
        };
        destination_organisation?: {
          id: string;
          name: string;
        };
      };
      charge?: {
        id: string;
        name: string;
        description: string;
        type: ChargeType;
        rate: number;
        application_method: string;
      };
      organisation?: {
        id: string;
        name: string;
      };
    }>;
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
