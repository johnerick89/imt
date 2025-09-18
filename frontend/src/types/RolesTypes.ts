import type { User } from "./UsersTypes";
export interface Role {
  id: string;
  name: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
  created_by?: string | null;
  created_by_user?: User | null;
  permissions?: Permission[];
  role_permissions?: RolePermissions[];
  users?: User[];
}

export interface Permission {
  id: string;
  name: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
  created_by?: string | null;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permission_ids?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permission_ids?: string[];
}

export interface CreateRolePermissionRequest {
  role_id: string;
  permission_id: string;
}

export interface RoleFilters {
  page?: number;
  limit?: number;
  search?: string;
  created_by?: string;
}

export interface PermissionFilters {
  page?: number;
  limit?: number;
  search?: string;
}

export interface RoleListResponse {
  success: boolean;
  message: string;
  data: {
    roles: Role[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface RoleResponse {
  success: boolean;
  message: string;
  data: Role;
  error?: string;
}

export interface PermissionListResponse {
  success: boolean;
  message: string;
  data?: {
    permissions: Permission[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface RoleStats {
  totalRoles: number;
  rolesWithPermissions: number;
  rolesWithoutPermissions: number;
  totalPermissions: number;
  mostUsedPermissions: { [key: string]: number };
}

export interface RoleStatsResponse {
  success: boolean;
  message: string;
  data: RoleStats;
  error?: string;
}

export interface RolePermissions {
  id: string;
  permission: Permission;
  permission_id: string;
  role_id: string;
  created_at: Date;
  updated_at: Date;
}
