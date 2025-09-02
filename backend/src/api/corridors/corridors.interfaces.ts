export interface ICorridor {
  id: string;
  name: string;
  description: string;
  base_country_id: string;
  base_country: {
    id: string;
    name: string;
    code: string;
  };
  destination_country_id: string;
  destination_country: {
    id: string;
    name: string;
    code: string;
  };
  base_currency_id: string;
  base_currency: {
    id: string;
    currency_name: string;
    currency_code: string;
    currency_symbol: string;
  };
  organisation_id: string;
  organisation: {
    id: string;
    name: string;
    type: string;
  };
  created_at: Date;
  created_by?: string | null;
  updated_at: Date;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

export interface CreateCorridorRequest {
  name: string;
  description: string;
  base_country_id: string;
  destination_country_id: string;
  base_currency_id: string;
  organisation_id: string;
  status?: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
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
    corridors: ICorridor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface CorridorResponse {
  success: boolean;
  message: string;
  data: ICorridor;
  error?: string;
}

export interface CorridorStats {
  totalCorridors: number;
  activeCorridors: number;
  inactiveCorridors: number;
  pendingCorridors: number;
  blockedCorridors: number;
}

export interface CorridorStatsResponse {
  success: boolean;
  message: string;
  data: CorridorStats;
  error?: string;
}
