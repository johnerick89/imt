import apiClient from "./AxiosBase";
import type {
  UserActivityFilters,
  UserActivityListResponse,
  UserActivityResponse,
  UserActivityStatsResponse,
} from "../types/UserActivityTypes";

class UserActivityService {
  async getUserActivities(
    filters: UserActivityFilters = {}
  ): Promise<UserActivityListResponse> {
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

    const response = await apiClient.get(`/api/v1/audit?${params}`);
    return response.data;
  }

  async getUserActivityById(id: string): Promise<UserActivityResponse> {
    const response = await apiClient.get(`/api/v1/audit/${id}`);
    return response.data;
  }

  async getUserActivityStats(): Promise<UserActivityStatsResponse> {
    const response = await apiClient.get("/api/v1/audit/stats");
    return response.data;
  }

  async getUserAuditHistory(
    userId: string,
    filters: UserActivityFilters = {}
  ): Promise<UserActivityListResponse> {
    const params = new URLSearchParams();

    if (filters.entityType) params.append("entityType", filters.entityType);
    if (filters.action) params.append("action", filters.action);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await apiClient.get(
      `/api/v1/audit/user/${userId}?${params}`
    );

    return response.data;
  }

  async getEntityAuditHistory(
    entityType: string,
    entityId: string
  ): Promise<UserActivityListResponse> {
    const response = await apiClient.get(
      `/api/v1/audit/entity/${entityType}/${entityId}`
    );

    return response.data;
  }

  async getAuditStats(): Promise<UserActivityStatsResponse> {
    const response = await apiClient.get(`/api/v1/audit/stats`);

    return response.data;
  }
}

export default new UserActivityService();
