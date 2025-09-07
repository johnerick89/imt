import {
  TillStatus,
  User,
  Vault,
  Currency,
  Organisation,
} from "@prisma/client";

export interface ITill {
  id: string;
  name: string;
  description: string;
  status: TillStatus;
  current_teller_user_id?: string | null;
  current_teller_user?: User | null;
  location?: string | null;
  vault_id?: string | null;
  vault?: Vault | null;
  currency_id?: string | null;
  currency?: Currency | null;
  organisation_id?: string | null;
  organisation?: Organisation | null;
  opened_at?: Date | null;
  closed_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTillRequest {
  name: string;
  description: string;
  status?: TillStatus;
  current_teller_user_id?: string;
  location?: string;
  vault_id?: string;
  currency_id?: string;
  organisation_id?: string;
  opened_at?: string;
  closed_at?: string;
}

export interface UpdateTillRequest {
  name?: string;
  description?: string;
  status?: TillStatus;
  current_teller_user_id?: string;
  location?: string;
  vault_id?: string;
  currency_id?: string;
  organisation_id?: string;
  opened_at?: string;
  closed_at?: string;
}

export interface TillFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: TillStatus;
  current_teller_user_id?: string;
  vault_id?: string;
  currency_id?: string;
  organisation_id?: string;
}

export interface TillListResponse {
  success: boolean;
  message: string;
  data: {
    tills: ITill[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface TillResponse {
  success: boolean;
  message: string;
  data: ITill;
  error?: string;
}

export interface TillStats {
  totalTills: number;
  activeTills: number;
  inactiveTills: number;
  pendingTills: number;
  blockedTills: number;
  tillsByStatus: { [key: string]: number };
  tillsByVault: { [key: string]: number };
}

export interface TillStatsResponse {
  success: boolean;
  message: string;
  data: TillStats;
  error?: string;
}
