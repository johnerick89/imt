import apiClient from "./AxiosBase";
import type {
  CorridorListResponse,
  CorridorResponse,
  CorridorStatsResponse,
  CreateCorridorRequest,
  UpdateCorridorRequest,
  CorridorFilters,
  CorridorStatsFilters,
} from "../types/CorridorsTypes";

class CorridorsService {
  async getCorridors(
    filters: CorridorFilters = {}
  ): Promise<CorridorListResponse> {
    const response = await apiClient.get("/api/v1/corridors", {
      params: filters,
    });
    return response.data;
  }

  async getCorridorById(id: string): Promise<CorridorResponse> {
    const response = await apiClient.get(`/api/v1/corridors/${id}`);
    return response.data;
  }

  async createCorridor(data: CreateCorridorRequest): Promise<CorridorResponse> {
    const response = await apiClient.post("/api/v1/corridors", data);
    return response.data;
  }

  async updateCorridor(
    id: string,
    data: UpdateCorridorRequest
  ): Promise<CorridorResponse> {
    const response = await apiClient.put(`/api/v1/corridors/${id}`, data);
    return response.data;
  }

  async deleteCorridor(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/v1/corridors/${id}`);
    return response.data;
  }

  async getCorridorStats(
    filters: CorridorStatsFilters
  ): Promise<CorridorStatsResponse> {
    const response = await apiClient.get("/api/v1/corridors/stats", {
      params: filters,
    });
    return response.data;
  }
}

export default new CorridorsService();
