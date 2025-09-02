import apiClient from "./AxiosBase";
import type {
  UserActivityFilters,
  UserActivityListResponse,
  UserActivityResponse,
  UserActivityStatsResponse,
} from "../types/UserActivityTypes";

class UserActivityService {
  private getAuthHeaders() {
    const token = sessionStorage.getItem("token");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async getUserActivities(
    filters: UserActivityFilters = {}
  ): Promise<UserActivityListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.userId) params.append("userId", filters.userId);
      if (filters.entityType) params.append("entityType", filters.entityType);
      if (filters.entityId) params.append("entityId", filters.entityId);
      if (filters.action) params.append("action", filters.action);
      if (filters.organisationId)
        params.append("organisationId", filters.organisationId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await apiClient.get(`/api/v1/audit?${params}`, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to fetch user activities",
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async getUserActivityById(id: string): Promise<UserActivityResponse> {
    try {
      const response = await apiClient.get(`/api/v1/audit/${id}`, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch user activity",
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async getUserAuditHistory(
    userId: string,
    filters: UserActivityFilters = {}
  ): Promise<UserActivityListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.entityType) params.append("entityType", filters.entityType);
      if (filters.action) params.append("action", filters.action);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await apiClient.get(
        `/api/v1/audit/user/${userId}?${params}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to fetch user audit history",
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async getEntityAuditHistory(
    entityType: string,
    entityId: string
  ): Promise<UserActivityListResponse> {
    try {
      const response = await apiClient.get(
        `/api/v1/audit/entity/${entityType}/${entityId}`,
        {
          headers: this.getAuthHeaders(),
        }
      );

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to fetch entity audit history",
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async getAuditStats(): Promise<UserActivityStatsResponse> {
    try {
      const response = await apiClient.get(`/api/v1/audit/stats`, {
        headers: this.getAuthHeaders(),
      });

      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch audit stats",
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }
}

export default new UserActivityService();
