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
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.created_by) params.append("created_by", filters.created_by);

    const queryString = params.toString();
    const url = `/api/v1/roles${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(url);
    return response.data;
  }

  async getRoleById(id: string): Promise<RoleResponse> {
    const response = await apiClient.get(`/api/v1/roles/${id}`);
    return response.data;
  }

  async createRole(data: CreateRoleRequest): Promise<RoleResponse> {
    const response = await apiClient.post("/api/v1/roles", data);
    return response.data;
  }

  async updateRole(id: string, data: UpdateRoleRequest): Promise<RoleResponse> {
    const response = await apiClient.put(`/api/v1/roles/${id}`, data);
    return response.data;
  }

  async deleteRole(
    id: string
  ): Promise<{ success: boolean; message: string; data: Role; error: string }> {
    const response = await apiClient.delete(`/api/v1/roles/${id}`);
    return response.data;
  }

  async getPermissions(
    filters: PermissionFilters = {}
  ): Promise<PermissionListResponse> {
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
  }

  async createRolePermission(
    data: CreateRolePermissionRequest
  ): Promise<{ success: boolean; message: string }> {
    const { role_id } = data;
    const response = await apiClient.post(
      `/api/v1/roles/${role_id}/permissions`,
      data
    );
    return response.data;
  }

  async deleteRolePermission(
    roleId: string,
    permissionId: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(
      `/api/v1/roles/permissions/${roleId}/${permissionId}`
    );
    return response.data;
  }

  async getRoleStats(): Promise<RoleStatsResponse> {
    const response = await apiClient.get("/api/v1/roles/stats");
    return response.data;
  }
}

export default new RolesService();
