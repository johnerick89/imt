import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlAccountsService } from "../services/GlAccountsService";
import type {
  GlAccountFilters,
  CreateGlAccountRequest,
  UpdateGlAccountRequest,
  GenerateAccountsRequest,
} from "../types/GlAccountsTypes";

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

  return useMutation({
    mutationFn: (data: CreateGlAccountRequest) =>
      GlAccountsService.createGlAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["glAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["glAccountStats"] });
    },
  });
};

export const useUpdateGlAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGlAccountRequest }) =>
      GlAccountsService.updateGlAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["glAccounts"] });
      queryClient.invalidateQueries({
        queryKey: ["glAccount", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["glAccountStats"] });
    },
  });
};

export const useDeleteGlAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => GlAccountsService.deleteGlAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["glAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["glAccountStats"] });
    },
  });
};

export const useGenerateGlAccounts = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GenerateAccountsRequest) =>
      GlAccountsService.generateGlAccounts(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["glAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["glAccountStats"] });
    },
  });
};
