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
    const response = await apiClient.get("/api/v1/integrations", {
      params: filters,
    });
    return response.data;
  }

  async getIntegrationById(id: string): Promise<IntegrationResponse> {
    const response = await apiClient.get(`/api/v1/integrations/${id}`);
    return response.data;
  }

  async createIntegration(
    data: CreateIntegrationRequest
  ): Promise<IntegrationResponse> {
    const response = await apiClient.post("/api/v1/integrations", data);
    return response.data;
  }

  async updateIntegration(
    id: string,
    data: UpdateIntegrationRequest
  ): Promise<IntegrationResponse> {
    const response = await apiClient.put(`/api/v1/integrations/${id}`, data);
    return response.data;
  }

  async deleteIntegration(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/v1/integrations/${id}`);
    return response.data;
  }

  async getIntegrationStats(
    filters: IntegrationStatsFilters
  ): Promise<IntegrationStatsResponse> {
    const response = await apiClient.get("/api/v1/integrations/stats", {
      params: filters,
    });
    return response.data;
  }
}

export default new IntegrationsService();
