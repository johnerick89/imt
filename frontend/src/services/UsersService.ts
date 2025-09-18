import apiClient from "./AxiosBase";
import type {
  UserFilters,
  UsersListResponse,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UserStatsResponse,
} from "../types/UsersTypes";

class UsersService {
  async getUsers(filters: UserFilters = {}): Promise<UsersListResponse> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiClient.get(`/api/v1/users?${params.toString()}`);
    return response.data;
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const response = await apiClient.get(`/api/v1/users/${userId}`);
    return response.data;
  }

  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    const response = await apiClient.post("/api/v1/users", userData);
    return response.data;
  }

  async updateUser(
    userId: string,
    userData: UpdateUserRequest
  ): Promise<UserResponse> {
    const response = await apiClient.put(`/api/v1/users/${userId}`, userData);
    return response.data;
  }

  async toggleUserStatus(
    userId: string,
    status: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED"
  ): Promise<UserResponse> {
    const response = await apiClient.patch(`/api/v1/users/${userId}/status`, {
      status,
    });
    return response.data;
  }

  async deleteUser(userId: string): Promise<UserResponse> {
    const response = await apiClient.delete(`/api/v1/users/${userId}`);
    return response.data;
  }

  async getUserStats(): Promise<UserStatsResponse> {
    const response = await apiClient.get("/api/v1/users/stats");
    return response.data;
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<UserResponse> {
    const response = await apiClient.patch(
      `/api/v1/users/${userId}/update-password`,
      {
        oldPassword,
        newPassword,
        confirmPassword,
      }
    );
    return response.data;
  }

  async resetPassword(
    userId: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<UserResponse> {
    const response = await apiClient.patch(
      `/api/v1/users/${userId}/reset-password`,
      { newPassword, confirmPassword }
    );
    return response.data;
  }
}

export default new UsersService();
