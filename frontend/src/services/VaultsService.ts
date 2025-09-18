import apiClient from "./AxiosBase";
import type {
  Vault,
  CreateVaultRequest,
  UpdateVaultRequest,
  VaultFilters,
  VaultListResponse,
  VaultResponse,
  VaultStatsResponse,
} from "../types/VaultsTypes";

class VaultsService {
  async getVaults(filters: VaultFilters = {}): Promise<VaultListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.organisation_id)
      params.append("organisation_id", filters.organisation_id);
    if (filters.currency_id) params.append("currency_id", filters.currency_id);

    const queryString = params.toString();
    const url = `/api/v1/vaults${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(url);
    return response.data;
  }

  async getVaultById(id: string): Promise<VaultResponse> {
    const response = await apiClient.get(`/api/v1/vaults/${id}`);
    return response.data;
  }

  async createVault(data: CreateVaultRequest): Promise<VaultResponse> {
    const response = await apiClient.post("/api/v1/vaults", data);
    return response.data;
  }

  async updateVault(
    id: string,
    data: UpdateVaultRequest
  ): Promise<VaultResponse> {
    const response = await apiClient.put(`/api/v1/vaults/${id}`, data);
    return response.data;
  }

  async deleteVault(id: string): Promise<{
    success: boolean;
    message: string;
    data: Vault;
    error: string;
  }> {
    const response = await apiClient.delete(`/api/v1/vaults/${id}`);
    return response.data;
  }

  async getVaultStats(filters: VaultFilters = {}): Promise<VaultStatsResponse> {
    const params = new URLSearchParams();

    if (filters.organisation_id)
      params.append("organisation_id", filters.organisation_id);

    const queryString = params.toString();
    const url = `/api/v1/vaults/stats${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(url);
    return response.data;
  }
}

export default new VaultsService();
