export interface Corridor {
  id: string;
  name: string;
  description: string;
  base_country_id: string;
  destination_country_id: string;
  base_currency_id: string;
  organisation_id: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string | null;
  base_country?: {
    id: string;
    name: string;
    code: string;
  };
  destination_country?: {
    id: string;
    name: string;
    code: string;
  };
  base_currency?: {
    id: string;
    currency_code: string;
    currency_name: string;
    currency_symbol: string;
  };
  organisation?: {
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
}

export interface CreateCorridorRequest {
  name: string;
  description: string;
  base_country_id: string;
  destination_country_id: string;
  base_currency_id: string;
  organisation_id: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
}

export interface UpdateCorridorRequest {
  name?: string;
  description?: string;
  base_country_id?: string;
  destination_country_id?: string;
  base_currency_id?: string;
  organisation_id?: string;
  status?: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
}

export interface CorridorFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  base_country_id?: string;
  destination_country_id?: string;
  base_currency_id?: string;
  organisation_id?: string;
  created_by?: string;
}

export interface CorridorListResponse {
  success: boolean;
  message: string;
  data: {
    corridors: Corridor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface CorridorResponse {
  success: boolean;
  message: string;
  data: Corridor;
}

export interface CorridorStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  blocked: number;
}

export interface CorridorStatsResponse {
  success: boolean;
  message: string;
  data: CorridorStats;
}
