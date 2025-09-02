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
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await apiClient.get(
        `/api/v1/users?${params.toString()}`
      );
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch users"
      );
    }
  }

  async getUserById(userId: string): Promise<UserResponse> {
    try {
      const response = await apiClient.get(`/api/v1/users/${userId}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch user"
      );
    }
  }

  async createUser(userData: CreateUserRequest): Promise<UserResponse> {
    try {
      const response = await apiClient.post("/api/v1/users", userData);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(
        axiosError.response?.data?.message || "Failed to create user"
      );
    }
  }

  async updateUser(
    userId: string,
    userData: UpdateUserRequest
  ): Promise<UserResponse> {
    try {
      const response = await apiClient.put(`/api/v1/users/${userId}`, userData);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(
        axiosError.response?.data?.message || "Failed to update user"
      );
    }
  }

  async toggleUserStatus(
    userId: string,
    status: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED"
  ): Promise<UserResponse> {
    try {
      const response = await apiClient.patch(`/api/v1/users/${userId}/status`, {
        status,
      });
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(
        axiosError.response?.data?.message || "Failed to update user status"
      );
    }
  }

  async deleteUser(userId: string): Promise<UserResponse> {
    try {
      const response = await apiClient.delete(`/api/v1/users/${userId}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(
        axiosError.response?.data?.message || "Failed to delete user"
      );
    }
  }

  async getUserStats(): Promise<UserStatsResponse> {
    try {
      const response = await apiClient.get("/api/v1/users/stats");
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch user stats"
      );
    }
  }
}

export default new UsersService();
