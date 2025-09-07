import apiClient from "./AxiosBase";
import type {
  UserTill,
  CreateUserTillRequest,
  UpdateUserTillRequest,
  UserTillFilters,
  UserTillListResponse,
  UserTillResponse,
} from "../types/TillsTypes";

class UserTillsService {
  async getUserTills(
    filters: UserTillFilters = {}
  ): Promise<UserTillListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.user_id) params.append("user_id", filters.user_id);
      if (filters.till_id) params.append("till_id", filters.till_id);
      if (filters.status) params.append("status", filters.status);

      const queryString = params.toString();
      const url = `/api/v1/usertills${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching user tills:", error);
      throw error;
    }
  }

  async getUserTillById(id: string): Promise<UserTillResponse> {
    try {
      const response = await apiClient.get(`/api/v1/usertills/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching user till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch user till",
        data: {} as unknown as UserTill,
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async createUserTill(data: CreateUserTillRequest): Promise<UserTillResponse> {
    try {
      const response = await apiClient.post("/api/v1/usertills", data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating user till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to create user till",
        data: {} as unknown as UserTill,
        error: axiosError.response?.data?.message || "CREATE_ERROR",
      };
    }
  }

  async updateUserTill(
    id: string,
    data: UpdateUserTillRequest
  ): Promise<UserTillResponse> {
    try {
      const response = await apiClient.put(`/api/v1/usertills/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating user till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to update user till",
        data: {} as unknown as UserTill,
        error: axiosError.response?.data?.message || "UPDATE_ERROR",
      };
    }
  }

  async deleteUserTill(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await apiClient.delete(`/api/v1/usertills/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error deleting user till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to delete user till",
      };
    }
  }

  async closeUserTill(id: string): Promise<UserTillResponse> {
    try {
      const response = await apiClient.post(`/api/v1/usertills/${id}/close`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error closing user till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to close user till",
        data: {} as unknown as UserTill,
        error: axiosError.response?.data?.message || "CLOSE_ERROR",
      };
    }
  }

  async blockUserTill(id: string): Promise<UserTillResponse> {
    try {
      const response = await apiClient.post(`/api/v1/usertills/${id}/block`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error blocking user till:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to block user till",
        data: {} as unknown as UserTill,
        error: axiosError.response?.data?.message || "BLOCK_ERROR",
      };
    }
  }
}

export default new UserTillsService();
