import type { Customer } from "./CustomersTypes";
import type { Beneficiary } from "./BeneficiariesTypes";
import type { Charge } from "./ChargesTypes";
import type { Organisation } from "./OrganisationsTypes";
import type { Till } from "./TillsTypes";
import type { Currency } from "./CurrenciesTypes";
import type { ExchangeRate } from "./ExchangeRatesTypes";
import type { User } from "./UsersTypes";
import type { TransactionChannel } from "./TransactionChannelsTypes";
import type { Corridor } from "./CorridorsTypes";

export const Direction = {
  INBOUND: "INBOUND",
  OUTBOUND: "OUTBOUND",
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];

export const Status = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  PENDING: "PENDING",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  REVERSED: "REVERSED",
} as const;
export type Status = (typeof Status)[keyof typeof Status];

export const RemittanceStatus = {
  PENDING: "PENDING",
  FAILED: "FAILED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
} as const;
export type RemittanceStatus =
  (typeof RemittanceStatus)[keyof typeof RemittanceStatus];

export const RequestStatus = {
  UNDER_REVIEW: "UNDER_REVIEW",
  PENDING_OPERATIONS_APPROVAL: "PENDING_OPERATIONS_APPROVAL",
  PENDING_CUSTOMER_ACTION: "PENDING_CUSTOMER_ACTION",
  PENDING_VERIFICATION: "PENDING_VERIFICATION",
} as const;
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export const ChargeType = {
  TAX: "TAX",
  INTERNAL_FEE: "INTERNAL_FEE",
  COMMISSION: "COMMISSION",
  OTHER: "OTHER",
} as const;
export type ChargeType = (typeof ChargeType)[keyof typeof ChargeType];

export const TransactionChargeStatus = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
  PAID: "PAID",
  REVERSED: "REVERSED",
} as const;
export type TransactionChargeStatus =
  (typeof TransactionChargeStatus)[keyof typeof TransactionChargeStatus];

export const PartyRole = {
  SENDER: "SENDER",
  RECEIVER: "RECEIVER",
} as const;
export type PartyRole = (typeof PartyRole)[keyof typeof PartyRole];

export const IndividualIDType = {
  PASSPORT: "PASSPORT",
  NATIONAL_ID: "NATIONAL_ID",
  DRIVERS_LICENSE: "DRIVERS_LICENSE",
  OTHER: "OTHER",
} as const;
export type IndividualIDType =
  (typeof IndividualIDType)[keyof typeof IndividualIDType];

// Transaction Party Interface
export interface TransactionParty {
  id: string;
  transaction_id: string;
  role: PartyRole;
  name: string;
  id_type: IndividualIDType | null;
  id_number: string | null;
  nationality_id: string | null;
  payout_method_channel_id: string | null;
  payout_bank_name: string | null;
  payout_bank_account_number: string | null;
  payout_bank_account_name: string | null;
  payout_phone: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  organisation_id: string;
  created_by: string | null;

  // Relations
  nationality?: {
    id: string;
    name: string;
    country_code: string;
  };
  payout_method_channel?: {
    id: string;
    name: string;
    description: string;
  };
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Base Transaction Interface
export interface Transaction {
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
  remitted_at: string | null;
  exchange_rate_id: string | null;
  external_exchange_rate_id: string | null;
  created_by: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  received_at: string | null;
  amount_payable: number | null;
  amount_receivable: number | null;
  origin_organisation_id: string | null;
  destination_organisation_id: string | null;

  // Relations
  corridor?: Corridor;
  till?: Till;
  customer?: Customer;
  origin_currency?: Currency;
  origin_channel?: TransactionChannel;
  beneficiary?: Beneficiary;
  dest_channel?: TransactionChannel;
  dest_currency?: Currency;
  exchange_rate?: ExchangeRate;
  external_exchange_rate?: ExchangeRate;
  created_by_user?: User;
  origin_organisation?: Organisation;
  destination_organisation?: Organisation;
  transaction_charges?: TransactionCharge[];
  transaction_parties?: TransactionParty[];
}

// Transaction Charge Interface
export interface TransactionCharge {
  id: string;
  transaction_id: string;
  charge_id: string;
  type: ChargeType;
  amount: number;
  rate: number | null;
  is_reversible: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
  status: TransactionChargeStatus;
  organisation_id: string | null;
  internal_amount: number | null;
  internal_percentage: number | null;
  external_amount: number | null;
  external_percentage: number | null;
  // Relations
  charge?: Charge;
  organisation?: Organisation;
  transaction?: Transaction;
}

// Create Outbound Transaction Request
export interface ITransactionChargeInItem {
  charge_id: string;
  type: ChargeType;
  original_rate: number;
  negotiated_rate: number;
}

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
  transaction_charges?: ITransactionChargeInItem[];
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
    transactions: Transaction[];
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
  data: Transaction;
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
    description: string;
    is_reversible: boolean;
    internal_amount: number | null;
    internal_percentage: number | null;
    external_amount: number | null;
    external_percentage: number | null;
  }>;
}

// Outbound Transaction Creation Result
export interface OutboundTransactionResult {
  transaction: Transaction;
  charges: TransactionCharge[];
  totalCharges: number;
  netAmount: number;
}

// Inbound Transaction Filters
export type InboundTransactionFilters = TransactionFilters;

// Inbound Transaction List Response
export type InboundTransactionListResponse = TransactionListResponse;

// Inbound Transaction Response
export type InboundTransactionResponse = TransactionResponse;

// Inbound Transaction Stats
export type InboundTransactionStats = TransactionStats;

// Inbound Transaction Stats Response
export type InboundTransactionStatsResponse = TransactionStatsResponse;
