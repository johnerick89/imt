import { useMutation, useQueryClient } from "@tanstack/react-query";
import AuthService from "../services/AuthService";
import type { LoginRequest, RegisterRequest } from "../types/AuthTypes";

// Query keys
export const authKeys = {
  all: ["auth"] as const,
  user: () => [...authKeys.all, "user"] as const,
};

// Hook to login
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (loginData: LoginRequest) => AuthService.login(loginData),
    onSuccess: (data) => {
      if (data.success && data.token) {
        // Store token and user data
        sessionStorage.setItem("token", data.token);
        if (data.user) {
          sessionStorage.setItem("user", JSON.stringify(data.user));
        }

        // Invalidate any existing auth queries
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      }
    },
  });
};

// Hook to register
export const useRegister = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (registerData: RegisterRequest) =>
      AuthService.register(registerData),
    onSuccess: (data) => {
      if (data.success && data.token) {
        // Store token and user data
        sessionStorage.setItem("token", data.token);
        if (data.user) {
          sessionStorage.setItem("user", JSON.stringify(data.user));
        }

        // Invalidate any existing auth queries
        queryClient.invalidateQueries({ queryKey: authKeys.all });
      }
    },
  });
};

// Hook to logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      // Clear local storage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      return Promise.resolve();
    },
    onSuccess: () => {
      // Clear all queries from cache
      queryClient.clear();
    },
  });
};
