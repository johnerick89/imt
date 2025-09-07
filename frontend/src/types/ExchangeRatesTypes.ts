import type { User } from "./UsersTypes";
import type { Currency } from "./CurrenciesTypes";
import type { Country } from "./CountriesTypes";
import type { Organisation } from "./OrganisationsTypes";

export const ExchangeRateStatus = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  REJECTED: "REJECTED",
} as const;
export type ExchangeRateStatus = keyof typeof ExchangeRateStatus;

export const ExchangeRateOperatorStatus = {
  PENDING_APPROVAL: "PENDING_APPROVAL",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;
export type ExchangeRateOperatorStatus =
  keyof typeof ExchangeRateOperatorStatus;

export interface ExchangeRate {
  id: string;
  name?: string | null;
  from_currency_id?: string | null;
  from_currency?: Currency | null;
  to_currency_id?: string | null;
  to_currency?: Currency | null;
  origin_country_id?: string | null;
  origin_country?: Country | null;
  destination_country_id?: string | null;
  destination_country?: Country | null;
  buy_rate: number;
  sell_rate: number;
  exchange_rate: number;
  min_buy_rate?: number | null;
  max_buy_rate?: number | null;
  min_sell_rate?: number | null;
  max_sell_rate?: number | null;
  min_exchange_rate?: number | null;
  max_exchange_rate?: number | null;
  status: ExchangeRateStatus;
  operator_status: ExchangeRateOperatorStatus;
  approved_by?: string | null;
  approved_by_user?: User | null;
  created_by?: string | null;
  created_by_user?: User | null;
  organisation_id?: string | null;
  organisation?: Organisation | null;
  date_from?: Date | null;
  date_to?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateExchangeRateRequest {
  name?: string;
  from_currency_id?: string;
  to_currency_id?: string;
  origin_country_id?: string;
  destination_country_id?: string;
  buy_rate: number;
  sell_rate: number;
  exchange_rate: number;
  min_buy_rate?: number;
  max_buy_rate?: number;
  min_sell_rate?: number;
  max_sell_rate?: number;
  min_exchange_rate?: number;
  max_exchange_rate?: number;
  organisation_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface UpdateExchangeRateRequest {
  name?: string;
  from_currency_id?: string;
  to_currency_id?: string;
  origin_country_id?: string;
  destination_country_id?: string;
  buy_rate?: number;
  sell_rate?: number;
  exchange_rate?: number;
  min_buy_rate?: number;
  max_buy_rate?: number;
  min_sell_rate?: number;
  max_sell_rate?: number;
  min_exchange_rate?: number;
  max_exchange_rate?: number;
  organisation_id?: string;
  date_from?: string;
  date_to?: string;
}

export interface ApproveExchangeRateRequest {
  status: ExchangeRateStatus;
  operator_status: ExchangeRateOperatorStatus;
}

export interface ExchangeRateFilters {
  page?: number;
  limit?: number;
  search?: string;
  from_currency_id?: string;
  to_currency_id?: string;
  origin_country_id?: string;
  destination_country_id?: string;
  status?: ExchangeRateStatus;
  operator_status?: ExchangeRateOperatorStatus;
  organisation_id?: string;
  created_by?: string;
}

export interface ExchangeRateListResponse {
  success: boolean;
  message: string;
  data: {
    exchangeRates: ExchangeRate[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface ExchangeRateResponse {
  success: boolean;
  message: string;
  data: ExchangeRate;
  error?: string;
}

export interface ExchangeRateStats {
  totalExchangeRates: number;
  activeExchangeRates: number;
  inactiveExchangeRates: number;
  pendingApprovalExchangeRates: number;
  exchangeRatesByStatus: { [key: string]: number };
  exchangeRatesByCurrency: { [key: string]: number };
}

export interface ExchangeRateStatsResponse {
  success: boolean;
  message: string;
  data: ExchangeRateStats;
  error?: string;
}
