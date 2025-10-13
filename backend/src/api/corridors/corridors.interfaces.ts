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
  base_country_id?: string | null;
  base_country?: Country | null;
  origin_country_id?: string | null;
  origin_country?: Country | null;
  destination_country_id?: string | null;
  destination_country?: Country | null;
  origin_currency_id?: string | null;
  origin_currency?: Currency | null;
  destination_currency_id?: string | null;
  destination_currency?: Currency | null;
  base_currency_id?: string | null;
  base_currency?: Currency | null;
  organisation_id?: string | null;
  organisation?: Organisation | null; // Maps to destination_organisation_id
  destination_organisation_id?: string | null;
  created_at: Date;
  created_by?: string | null;
  updated_at: Date;
  status: CorridorStatus;
  created_by_user?: User | null;
  origin_organisation_id?: string | null;
  origin_organisation?: Organisation | null;
}

export interface CreateCorridorRequest {
  name: string;
  description: string;
  base_country_id?: string;
  origin_country_id?: string;
  destination_country_id?: string;
  origin_currency_id?: string;
  destination_currency_id?: string;
  base_currency_id?: string;
  organisation_id?: string;
  status?: CorridorStatus;
  origin_organisation_id?: string;
  destination_organisation_id?: string;
}

export interface UpdateCorridorRequest {
  name?: string;
  description?: string;
  base_country_id?: string;
  origin_country_id?: string;
  destination_country_id?: string;
  origin_currency_id?: string;
  destination_currency_id?: string;
  base_currency_id?: string;
  organisation_id?: string;
  status?: CorridorStatus;
  origin_organisation_id?: string;
  destination_organisation_id?: string;
}

export interface CorridorFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: CorridorStatus;
  country_id?: string | null;
  currency_id?: string | null;
  organisation_id?: string | null;
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
