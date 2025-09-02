export interface Charge {
  id: string;
  name: string;
  description: string;
  application_method: "PERCENTAGE" | "FIXED";
  currency_id?: string | null;
  type: "TAX" | "INTERNAL_FEE" | "COMMISSION" | "OTHER";
  rate: number;
  origin_organisation_id?: string | null;
  destination_organisation_id?: string | null;
  is_reversible: boolean;
  direction: "OUTBOUND" | "INBOUND" | "BOTH";
  origin_share_percentage?: number | null;
  destination_share_percentage?: number | null;
  created_at: string;
  created_by?: string | null;
  updated_at: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  min_amount?: number | null;
  max_amount?: number | null;
  currency?: {
    id: string;
    currency_name: string;
    currency_code: string;
    currency_symbol: string;
  } | null;
  origin_organisation?: {
    id: string;
    name: string;
    type: string;
  } | null;
  destination_organisation?: {
    id: string;
    name: string;
    type: string;
  } | null;
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface CreateChargeRequest {
  name: string;
  description: string;
  application_method: "PERCENTAGE" | "FIXED";
  currency_id?: string;
  type: "TAX" | "INTERNAL_FEE" | "COMMISSION" | "OTHER";
  rate: number;
  origin_organisation_id?: string;
  destination_organisation_id?: string;
  is_reversible?: boolean;
  direction: "OUTBOUND" | "INBOUND" | "BOTH";
  origin_share_percentage?: number;
  destination_share_percentage?: number;
  status?: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  min_amount?: number;
  max_amount?: number;
}

export interface UpdateChargeRequest {
  name?: string;
  description?: string;
  application_method?: "PERCENTAGE" | "FIXED";
  currency_id?: string;
  type?: "TAX" | "INTERNAL_FEE" | "COMMISSION" | "OTHER";
  rate?: number;
  origin_organisation_id?: string;
  destination_organisation_id?: string;
  is_reversible?: boolean;
  direction?: "OUTBOUND" | "INBOUND" | "BOTH";
  origin_share_percentage?: number;
  destination_share_percentage?: number;
  status?: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  min_amount?: number;
  max_amount?: number;
}

export interface ChargeFilters {
  page?: number;
  limit?: number;
  search?: string;
  type?: "TAX" | "INTERNAL_FEE" | "COMMISSION" | "OTHER";
  status?: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  application_method?: "PERCENTAGE" | "FIXED";
  direction?: "OUTBOUND" | "INBOUND" | "BOTH";
  currency_id?: string;
  origin_organisation_id?: string;
  destination_organisation_id?: string;
  created_by?: string;
}

export interface ChargeListResponse {
  success: boolean;
  message: string;
  data: {
    charges: Charge[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ChargeResponse {
  success: boolean;
  message: string;
  data: Charge;
}

export interface ChargeStats {
  totalCharges: number;
  activeCharges: number;
  inactiveCharges: number;
  pendingCharges: number;
  blockedCharges: number;
  taxCharges: number;
  feeCharges: number;
  commissionCharges: number;
}

export interface ChargeStatsResponse {
  success: boolean;
  message: string;
  data: ChargeStats;
}
