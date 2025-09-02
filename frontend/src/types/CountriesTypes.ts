export interface Country {
  id: string;
  name: string;
  code: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CountryFilters {
  search?: string;
  code?: string;
  page?: number;
  limit?: number;
}

export interface CountryListResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: {
    countries: Country[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CountryResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: Country;
}

export interface CountryStats {
  totalCountries: number;
}

export interface CountryStatsResponse {
  success: boolean;
  message: string;
  error?: string;
  data?: CountryStats;
}

export interface CreateCountryRequest {
  name: string;
  code: string;
}

export interface UpdateCountryRequest {
  name?: string;
  code?: string;
}

export interface AllCountriesResponse {
  success: boolean;
  message: string;
  data: Country[];
  error?: string;
}
