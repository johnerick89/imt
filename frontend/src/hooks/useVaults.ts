import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import VaultsService from "../services/VaultsService";
import type {
  CreateVaultRequest,
  UpdateVaultRequest,
  VaultFilters,
} from "../types/VaultsTypes";
import { useToast } from "../contexts/ToastContext";

export const vaultsKeys = {
  all: ["vaults"] as const,
  lists: () => [...vaultsKeys.all, "list"] as const,
  list: (filters: VaultFilters) => [...vaultsKeys.lists(), filters] as const,
  details: () => [...vaultsKeys.all, "detail"] as const,
  detail: (id: string) => [...vaultsKeys.details(), id] as const,
  stats: () => [...vaultsKeys.all, "stats"] as const,
};

export const useVaults = (filters: VaultFilters = {}) => {
  return useQuery({
    queryKey: vaultsKeys.list(filters),
    queryFn: () => VaultsService.getVaults(filters),
  });
};

export const useVault = (id: string) => {
  return useQuery({
    queryKey: vaultsKeys.detail(id),
    queryFn: () => VaultsService.getVaultById(id),
    enabled: !!id,
  });
};

export const useVaultStats = (filters: VaultFilters = {}) => {
  return useQuery({
    queryKey: vaultsKeys.stats(),
    queryFn: () => VaultsService.getVaultStats(filters),
  });
};

export const useCreateVault = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (data: CreateVaultRequest) => VaultsService.createVault(data),
    onSuccess: (response) => {
      showSuccess(
        "Vault Created Successfully",
        response.message || "The vault has been created successfully."
      );
      queryClient.invalidateQueries({ queryKey: vaultsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vaultsKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create vault";
      showError("Vault Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useUpdateVault = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVaultRequest }) =>
      VaultsService.updateVault(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: vaultsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: vaultsKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: vaultsKeys.stats() });
      showSuccess(
        "Vault Updated Successfully",
        response.message || "The vault has been updated successfully."
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update vault";
      showError("Vault Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useDeleteVault = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => VaultsService.deleteVault(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: vaultsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vaultsKeys.stats() });
      showSuccess(
        "Vault Deleted Successfully",
        response.message || "The vault has been deleted successfully."
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete vault";
      showError("Vault Deletion Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
