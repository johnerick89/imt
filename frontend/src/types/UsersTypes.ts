export type UserStatus = "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
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

export interface Organisation {
  id: string;
  name: string;
  description: string | null;
  type: "PARTNER" | "AGENCY" | "CUSTOMER";
  integration_mode: "INTERNAL" | "EXTERNAL";
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  contact_city: string | null;
  contact_state: string | null;
  contact_zip: string | null;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  base_currency_id: string | null;
  country_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
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
