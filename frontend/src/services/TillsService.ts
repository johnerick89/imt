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
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.status) params.append("status", filters.status);
      if (filters.vault_id) params.append("vault_id", filters.vault_id);
      if (filters.currency_id)
        params.append("currency_id", filters.currency_id);

      const queryString = params.toString();
      const url = `/api/v1/tills${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching tills:", error);
      throw error;
    }
  }

  async getTillById(id: string): Promise<TillResponse> {
    try {
      const response = await apiClient.get(`/api/v1/tills/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to fetch till",
        data: {} as unknown as Till,
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async createTill(data: CreateTillRequest): Promise<TillResponse> {
    try {
      const response = await apiClient.post("/api/v1/tills", data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to create till",
        data: {} as unknown as Till,
        error: axiosError.response?.data?.message || "CREATE_ERROR",
      };
    }
  }

  async updateTill(id: string, data: UpdateTillRequest): Promise<TillResponse> {
    try {
      const response = await apiClient.put(`/api/v1/tills/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to update till",
        data: {} as unknown as Till,
        error: axiosError.response?.data?.message || "UPDATE_ERROR",
      };
    }
  }

  async deleteTill(id: string): Promise<{
    success: boolean;
    message: string;
    data: Till;
    error: string;
  }> {
    try {
      const response = await apiClient.delete(`/api/v1/tills/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error deleting till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to delete till",
        error: axiosError.response?.data?.message || "DELETE_ERROR",
        data: {} as unknown as Till,
      };
    }
  }

  async getTillStats(filters: TillFilters = {}): Promise<TillStatsResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.organisation_id)
        params.append("organisation_id", filters.organisation_id);

      const queryString = params.toString();
      const url = `/api/v1/tills/stats${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching till statistics:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to fetch till statistics",
        data: {
          totalTills: 0,
          activeTills: 0,
          inactiveTills: 0,
          blockedTills: 0,
          tillsByStatus: {},
          tillsByVault: {},
        },
      };
    }
  }

  // Till Operations
  async openTill(id: string): Promise<TillResponse> {
    try {
      const response = await apiClient.post(`/api/v1/tills/${id}/open`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error opening till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to open till",
        data: {} as unknown as Till,
        error: axiosError.response?.data?.message || "OPEN_ERROR",
      };
    }
  }

  async closeTill(id: string): Promise<TillResponse> {
    try {
      const response = await apiClient.post(`/api/v1/tills/${id}/close`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error closing till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to close till",
        data: {} as unknown as Till,
        error: axiosError.response?.data?.message || "CLOSE_ERROR",
      };
    }
  }

  async blockTill(id: string): Promise<TillResponse> {
    try {
      const response = await apiClient.post(`/api/v1/tills/${id}/block`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error blocking till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to block till",
        data: {} as unknown as Till,
        error: axiosError.response?.data?.message || "BLOCK_ERROR",
      };
    }
  }

  async deactivateTill(id: string): Promise<TillResponse> {
    try {
      const response = await apiClient.post(`/api/v1/tills/${id}/deactivate`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error deactivating till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to deactivate till",
        data: {} as unknown as Till,
        error: axiosError.response?.data?.message || "DEACTIVATE_ERROR",
      };
    }
  }
}

export default new TillsService();
