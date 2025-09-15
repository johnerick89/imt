import type {
  Organisation,
  Country,
  Currency,
  User,
  CorridorStatus,
} from "@prisma/client";

export interface ICorridor {
  id: string;
  name: string;
  description: string;
  base_country_id: string;
  base_country: Country;
  destination_country_id: string;
  destination_country: Country;
  base_currency_id: string;
  base_currency: Currency;
  organisation_id: string;
  organisation: Organisation;
  created_at: Date;
  created_by?: string | null;
  updated_at: Date;
  status: CorridorStatus;
  created_by_user?: User;
  origin_organisation_id?: string | null;
  origin_organisation?: Organisation;
}

export interface CreateCorridorRequest {
  name: string;
  description: string;
  base_country_id: string;
  destination_country_id: string;
  base_currency_id: string;
  organisation_id: string;
  status?: CorridorStatus;
  origin_organisation_id?: string;
}

export interface UpdateCorridorRequest {
  name?: string;
  description?: string;
  base_country_id?: string;
  destination_country_id?: string;
  base_currency_id?: string;
  organisation_id?: string;
  status?: CorridorStatus;
  origin_organisation_id?: string;
}

export interface CorridorFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: CorridorStatus;
  base_country_id?: string | null;
  destination_country_id?: string | null;
  base_currency_id?: string | null;
  organisation_id?: string | null;
  origin_organisation_id?: string | null;
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

export interface CorridorStatsFilters {
  origin_organisation_id?: string | null;
}
