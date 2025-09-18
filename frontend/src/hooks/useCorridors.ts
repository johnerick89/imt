import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CorridorsService from "../services/CorridorsService";
import type {
  CorridorFilters,
  CreateCorridorRequest,
  UpdateCorridorRequest,
  CorridorStatsFilters,
} from "../types/CorridorsTypes";
import { useToast } from "../contexts/ToastContext";

export const corridorKeys = {
  all: ["corridors"] as const,
  lists: () => [...corridorKeys.all, "list"] as const,
  list: (filters: CorridorFilters) =>
    [...corridorKeys.lists(), filters] as const,
  details: () => [...corridorKeys.all, "detail"] as const,
  detail: (id: string) => [...corridorKeys.details(), id] as const,
  stats: () => [...corridorKeys.all, "stats"] as const,
};

export const useCorridors = (filters: CorridorFilters = {}) => {
  return useQuery({
    queryKey: corridorKeys.list(filters),
    queryFn: () => CorridorsService.getCorridors(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCorridor = (id: string) => {
  return useQuery({
    queryKey: corridorKeys.detail(id),
    queryFn: () => CorridorsService.getCorridorById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCorridorStats = (filters: CorridorStatsFilters) => {
  return useQuery({
    queryKey: corridorKeys.stats(),
    queryFn: () => CorridorsService.getCorridorStats(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCorridor = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (data: CreateCorridorRequest) =>
      CorridorsService.createCorridor(data),
    onSuccess: (response) => {
      showSuccess(
        "Corridor Created Successfully",
        response.message || "The corridor has been created successfully."
      );
      queryClient.invalidateQueries({ queryKey: corridorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: corridorKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create corridor";
      showError("Corridor Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useUpdateCorridor = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      id,
      corridorData,
    }: {
      id: string;
      corridorData: UpdateCorridorRequest;
    }) => CorridorsService.updateCorridor(id, corridorData),
    onSuccess: (response, { id }) => {
      showSuccess(
        "Corridor Updated Successfully",
        response.message || "The corridor has been updated successfully."
      );
      queryClient.invalidateQueries({ queryKey: corridorKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: corridorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: corridorKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update corridor";
      showError("Corridor Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useDeleteCorridor = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => CorridorsService.deleteCorridor(id),
    onSuccess: (response) => {
      showSuccess(
        "Corridor Deleted Successfully",
        response.message || "The corridor has been deleted successfully."
      );
      queryClient.invalidateQueries({ queryKey: corridorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: corridorKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete corridor";
      showError("Corridor Deletion Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
