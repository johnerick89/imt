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
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.organisation_id)
        params.append("organisation_id", filters.organisation_id);
      if (filters.currency_id)
        params.append("currency_id", filters.currency_id);

      const queryString = params.toString();
      const url = `/api/v1/vaults${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching vaults:", error);
      throw error;
    }
  }

  async getVaultById(id: string): Promise<VaultResponse> {
    try {
      const response = await apiClient.get(`/api/v1/vaults/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching vault:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to fetch vault",
        data: {} as unknown as Vault,
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async createVault(data: CreateVaultRequest): Promise<VaultResponse> {
    try {
      const response = await apiClient.post("/api/v1/vaults", data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating vault:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to create vault",
        data: {} as unknown as Vault,
        error: axiosError.response?.data?.message || "CREATE_ERROR",
      };
    }
  }

  async updateVault(
    id: string,
    data: UpdateVaultRequest
  ): Promise<VaultResponse> {
    try {
      const response = await apiClient.put(`/api/v1/vaults/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating vault:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to update vault",
        data: {} as unknown as Vault,
        error: axiosError.response?.data?.message || "UPDATE_ERROR",
      };
    }
  }

  async deleteVault(id: string): Promise<{
    success: boolean;
    message: string;
    data: Vault;
    error: string;
  }> {
    try {
      const response = await apiClient.delete(`/api/v1/vaults/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error deleting vault:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to delete vault",
        error: axiosError.response?.data?.message || "DELETE_ERROR",
        data: {} as unknown as Vault,
      };
    }
  }

  async getVaultStats(filters: VaultFilters = {}): Promise<VaultStatsResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.organisation_id)
        params.append("organisation_id", filters.organisation_id);

      const queryString = params.toString();
      const url = `/api/v1/vaults/stats${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching vault statistics:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to fetch vault statistics",
        data: {
          totalVaults: 0,
          vaultsByOrganisation: {},
          vaultsByCurrency: {},
          recentVaults: 0,
        },
      };
    }
  }
}

export default new VaultsService();
