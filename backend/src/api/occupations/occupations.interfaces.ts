export interface IOccupation {
  id: string;
  name: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateOccupationRequest {
  name: string;
  description?: string;
}

export interface UpdateOccupationRequest {
  name?: string;
  description?: string;
}

export interface OccupationFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface OccupationListResponse {
  success: boolean;
  message: string;
  data: {
    occupations: IOccupation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface OccupationResponse {
  success: boolean;
  message: string;
  data: IOccupation;
  error?: string;
}

export interface OccupationStats {
  totalOccupations: number;
}

export interface OccupationStatsResponse {
  success: boolean;
  message: string;
  data: OccupationStats;
  error?: string;
}
