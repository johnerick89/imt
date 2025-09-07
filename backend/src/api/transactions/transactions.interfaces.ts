import {
  Direction,
  Status,
  RemittanceStatus,
  RequestStatus,
  ChargeType,
  TransactionChargeStatus,
} from "@prisma/client";

// Base Transaction Interface
export interface ITransaction {
  id: string;
  transaction_no: string | null;
  corridor_id: string;
  till_id: string;
  direction: Direction;
  customer_id: string;
  origin_amount: number;
  origin_channel_id: string;
  origin_currency_id: string;
  beneficiary_id: string;
  dest_amount: number;
  dest_channel_id: string;
  dest_currency_id: string;
  rate: number;
  internal_exchange_rate: number | null;
  inflation: number | null;
  markup: number | null;
  purpose: string | null;
  funds_source: string | null;
  relationship: string | null;
  remarks: string | null;
  status: Status;
  remittance_status: RemittanceStatus;
  remittance_status_details: string | null;
  request_status: RequestStatus;
  remitted_at: Date | string | null;
  exchange_rate_id: string | null;
  external_exchange_rate_id: string | null;
  created_by: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
  deleted_at: Date | string | null;
  received_at: Date | string | null;
  amount_payable: number | null;
  amount_receivable: number | null;
  origin_organisation_id: string | null;
  destination_organisation_id: string | null;

  // Relations
  corridor?: {
    id: string;
    name: string;
    base_country: { id: string; name: string; country_code: string };
    destination_country: { id: string; name: string; country_code: string };
    base_currency: { id: string; currency_code: string; currency_name: string };
  };
  till?: {
    id: string;
    name: string;
    organisation: { id: string; name: string };
  };
  customer?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  origin_channel?: {
    id: string;
    name: string;
    description: string;
  };
  origin_currency?: {
    id: string;
    currency_code: string;
    currency_name: string;
  };
  beneficiary?: {
    id: string;
    name: string;
    account_number: string;
    bank_name: string;
  };
  dest_channel?: {
    id: string;
    name: string;
    description: string;
  };
  dest_currency?: {
    id: string;
    currency_code: string;
    currency_name: string;
  };
  exchange_rate?: {
    id: string;
    rate: number;
    currency_pair: string;
  };
  external_exchange_rate?: {
    id: string;
    rate: number;
    currency_pair: string;
  };
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  origin_organisation?: {
    id: string;
    name: string;
    type: string;
  };
  destination_organisation?: {
    id: string;
    name: string;
    type: string;
  };
  transaction_charges?: ITransactionCharge[];
}

// Transaction Charge Interface
export interface ITransactionCharge {
  id: string;
  transaction_id: string;
  charge_id: string;
  type: ChargeType;
  amount: number;
  rate: number | null;
  is_reversible: boolean;
  description: string | null;
  created_at: Date | string;
  updated_at: Date | string;
  status: TransactionChargeStatus;
  organisation_id: string | null;

  // Relations
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
}

// Create Outbound Transaction Request
export interface CreateOutboundTransactionRequest {
  corridor_id: string;
  till_id: string;
  customer_id: string;
  origin_amount: number;
  origin_channel_id: string;
  origin_currency_id: string;
  beneficiary_id: string;
  dest_amount: number;
  dest_channel_id: string;
  dest_currency_id: string;
  rate: number;
  internal_exchange_rate?: number;
  inflation?: number;
  markup?: number;
  purpose?: string;
  funds_source?: string;
  relationship?: string;
  remarks?: string;
  exchange_rate_id?: string;
  external_exchange_rate_id?: string;
  destination_organisation_id?: string;
  origin_country_id?: string;
  destination_country_id?: string;
}

// Update Transaction Request
export interface UpdateTransactionRequest {
  corridor_id?: string;
  till_id?: string;
  customer_id?: string;
  origin_amount?: number;
  origin_channel_id?: string;
  origin_currency_id?: string;
  beneficiary_id?: string;
  dest_amount?: number;
  dest_channel_id?: string;
  dest_currency_id?: string;
  rate?: number;
  internal_exchange_rate?: number;
  inflation?: number;
  markup?: number;
  purpose?: string;
  funds_source?: string;
  relationship?: string;
  remarks?: string;
  exchange_rate_id?: string;
  external_exchange_rate_id?: string;
  destination_organisation_id?: string;
}

// Transaction Filters
export interface TransactionFilters {
  page?: number;
  limit?: number;
  search?: string;
  direction?: Direction;
  status?: Status;
  remittance_status?: RemittanceStatus;
  request_status?: RequestStatus;
  corridor_id?: string;
  till_id?: string;
  customer_id?: string;
  origin_currency_id?: string;
  dest_currency_id?: string;
  origin_organisation_id?: string;
  destination_organisation_id?: string;
  created_by?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
}

// Transaction List Response
export interface TransactionListResponse {
  success: boolean;
  message: string;
  data: {
    transactions: ITransaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Transaction Response
export interface TransactionResponse {
  success: boolean;
  message: string;
  data: ITransaction;
}

// Transaction Stats
export interface TransactionStats {
  totalTransactions: number;
  totalAmount: number;
  byStatus: Array<{
    status: Status;
    count: number;
    amount: number;
  }>;
  byDirection: Array<{
    direction: Direction;
    count: number;
    amount: number;
  }>;
  byCurrency: Array<{
    currency_id: string;
    currency_code: string;
    count: number;
    amount: number;
  }>;
  byOrganisation: Array<{
    organisation_id: string;
    organisation_name: string;
    count: number;
    amount: number;
  }>;
}

// Transaction Stats Response
export interface TransactionStatsResponse {
  success: boolean;
  message: string;
  data: TransactionStats;
}

// Cancel Transaction Request
export interface CancelTransactionRequest {
  reason?: string;
}

// Approve Transaction Request
export interface ApproveTransactionRequest {
  remarks?: string;
}

// Reverse Transaction Request
export interface ReverseTransactionRequest {
  reason: string;
  remarks?: string;
}

// Transaction Charge Calculation Result
export interface TransactionChargeCalculation {
  totalCharges: number;
  netAmount: number;
  charges: Array<{
    charge_id: string;
    type: ChargeType;
    amount: number;
    rate: number | null;
    internal_amount: number | null;
    internal_percentage: number | null;
    external_amount: number | null;
    external_percentage: number | null;
    description: string;
    is_reversible: boolean;
  }>;
}

// Outbound Transaction Creation Result
export interface OutboundTransactionResult {
  transaction: ITransaction;
  charges: ITransactionCharge[];
  totalCharges: number;
  netAmount: number;
}
