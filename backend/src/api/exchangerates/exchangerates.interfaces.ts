import {
  ExchangeRateStatus,
  ExchangeRateOperatorStatus,
  Currency,
  Country,
  User,
} from "@prisma/client";

export interface IExchangeRate {
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
  valid_from?: Date | null;
  valid_to?: Date | null;
  created_at: Date;
  updated_at: Date;
  created_by?: string | null;
  created_by_user?: User | null;
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
  status?: ExchangeRateStatus;
  valid_from?: string;
  valid_to?: string;
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
  status?: ExchangeRateStatus;
  valid_from?: string;
  valid_to?: string;
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
  created_by?: string;
}

export interface ExchangeRateListResponse {
  success: boolean;
  message: string;
  data: {
    exchangeRates: IExchangeRate[];
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
  data: IExchangeRate;
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

export interface ApproveExchangeRateRequest {
  status: ExchangeRateStatus;
  operator_status: ExchangeRateOperatorStatus;
}
