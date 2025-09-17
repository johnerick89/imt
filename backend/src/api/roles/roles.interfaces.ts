import { Permission, RolePermission, User, Role } from "@prisma/client";
export interface IRole {
  id: string;
  name: string;
  description?: string | null;
  created_at: Date;
  updated_at: Date;
  created_by?: string | null;
  created_by_user?: User | null;
  permissions?: Permission[] | null;
  users?: User[] | null;
  role_permissions?: IRolePermission[] | null;
}

export interface IPermission {
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

export interface RoleFilters {
  page?: number;
  limit?: number;
  search?: string;
  created_by?: string;
}

export interface RoleListResponse {
  success: boolean;
  message: string;
  data: {
    roles: IRole[];
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
  data: IRole;
  error?: string;
}

export interface PermissionListResponse {
  success: boolean;
  message: string;
  data: {
    permissions: IPermission[];
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

export interface CreateRolePermissionRequest {
  role_id: string;
  permission_id: string;
}

export interface RolePermissionResponse {
  success: boolean;
  message: string;
  data: IRolePermission & {
    role: Role;
    permission: Permission;
  };
}

export interface IRolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  role: IRole;
  permission: IPermission;
}
