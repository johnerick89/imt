import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TillsService from "../services/TillsService";
import UserTillsService from "../services/UserTillsService";
import type {
  CreateTillRequest,
  UpdateTillRequest,
  CreateUserTillRequest,
  UpdateUserTillRequest,
  TillFilters,
  UserTillFilters,
} from "../types/TillsTypes";
import { useToast } from "../contexts/ToastContext";

export const tillsKeys = {
  all: ["tills"] as const,
  lists: () => [...tillsKeys.all, "list"] as const,
  list: (filters: TillFilters) => [...tillsKeys.lists(), filters] as const,
  details: () => [...tillsKeys.all, "detail"] as const,
  detail: (id: string) => [...tillsKeys.details(), id] as const,
  stats: () => [...tillsKeys.all, "stats"] as const,
};

export const userTillsKeys = {
  all: ["userTills"] as const,
  lists: () => [...userTillsKeys.all, "list"] as const,
  list: (filters: UserTillFilters) =>
    [...userTillsKeys.lists(), filters] as const,
  details: () => [...userTillsKeys.all, "detail"] as const,
  detail: (id: string) => [...userTillsKeys.details(), id] as const,
};

// Till Hooks
export const useTills = (filters: TillFilters = {}) => {
  return useQuery({
    queryKey: tillsKeys.list(filters),
    queryFn: () => TillsService.getTills(filters),
  });
};

export const useTill = (id: string) => {
  return useQuery({
    queryKey: tillsKeys.detail(id),
    queryFn: () => TillsService.getTillById(id),
    enabled: !!id,
  });
};

export const useTillStats = (filters: TillFilters = {}) => {
  return useQuery({
    queryKey: tillsKeys.stats(),
    queryFn: () => TillsService.getTillStats(filters),
  });
};

export const useCreateTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (data: CreateTillRequest) => TillsService.createTill(data),
    onSuccess: (response) => {
      showSuccess(
        "Till Created Successfully",
        response.message || "The till has been created successfully."
      );
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create till";
      showError("Till Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useUpdateTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTillRequest }) =>
      TillsService.updateTill(id, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Till Updated Successfully",
        response.message || "The till has been updated successfully."
      );
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: tillsKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update till";
      showError("Till Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useDeleteTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => TillsService.deleteTill(id),
    onSuccess: (response) => {
      showSuccess(
        "Till Deleted Successfully",
        response.message || "The till has been deleted successfully."
      );
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete till";
      showError("Till Deletion Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

// Till Operations
export const useOpenTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => TillsService.openTill(id),
    onSuccess: (response, variables) => {
      showSuccess(
        "Till Opened Successfully",
        response.message || "The till has been opened successfully."
      );
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tillsKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to open till";
      showError("Till Opening Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useCloseTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => TillsService.closeTill(id),
    onSuccess: (response, variables) => {
      showSuccess(
        "Till Closed Successfully",
        response.message || "The till has been closed successfully."
      );
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tillsKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to close till";
      showError("Till Closing Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useBlockTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => TillsService.blockTill(id),
    onSuccess: (response, variables) => {
      showSuccess(
        "Till Blocked Successfully",
        response.message || "The till has been blocked successfully."
      );
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tillsKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to block till";
      showError("Till Blocking Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useDeactivateTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => TillsService.deactivateTill(id),
    onSuccess: (response, variables) => {
      showSuccess(
        "Till Deactivated Successfully",
        response.message || "The till has been deactivated successfully."
      );
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tillsKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to deactivate till";
      showError("Till Deactivation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

// UserTill Hooks
export const useUserTills = (filters: UserTillFilters = {}) => {
  return useQuery({
    queryKey: userTillsKeys.list(filters),
    queryFn: () => UserTillsService.getUserTills(filters),
  });
};

export const useUserTill = (id: string) => {
  return useQuery({
    queryKey: userTillsKeys.detail(id),
    queryFn: () => UserTillsService.getUserTillById(id),
    enabled: !!id,
  });
};

export const useCreateUserTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (data: CreateUserTillRequest) =>
      UserTillsService.createUserTill(data),
    onSuccess: (response) => {
      showSuccess(
        "User Till Created Successfully",
        response.message || "The user till has been created successfully."
      );
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create user till";
      showError("User Till Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useUpdateUserTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserTillRequest }) =>
      UserTillsService.updateUserTill(id, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "User Till Updated Successfully",
        response.message || "The user till has been updated successfully."
      );
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userTillsKeys.detail(variables.id),
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update user till";
      showError("User Till Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useDeleteUserTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => UserTillsService.deleteUserTill(id),
    onSuccess: (response) => {
      showSuccess(
        "User Till Deleted Successfully",
        response.message || "The user till has been deleted successfully."
      );
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete user till";
      showError("User Till Deletion Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useCloseUserTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => UserTillsService.closeUserTill(id),
    onSuccess: (response, variables) => {
      showSuccess(
        "User Till Closed Successfully",
        response.message || "The user till has been closed successfully."
      );
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userTillsKeys.detail(variables),
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to close user till";
      showError("User Till Closing Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useBlockUserTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => UserTillsService.blockUserTill(id),
    onSuccess: (response, variables) => {
      showSuccess(
        "User Till Blocked Successfully",
        response.message || "The user till has been blocked successfully."
      );
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userTillsKeys.detail(variables),
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to block user till";
      showError("User Till Blocking Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
