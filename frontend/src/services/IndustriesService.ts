import apiClient from "./AxiosBase";
import type {
  IndustryFilters,
  IndustryListResponse,
  IndustryResponse,
} from "../types/IndustriesTypes";

export class IndustriesService {
  static async getIndustries(
    filters: IndustryFilters = {}
  ): Promise<IndustryListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);

    const response = await apiClient.get<IndustryListResponse>(
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
