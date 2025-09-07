import type { Currency } from "./CurrenciesTypes";
import type { Organisation } from "./OrganisationsTypes";

export interface Vault {
  id: string;
  name: string;
  organisation_id: string;
  organisation: Organisation | null;
  currency_id?: string | null;
  currency?: Currency | null;

  created_at: Date;
  updated_at: Date;
}

export interface CreateVaultRequest {
  name: string;
  organisation_id: string;
  currency_id?: string;
}

export interface UpdateVaultRequest {
  name?: string;
  organisation_id?: string;
  currency_id?: string;
}

export interface VaultFilters {
  page?: number;
  limit?: number;
  search?: string;
  organisation_id?: string;
  currency_id?: string;
}

export interface VaultListResponse {
  success: boolean;
  message: string;
  data: {
    vaults: Vault[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface VaultResponse {
  success: boolean;
  message: string;
  data: Vault;
  error?: string;
}

export interface VaultStats {
  totalVaults: number;
  vaultsByOrganisation: { [key: string]: number };
  vaultsByCurrency: { [key: string]: number };
  recentVaults: number;
}

export interface VaultStatsResponse {
  success: boolean;
  message: string;
  data: VaultStats;
  error?: string;
}
