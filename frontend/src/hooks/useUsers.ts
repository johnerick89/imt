import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import UsersService from "../services/UsersService";
import AuthService from "../services/AuthService";
import { useToast } from "../contexts/ToastContext";
import type {
  UserFilters,
  CreateUserRequest,
  UpdateUserRequest,
} from "../types/UsersTypes";

// Query keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  list: (filters: UserFilters) => [...userKeys.lists(), filters] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
  stats: () => [...userKeys.all, "stats"] as const,
};

// Hook to get users list
export const useUsers = (filters: UserFilters = {}) => {
  return useQuery({
    queryKey: userKeys.list(filters),
    queryFn: () => UsersService.getUsers(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get a single user
export const useUser = (userId: string) => {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => UsersService.getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get current user profile
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["currentUser"],
    queryFn: () =>
      AuthService.getProfile().then((user) => ({
        success: true,
        message: "Profile retrieved successfully",
        data: user,
      })),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry on failure
    retryOnMount: false, // Don't retry when component mounts
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
  });
};

// Hook to get user stats
export const useUserStats = () => {
  return useQuery({
    queryKey: userKeys.stats(),
    queryFn: () => UsersService.getUserStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create a user
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: (userData: CreateUserRequest) =>
      UsersService.createUser(userData),
    onSuccess: (response) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });

      showSuccess(
        "User Created Successfully",
        response.message || "The user has been created successfully."
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create user";
      showError("User Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

// Hook to update a user
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: ({
      userId,
      userData,
    }: {
      userId: string;
      userData: UpdateUserRequest;
    }) => UsersService.updateUser(userId, userData),
    onSuccess: (response, variables) => {
      // Update the user in the cache
      queryClient.setQueryData(userKeys.detail(variables.userId), response);
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });

      showSuccess(
        "User Updated Successfully",
        response.message || "The user has been updated successfully."
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user";
      showError("User Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

// Hook to toggle user status
export const useToggleUserStatus = () => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED";
    }) => UsersService.toggleUserStatus(userId, status),
    onSuccess: (response, variables) => {
      // Update the user in the cache
      queryClient.setQueryData(userKeys.detail(variables.userId), response);
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });

      showSuccess(
        "User Status Updated Successfully",
        response.message ||
          `User status has been updated to ${variables.status.toLowerCase()}.`
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user status";
      showError("User Status Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

// Hook to delete a user
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: (userId: string) => UsersService.deleteUser(userId),
    onSuccess: (response, userId) => {
      // Remove the user from the cache
      queryClient.removeQueries({ queryKey: userKeys.detail(userId) });
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: userKeys.stats() });

      showSuccess(
        "User Deleted Successfully",
        response.message || "The user has been deleted successfully."
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user";
      showError("User Deletion Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
