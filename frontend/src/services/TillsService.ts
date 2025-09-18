import apiClient from "./AxiosBase";
import type {
  Till,
  CreateTillRequest,
  UpdateTillRequest,
  TillFilters,
  TillListResponse,
  TillResponse,
  TillStatsResponse,
} from "../types/TillsTypes";

class TillsService {
  async getTills(filters: TillFilters = {}): Promise<TillListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.vault_id) params.append("vault_id", filters.vault_id);
    if (filters.currency_id) params.append("currency_id", filters.currency_id);

    const queryString = params.toString();
    const url = `/api/v1/tills${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(url);
    return response.data;
  }

  async getTillById(id: string): Promise<TillResponse> {
    const response = await apiClient.get(`/api/v1/tills/${id}`);
    return response.data;
  }

  async createTill(data: CreateTillRequest): Promise<TillResponse> {
    const response = await apiClient.post("/api/v1/tills", data);
    return response.data;
  }

  async updateTill(id: string, data: UpdateTillRequest): Promise<TillResponse> {
    const response = await apiClient.put(`/api/v1/tills/${id}`, data);
    return response.data;
  }

  async deleteTill(id: string): Promise<{
    success: boolean;
    message: string;
    data: Till;
    error: string;
  }> {
    const response = await apiClient.delete(`/api/v1/tills/${id}`);
    return response.data;
  }

  async getTillStats(filters: TillFilters = {}): Promise<TillStatsResponse> {
    const params = new URLSearchParams();

    if (filters.organisation_id)
      params.append("organisation_id", filters.organisation_id);

    const queryString = params.toString();
    const url = `/api/v1/tills/stats${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(url);
    return response.data;
  }

  // Till Operations
  async openTill(id: string): Promise<TillResponse> {
    const response = await apiClient.post(`/api/v1/tills/${id}/open`);
    return response.data;
  }

  async closeTill(id: string): Promise<TillResponse> {
    const response = await apiClient.post(`/api/v1/tills/${id}/close`);
    return response.data;
  }

  async blockTill(id: string): Promise<TillResponse> {
    const response = await apiClient.post(`/api/v1/tills/${id}/block`);
    return response.data;
  }

  async deactivateTill(id: string): Promise<TillResponse> {
    const response = await apiClient.post(`/api/v1/tills/${id}/deactivate`);
    return response.data;
  }
}

export default new TillsService();
