import type { Organisation } from "./OrganisationsTypes";
import type { Country } from "./CountriesTypes";
import type { Currency } from "./CurrenciesTypes";
import type { User } from "./UsersTypes";

export const CorridorStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
  BLOCKED: "BLOCKED",
} as const;
export type CorridorStatus =
  (typeof CorridorStatus)[keyof typeof CorridorStatus];

export interface Corridor {
  id: string;
  name: string;
  description: string;
  base_country_id: string;
  destination_country_id: string;
  base_currency_id: string;
  organisation_id: string;
  status: CorridorStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string | null;
  base_country?: Country;
  destination_country?: Country;
  base_currency?: Currency;
  organisation?: Organisation;
  created_by_user?: User;
  origin_organisation_id?: string;
  origin_organisation?: Organisation;
}

export interface CreateCorridorRequest {
  name: string;
  description: string;
  base_country_id: string;
  destination_country_id: string;
  base_currency_id: string;
  organisation_id: string;
  status: CorridorStatus;
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
  status?: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  base_country_id?: string;
  destination_country_id?: string;
  base_currency_id?: string;
  organisation_id?: string;
  created_by?: string;
  origin_organisation_id?: string;
}

export interface CorridorStatsFilters {
  origin_organisation_id?: string;
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
