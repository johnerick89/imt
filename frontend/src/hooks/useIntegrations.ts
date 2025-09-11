import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import IntegrationsService from "../services/IntegrationsService";
import type {
  IntegrationFilters,
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
} from "../types/IntegrationsTypes";

// Query keys
export const integrationKeys = {
  all: ["integrations"] as const,
  lists: () => [...integrationKeys.all, "list"] as const,
  list: (filters: IntegrationFilters) =>
    [...integrationKeys.lists(), filters] as const,
  details: () => [...integrationKeys.all, "detail"] as const,
  detail: (id: string) => [...integrationKeys.details(), id] as const,
  stats: () => [...integrationKeys.all, "stats"] as const,
};

// Hook to get integrations list
export const useIntegrations = (filters: IntegrationFilters = {}) => {
  return useQuery({
    queryKey: integrationKeys.list(filters),
    queryFn: () => IntegrationsService.getIntegrations(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get a single integration
export const useIntegration = (id: string) => {
  return useQuery({
    queryKey: integrationKeys.detail(id),
    queryFn: () => IntegrationsService.getIntegrationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get integration stats
export const useIntegrationStats = () => {
  return useQuery({
    queryKey: integrationKeys.stats(),
    queryFn: () => IntegrationsService.getIntegrationStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create an integration
export const useCreateIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (integrationData: CreateIntegrationRequest) =>
      IntegrationsService.createIntegration(integrationData),
    onSuccess: () => {
      // Invalidate and refetch integrations list
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: integrationKeys.stats() });
    },
  });
};

// Hook to update an integration
export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      integrationData,
    }: {
      id: string;
      integrationData: UpdateIntegrationRequest;
    }) => IntegrationsService.updateIntegration(id, integrationData),
    onSuccess: (data, variables) => {
      // Update the integration in the cache
      queryClient.setQueryData(integrationKeys.detail(variables.id), data);
      // Invalidate and refetch integrations list
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() });
    },
  });
};

// Hook to delete an integration
export const useDeleteIntegration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => IntegrationsService.deleteIntegration(id),
    onSuccess: (_, id) => {
      // Remove the integration from the cache
      queryClient.removeQueries({ queryKey: integrationKeys.detail(id) });
      // Invalidate and refetch integrations list
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: integrationKeys.stats() });
    },
  });
};
