export interface IUser {
  id: string;
  email: string;
  password: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  avatar: string | null;
  status: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
  phone: string | null;
  address: string | null;
  organisation_id: string | null;
  last_login: Date | null;
  created_at: Date;
  updated_at: Date;
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
}
