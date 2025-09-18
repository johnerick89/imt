import apiClient from "./AxiosBase";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "../types/AuthTypes";

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post("/api/v1/auth/login", credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post("/api/v1/auth/register", userData);
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await apiClient.get("/api/v1/auth/profile");
    return response.data.data;
  }

  logout(): void {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  }

  getCurrentUser(): User | null {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem("token");
  }

  getToken(): string | null {
    return sessionStorage.getItem("token");
  }
}

export default new AuthService();
