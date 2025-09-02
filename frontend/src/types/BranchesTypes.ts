export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  phone: string;
  email: string;
  created_at: Date;
  organisation_id: string;
  organisation: {
    id: string;
    name: string;
    type: string;
  };
}

export interface CreateBranchRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
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
  country?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
}

export interface BranchFilters {
  page?: number;
  limit?: number;
  search?: string;
  organisation_id?: string;
}

export interface BranchListResponse {
  success: boolean;
  message: string;
  data: {
    branches: Branch[];
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
  data: Branch;
  error?: string;
}

export interface BranchStats {
  totalBranches: number;
}

export interface BranchStatsResponse {
  success: boolean;
  message: string;
  data: BranchStats;
  error?: string;
}
