export interface ICurrency {
  id: string;
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  symbol_native: string | null;
  decimal_digits: number | null;
  rounding: number | null;
  name_plural: string | null;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
}

export interface CreateCurrencyRequest {
  currency_name: string;
  currency_code: string;
  currency_symbol: string;
  symbol_native?: string;
  decimal_digits?: number;
  rounding?: number;
  name_plural?: string;
}

export interface UpdateCurrencyRequest {
  currency_name?: string;
  currency_code?: string;
  currency_symbol?: string;
  symbol_native?: string;
  decimal_digits?: number;
  rounding?: number;
  name_plural?: string;
}

export interface CurrencyFilters {
  search?: string;
  currency_code?: string;
  page?: number;
  limit?: number;
}

export interface CurrencyListResponse {
  success: boolean;
  message: string;
  data: {
    currencies: ICurrency[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CurrencyResponse {
  success: boolean;
  message: string;
  data: ICurrency;
}

export interface CurrencyStats {
  totalCurrencies: number;
}

export interface CurrencyStatsResponse {
  success: boolean;
  message: string;
  data: CurrencyStats;
}
