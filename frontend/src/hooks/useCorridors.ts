import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CorridorsService from "../services/CorridorsService";
import type {
  CorridorFilters,
  CreateCorridorRequest,
  UpdateCorridorRequest,
  CorridorStatsFilters,
} from "../types/CorridorsTypes";

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

  return useMutation({
    mutationFn: (data: CreateCorridorRequest) =>
      CorridorsService.createCorridor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: corridorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: corridorKeys.stats() });
    },
  });
};

export const useUpdateCorridor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      corridorData,
    }: {
      id: string;
      corridorData: UpdateCorridorRequest;
    }) => CorridorsService.updateCorridor(id, corridorData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: corridorKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: corridorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: corridorKeys.stats() });
    },
  });
};

export const useDeleteCorridor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CorridorsService.deleteCorridor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: corridorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: corridorKeys.stats() });
    },
  });
};
