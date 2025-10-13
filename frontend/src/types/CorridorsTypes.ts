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
  origin_country_id: string;
  destination_country_id: string;
  base_currency_id: string;
  organisation_id: string;
  status: CorridorStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by?: string | null;
  origin_country?: Country;
  destination_country?: Country;
  base_currency?: Currency;
  organisation?: Organisation;
  created_by_user?: User;
  origin_organisation_id?: string;
  origin_organisation?: Organisation;
  destination_organisation?: Organisation;
  origin_currency?: Currency;
  destination_currency?: Currency;
  origin_currency_id?: string;
  destination_currency_id?: string;
}

export interface CreateCorridorRequest {
  name: string;
  description: string;
  origin_country_id: string;
  destination_country_id: string;
  origin_currency_id: string;
  destination_currency_id: string;
  base_currency_id: string;
  organisation_id: string;
  status: CorridorStatus;
  origin_organisation_id?: string;
  destination_organisation_id?: string;
}

export interface UpdateCorridorRequest {
  name?: string;
  description?: string;
  origin_country_id?: string;
  destination_country_id?: string;
  base_currency_id?: string;
  origin_currency_id?: string;
  destination_currency_id?: string;
  organisation_id?: string;
  status?: CorridorStatus;
  origin_organisation_id?: string;
  destination_organisation_id?: string;
}

export interface CorridorFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  country_id?: string;
  currency_id?: string;
  organisation_id?: string;
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
}
