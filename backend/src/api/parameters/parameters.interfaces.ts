export interface IParameter {
  id: string;
  name: string;
  value: string;
  value_2?: string;
  created_at: string;
  updated_at: string;
}

export interface ParameterFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface ParameterListResponse {
  success: boolean;
  message: string;
  data: {
    parameters: IParameter[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ParameterResponse {
  success: boolean;
  message: string;
  data: IParameter;
}

export interface CreateParameterRequest {
  name: string;
  value: string;
  value_2?: string;
}

export interface UpdateParameterRequest {
  name?: string;
  value?: string;
  value_2?: string;
}

export interface ParameterStats {
  totalParameters: number;
  byCategory: Array<{
    category: string;
    count: number;
  }>;
}

export interface ParameterStatsResponse {
  success: boolean;
  message: string;
  data: ParameterStats;
}
