import apiClient from "./AxiosBase";
import type { OccupationFilters } from "../types/OccupationsTypes";

export interface Occupation {
  id: string;
  name: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface OccupationsListResponse {
  success: boolean;
  message: string;
  data: {
    occupations: Occupation[];
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
  data: Occupation;
  error?: string;
}

export class OccupationsService {
  static async getOccupations(
    filters: OccupationFilters = {}
  ): Promise<OccupationsListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);

    const response = await apiClient.get<OccupationsListResponse>(
      `/api/v1/occupations?${params.toString()}`
    );
    return response.data;
  }

  static async getOccupationById(id: string): Promise<OccupationResponse> {
    const response = await apiClient.get<OccupationResponse>(
      `/api/v1/occupations/${id}`
    );
    return response.data;
  }
}
