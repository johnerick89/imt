import { Country, Organisation, User } from "@prisma/client";
export interface IBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country_id: string;
  country: Country;
  zip_code?: string;
  phone: string;
  email: string;
  created_at: Date;
  created_by?: string | null;
  organisation_id: string;
  organisation: Organisation;
  updated_at: Date;
  created_by_user?: User | null;
  users_count?: number;
  customers_count?: number;
}

export interface CreateBranchRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  country_id: string;
  zip_code: string;
  phone: string;
  email: string;
  organisation_id: string;
}

export interface UpdateBranchRequest {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country_id?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
}

export interface BranchFilters {
  page?: number;
  limit?: number;
  search?: string;
  organisation_id?: string;
  city?: string;
  state?: string;
  country_id?: string;
  created_by?: string;
}

export interface BranchListResponse {
  success: boolean;
  message: string;
  data: {
    branches: IBranch[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface BranchResponse {
  success: boolean;
  message: string;
  data: IBranch;
  error?: string;
}

export interface BranchStats {
  totalBranches: number;
  branchesByCountry: { [key: string]: number };
  branchesByCity: { [key: string]: number };
  totalUsers: number;
  totalCustomers: number;
}

export interface BranchStatsResponse {
  success: boolean;
  message: string;
  data: BranchStats;
  error?: string;
}
