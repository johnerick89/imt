import apiClient from "./AxiosBase";
import type { IndustryFilters } from "../types/IndustriesTypes";

export interface Industry {
  id: string;
  name: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface IndustriesListResponse {
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

export class IndustriesService {
  static async getIndustries(
    filters: IndustryFilters = {}
  ): Promise<IndustriesListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);

    const response = await apiClient.get<IndustriesListResponse>(
      `/api/v1/industries?${params.toString()}`
    );
    return response.data;
  }

  static async getIndustryById(id: string): Promise<IndustryResponse> {
    const response = await apiClient.get<IndustryResponse>(
      `/api/v1/industries/${id}`
    );
    return response.data;
  }
}
