export interface Industry {
  id: string;
  name: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateIndustryRequest {
  name: string;
  description?: string;
}

export interface UpdateIndustryRequest {
  name?: string;
  description?: string;
}

export interface IndustryFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface IndustryListResponse {
  success: boolean;
  message: string;
  data: {
    industries: Industry[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface IndustryResponse {
  success: boolean;
  message: string;
  data: Industry;
  error?: string;
}

export interface IndustryStats {
  totalIndustries: number;
}

export interface IndustryStatsResponse {
  success: boolean;
  message: string;
  data: IndustryStats;
  error?: string;
}
