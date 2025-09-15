import apiClient from "./AxiosBase";
import type {
  IntegrationFilters,
  IntegrationListResponse,
  IntegrationResponse,
  IntegrationStatsResponse,
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  IntegrationStatsFilters,
} from "../types/IntegrationsTypes";

class IntegrationsService {
  async getIntegrations(
    filters: IntegrationFilters = {}
  ): Promise<IntegrationListResponse> {
    try {
      const response = await apiClient.get("/api/v1/integrations", {
        params: filters,
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error fetching integrations:", axiosError);
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch integrations"
      );
    }
  }

  async getIntegrationById(id: string): Promise<IntegrationResponse> {
    try {
      const response = await apiClient.get(`/api/v1/integrations/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error fetching integration:", axiosError);
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch integration"
      );
    }
  }

  async createIntegration(
    data: CreateIntegrationRequest
  ): Promise<IntegrationResponse> {
    try {
      const response = await apiClient.post("/api/v1/integrations", data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error creating integration:", error);
      throw new Error(
        axiosError.response?.data?.message || "Failed to create integration"
      );
    }
  }

  async updateIntegration(
    id: string,
    data: UpdateIntegrationRequest
  ): Promise<IntegrationResponse> {
    try {
      const response = await apiClient.put(`/api/v1/integrations/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error updating integration:", error);
      throw new Error(
        axiosError.response?.data?.message || "Failed to update integration"
      );
    }
  }

  async deleteIntegration(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/v1/integrations/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error deleting integration:", error);
      throw new Error(
        axiosError.response?.data?.message || "Failed to delete integration"
      );
    }
  }

  async getIntegrationStats(
    filters?: IntegrationStatsFilters
  ): Promise<IntegrationStatsResponse> {
    try {
      const response = await apiClient.get("/api/v1/integrations/stats", {
        params: filters,
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      console.error("Error fetching integration stats:", error);
      throw new Error(
        axiosError.response?.data?.message ||
          "Failed to fetch integration stats"
      );
    }
  }
}

export default new IntegrationsService();
