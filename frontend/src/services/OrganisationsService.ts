import apiClient from "./AxiosBase";
import type {
  CreateOrganisationRequest,
  UpdateOrganisationRequest,
  OrganisationFilters,
  OrganisationsListResponse,
  OrganisationResponse,
  OrganisationStatsResponse,
} from "../types/OrganisationsTypes";

class OrganisationsService {
  async getOrganisations(
    filters: OrganisationFilters = {}
  ): Promise<OrganisationsListResponse> {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.type) params.append("type", filters.type);
    if (filters.status) params.append("status", filters.status);
    if (filters.integration_mode)
      params.append("integration_mode", filters.integration_mode);
    if (filters.country_id) params.append("country_id", filters.country_id);
    if (filters.base_currency_id)
      params.append("base_currency_id", filters.base_currency_id);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await apiClient.get(`/api/v1/organisations?${params}`);
    return response.data;
  }

  async getOrganisationById(id: string): Promise<OrganisationResponse> {
    const response = await apiClient.get(`/api/v1/organisations/${id}`);
    return response.data;
  }

  async createOrganisation(
    data: CreateOrganisationRequest
  ): Promise<OrganisationResponse> {
    const response = await apiClient.post("/api/v1/organisations", data);
    return response.data;
  }

  async updateOrganisation(
    id: string,
    data: UpdateOrganisationRequest
  ): Promise<OrganisationResponse> {
    const response = await apiClient.put(`/api/v1/organisations/${id}`, data);
    return response.data;
  }

  async deleteOrganisation(id: string): Promise<OrganisationResponse> {
    const response = await apiClient.delete(`/api/v1/organisations/${id}`);
    return response.data;
  }

  async toggleOrganisationStatus(
    id: string,
    status: string
  ): Promise<OrganisationResponse> {
    const response = await apiClient.patch(
      `/api/v1/organisations/${id}/status`,
      { status }
    );
    return response.data;
  }

  async getOrganisationStats(): Promise<OrganisationStatsResponse> {
    const response = await apiClient.get("/api/v1/organisations/stats");
    return response.data;
  }

  async getAllOrganisations(): Promise<OrganisationsListResponse> {
    const response = await apiClient.get("/api/v1/organisations/all");
    return response.data;
  }
}

export default new OrganisationsService();
