import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import VaultsService from "../services/VaultsService";
import type {
  CreateVaultRequest,
  UpdateVaultRequest,
  VaultFilters,
} from "../types/VaultsTypes";

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

  return useMutation({
    mutationFn: (data: CreateVaultRequest) => VaultsService.createVault(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vaultsKeys.stats() });
    },
  });
};

export const useUpdateVault = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVaultRequest }) =>
      VaultsService.updateVault(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: vaultsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: vaultsKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: vaultsKeys.stats() });
    },
  });
};

export const useDeleteVault = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => VaultsService.deleteVault(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaultsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vaultsKeys.stats() });
    },
  });
};
