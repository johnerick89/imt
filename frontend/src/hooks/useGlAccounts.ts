import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlAccountsService } from "../services/GlAccountsService";
import type {
  GlAccountFilters,
  CreateGlAccountRequest,
  UpdateGlAccountRequest,
  GenerateAccountsRequest,
} from "../types/GlAccountsTypes";
import { useToast } from "../contexts/ToastContext";

export const useGlAccounts = (filters: GlAccountFilters) => {
  return useQuery({
    queryKey: ["glAccounts", filters],
    queryFn: () => GlAccountsService.getGlAccounts(filters),
  });
};

export const useGlAccountById = (id: string) => {
  return useQuery({
    queryKey: ["glAccount", id],
    queryFn: () => GlAccountsService.getGlAccountById(id),
    enabled: !!id,
  });
};

export const useGlAccountStats = (organisationId?: string) => {
  return useQuery({
    queryKey: ["glAccountStats", organisationId],
    queryFn: () => GlAccountsService.getGlAccountStats(organisationId),
  });
};

export const useCreateGlAccount = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (data: CreateGlAccountRequest) =>
      GlAccountsService.createGlAccount(data),
    onSuccess: (response) => {
      showSuccess(
        "GL Account Created Successfully",
        response.message || "The GL account has been created successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["glAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["glAccountStats"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create GL account";
      showError("GL Account Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useUpdateGlAccount = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGlAccountRequest }) =>
      GlAccountsService.updateGlAccount(id, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "GL Account Updated Successfully",
        response.message || "The GL account has been updated successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["glAccounts"] });
      queryClient.invalidateQueries({
        queryKey: ["glAccount", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["glAccountStats"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update GL account";
      showError("GL Account Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useDeleteGlAccount = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => GlAccountsService.deleteGlAccount(id),
    onSuccess: (response) => {
      showSuccess(
        "GL Account Deleted Successfully",
        response.message || "The GL account has been deleted successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["glAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["glAccountStats"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete GL account";
      showError("GL Account Deletion Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useGenerateGlAccounts = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (data: GenerateAccountsRequest) =>
      GlAccountsService.generateGlAccounts(data),
    onSuccess: (response) => {
      showSuccess(
        "GL Accounts Generated Successfully",
        response.message || "The GL accounts have been generated successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["glAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["glAccountStats"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to generate GL accounts";
      showError("GL Accounts Generation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
