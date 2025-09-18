import apiClient from "./AxiosBase";
import type {
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
  }

  async getUserTillById(id: string): Promise<UserTillResponse> {
    const response = await apiClient.get(`/api/v1/usertills/${id}`);
    return response.data;
  }

  async createUserTill(data: CreateUserTillRequest): Promise<UserTillResponse> {
    const response = await apiClient.post("/api/v1/usertills", data);
    return response.data;
  }

  async updateUserTill(
    id: string,
    data: UpdateUserTillRequest
  ): Promise<UserTillResponse> {
    const response = await apiClient.put(`/api/v1/usertills/${id}`, data);
    return response.data;
  }

  async deleteUserTill(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.delete(`/api/v1/usertills/${id}`);
    return response.data;
  }

  async closeUserTill(id: string): Promise<UserTillResponse> {
    const response = await apiClient.post(`/api/v1/usertills/${id}/close`);
    return response.data;
  }

  async blockUserTill(id: string): Promise<UserTillResponse> {
    const response = await apiClient.post(`/api/v1/usertills/${id}/block`);
    return response.data;
  }
}

export default new UserTillsService();
