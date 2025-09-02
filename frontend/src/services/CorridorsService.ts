import apiClient from "./AxiosBase";
import type {
  CorridorListResponse,
  CorridorResponse,
  CorridorStatsResponse,
  CreateCorridorRequest,
  UpdateCorridorRequest,
  CorridorFilters,
} from "../types/CorridorsTypes";

class CorridorsService {
  async getCorridors(
    filters: CorridorFilters = {}
  ): Promise<CorridorListResponse> {
    try {
      const response = await apiClient.get("/api/v1/corridors", {
        params: filters,
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error fetching corridors:", axiosError);
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch corridors"
      );
    }
  }

  async getCorridorById(id: string): Promise<CorridorResponse> {
    try {
      const response = await apiClient.get(`/api/v1/corridors/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error fetching corridor:", axiosError);
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch corridor"
      );
    }
  }

  async createCorridor(data: CreateCorridorRequest): Promise<CorridorResponse> {
    try {
      const response = await apiClient.post("/api/v1/corridors", data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error creating corridor:", error);
      throw new Error(
        axiosError.response?.data?.message || "Failed to create corridor"
      );
    }
  }

  async updateCorridor(
    id: string,
    data: UpdateCorridorRequest
  ): Promise<CorridorResponse> {
    try {
      const response = await apiClient.put(`/api/v1/corridors/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error updating corridor:", error);
      throw new Error(
        axiosError.response?.data?.message || "Failed to update corridor"
      );
    }
  }

  async deleteCorridor(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/v1/corridors/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error deleting corridor:", error);
      throw new Error(
        axiosError.response?.data?.message || "Failed to delete corridor"
      );
    }
  }

  async getCorridorStats(): Promise<CorridorStatsResponse> {
    try {
      const response = await apiClient.get("/api/v1/corridors/stats");
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error fetching corridor stats:", axiosError);
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch corridor stats"
      );
    }
  }
}

export default new CorridorsService();
