import apiClient from "./AxiosBase";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
} from "../types/AuthTypes";

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/api/v1/auth/login", credentials);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(axiosError.response?.data?.message || "Login failed");
    }
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await apiClient.post("/api/v1/auth/register", userData);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(
        axiosError.response?.data?.message || "Registration failed"
      );
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await apiClient.get("/api/v1/auth/profile");
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string }; status?: number };
      };

      // Log the error for debugging
      console.error("AuthService.getProfile error:", error);

      // If it's a 401 error, don't throw - let the caller handle it
      if (axiosError.response?.status === 401) {
        throw new Error("Authentication failed. Please log in again.");
      }

      throw new Error(
        axiosError.response?.data?.message || "Failed to fetch profile"
      );
    }
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
