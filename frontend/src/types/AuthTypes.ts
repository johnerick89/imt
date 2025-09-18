import type { Organisation } from "./OrganisationsTypes";
import type { Role } from "./RolesTypes";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  phone?: string;
  address?: string;
}

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: string;
  status: string;
  phone?: string;
  address?: string;
  avatar?: string;
  organisation_id?: string;
  organisation?: Organisation;
  last_login?: string;
  created_at: string;
  updated_at: string;
  role_id?: string;
  user_role?: Role;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}
