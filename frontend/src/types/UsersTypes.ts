import type { Organisation } from "./OrganisationsTypes";
import type { Role } from "./RolesTypes";
export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  role_id: string;
  user_role: Role;
  avatar: string | null;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  phone: string | null;
  address: string | null;
  organisation_id: string | null;
  organisation?: Organisation;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  role_id: string;
  avatar?: string;
  phone?: string;
  address?: string;
  organisation_id?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  role_id?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  organisation_id?: string;
  status?: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  organisation_id?: string;
  page?: number;
  limit?: number;
}

export interface UsersListResponse {
  success: boolean;
  message: string;
  data?: {
    users: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface UserResponse {
  success: boolean;
  message: string;
  data?: User;
  error?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  administrators: number;
  branches: number;
}

export interface UserStatsResponse {
  success: boolean;
  message: string;
  data?: UserStats;
  error?: string;
}

export interface UpdatePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  newPassword: string;
  confirmPassword: string;
}
