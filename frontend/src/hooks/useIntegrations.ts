import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import IntegrationsService from "../services/IntegrationsService";
import type {
  IntegrationFilters,
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  IntegrationStatsFilters,
} from "../types/IntegrationsTypes";
import { useToast } from "../contexts/ToastContext";

// Query keys
export const integrationKeys = {
  all: ["integrations"] as const,
  lists: () => [...integrationKeys.all, "list"] as const,
  list: (filters: IntegrationFilters) =>
    [...integrationKeys.lists(), filters] as const,
  details: () => [...integrationKeys.all, "detail"] as const,
  detail: (id: string) => [...integrationKeys.details(), id] as const,
  stats: (filters: IntegrationStatsFilters | undefined) =>
    [...integrationKeys.all, "stats", filters] as const,
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
export const useIntegrationStats = (filters?: IntegrationStatsFilters) => {
  return useQuery({
    queryKey: integrationKeys.stats(filters),
    queryFn: () => IntegrationsService.getIntegrationStats(filters ?? {}),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create an integration
export const useCreateIntegration = (filters?: IntegrationStatsFilters) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (integrationData: CreateIntegrationRequest) =>
      IntegrationsService.createIntegration(integrationData),
    onSuccess: (response) => {
      showSuccess(
        "Integration Created Successfully",
        response.message || "The integration has been created successfully."
      );
      // Invalidate and refetch integrations list
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: integrationKeys.stats(filters),
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create integration";
      showError("Integration Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

// Hook to update an integration
export const useUpdateIntegration = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      id,
      integrationData,
    }: {
      id: string;
      integrationData: UpdateIntegrationRequest;
    }) => IntegrationsService.updateIntegration(id, integrationData),
    onSuccess: (response, variables) => {
      showSuccess(
        "Integration Updated Successfully",
        response.message || "The integration has been updated successfully."
      );
      // Update the integration in the cache
      queryClient.setQueryData(
        integrationKeys.detail(variables.id),
        response.data
      );
      // Invalidate and refetch integrations list
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update integration";
      showError("Integration Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

// Hook to delete an integration
export const useDeleteIntegration = (filters?: IntegrationStatsFilters) => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => IntegrationsService.deleteIntegration(id),
    onSuccess: (response, id) => {
      showSuccess(
        "Integration Deleted Successfully",
        response.message || "The integration has been deleted successfully."
      );
      // Remove the integration from the cache
      queryClient.removeQueries({ queryKey: integrationKeys.detail(id) });
      // Invalidate and refetch integrations list
      queryClient.invalidateQueries({ queryKey: integrationKeys.lists() });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: integrationKeys.stats(filters),
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete integration";
      showError("Integration Deletion Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
