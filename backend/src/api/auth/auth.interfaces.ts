import { RolePermission, Role, UserStatus } from "@prisma/client";
import { IRole } from "../roles/roles.interfaces";
export interface IUser {
  id: string;
  email: string;
  password: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  avatar: string | null;
  status: UserStatus;
  phone: string | null;
  address: string | null;
  organisation_id: string | null;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
  user_role?: IRole | null;
  role_id?: string | null;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface ILoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
    user_role?: IRole | null;
  };
}

export interface IRegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: string;
  phone?: string;
  address?: string;
  organisation_id?: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface IAuthUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  phone: string | null;
  address: string | null;
  organisation_id: string | null;
  user_role?: IRole | null;
  role_id?: string;
}
