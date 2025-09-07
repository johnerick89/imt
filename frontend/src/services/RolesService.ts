import apiClient from "./AxiosBase";
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
  CreateRolePermissionRequest,
  RoleFilters,
  PermissionFilters,
  RoleListResponse,
  RoleResponse,
  PermissionListResponse,
  RoleStatsResponse,
} from "../types/RolesTypes";

class RolesService {
  async getRoles(filters: RoleFilters = {}): Promise<RoleListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.created_by) params.append("created_by", filters.created_by);

      const queryString = params.toString();
      const url = `/api/v1/roles${queryString ? `?${queryString}` : ""}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching roles:", error);
      throw error;
    }
  }

  async getRoleById(id: string): Promise<RoleResponse> {
    try {
      const response = await apiClient.get(`/api/v1/roles/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching role:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to fetch role",
        data: {} as unknown as Role,
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async createRole(data: CreateRoleRequest): Promise<RoleResponse> {
    try {
      const response = await apiClient.post("/api/v1/roles", data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating role:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to create role",
        data: {} as unknown as Role,
        error: axiosError.response?.data?.message || "CREATE_ERROR",
      };
    }
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<RoleResponse> {
    try {
      const response = await apiClient.put(`/api/v1/roles/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      console.error("Error updating role:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to update role",
        data: {} as unknown as Role,
        error: axiosError.response?.data?.message || "UPDATE_ERROR",
      };
    }
  }

  async deleteRole(
    id: string
  ): Promise<{ success: boolean; message: string; data: Role; error: string }> {
    try {
      const response = await apiClient.delete(`/api/v1/roles/${id}`);
      return response.data;
    } catch (error: unknown) {
      console.error("Error deleting role:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message: axiosError.response?.data?.message || "Failed to delete role",
        error: axiosError.response?.data?.message || "DELETE_ERROR",
        data: {} as unknown as Role,
      };
    }
  }

  async getPermissions(
    filters: PermissionFilters = {}
  ): Promise<PermissionListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);

      const queryString = params.toString();
      const url = `/api/v1/roles/permissions/list${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching permissions:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch permissions",
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async createRolePermission(
    data: CreateRolePermissionRequest
  ): Promise<{ success: boolean; message: string }> {
    try {
      const { role_id } = data;
      const response = await apiClient.post(
        `/api/v1/roles/${role_id}/permissions`,
        data
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error creating role permission:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to create role permission",
      };
    }
  }

  async deleteRolePermission(
    roleId: string,
    permissionId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(
        `/api/v1/roles/permissions/${roleId}/${permissionId}`
      );
      return response.data;
    } catch (error: unknown) {
      console.error("Error deleting role permission:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to delete role permission",
      };
    }
  }

  async getRoleStats(): Promise<RoleStatsResponse> {
    try {
      const response = await apiClient.get("/api/v1/roles/stats");
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching role statistics:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to fetch role statistics",
        data: {
          totalRoles: 0,
          rolesWithPermissions: 0,
          rolesWithoutPermissions: 0,
          totalPermissions: 0,
          mostUsedPermissions: {},
        },
      };
    }
  }
}

export default new RolesService();
