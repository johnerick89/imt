import type { User } from "./UsersTypes";
import type { Currency } from "./CurrenciesTypes";
import type { Vault } from "./VaultsTypes";
import type { Organisation } from "./OrganisationsTypes";

export const TillStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
  BLOCKED: "BLOCKED",
} as const;
export type TillStatus = keyof typeof TillStatus;

export const UserTillStatus = {
  CLOSED: "CLOSED",
  OPEN: "OPEN",
  PENDING: "PENDING",
  BLOCKED: "BLOCKED",
} as const;
export type UserTillStatus = keyof typeof UserTillStatus;

export interface Till {
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

export interface UserTill {
  id: string;
  user_id: string;
  user: User;
  till_id: string;
  till: Till;
  opening_balance: number;
  closing_balance?: number;
  date: Date;
  status: UserTillStatus;
  created_at?: Date;
  updated_at?: Date;
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
  opening_balance?: number;
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

export interface CreateUserTillRequest {
  user_id: string;
  till_id: string;
  opening_balance?: number;
  closing_balance?: number;
  date?: string;
  status?: UserTillStatus;
}

export interface UpdateUserTillRequest {
  user_id?: string;
  till_id?: string;
  opening_balance?: number;
  closing_balance?: number;
  date?: string;
  status?: UserTillStatus;
}

export interface TillFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: TillStatus;
  vault_id?: string;
  currency_id?: string;
  organisation_id?: string;
}

export interface UserTillFilters {
  page?: number;
  limit?: number;
  search?: string;
  user_id?: string;
  till_id?: string;
  status?: UserTillStatus;
  organisation_id?: string;
}

export interface TillListResponse {
  success: boolean;
  message: string;
  data: {
    tills: Till[];
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
  data: Till;
  error?: string;
}

export interface UserTillListResponse {
  success: boolean;
  message: string;
  data: {
    userTills: UserTill[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface UserTillResponse {
  success: boolean;
  message: string;
  data: UserTill;
  error?: string;
}

export interface TillStats {
  totalTills: number;
  activeTills: number;
  inactiveTills: number;
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
