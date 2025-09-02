import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ChargesService from "../services/ChargesService";
import type {
  CreateChargeRequest,
  UpdateChargeRequest,
  ChargeFilters,
} from "../types/ChargesTypes";

export const chargeKeys = {
  all: ["charges"] as const,
  lists: () => [...chargeKeys.all, "list"] as const,
  list: (filters: ChargeFilters) => [...chargeKeys.lists(), filters] as const,
  details: () => [...chargeKeys.all, "detail"] as const,
  detail: (id: string) => [...chargeKeys.details(), id] as const,
  stats: () => [...chargeKeys.all, "stats"] as const,
};

export const useCharges = (filters: ChargeFilters = {}) => {
  return useQuery({
    queryKey: chargeKeys.list(filters),
    queryFn: () => ChargesService.getCharges(filters),
  });
};

export const useCharge = (id: string) => {
  return useQuery({
    queryKey: chargeKeys.detail(id),
    queryFn: () => ChargesService.getChargeById(id),
    enabled: !!id,
  });
};

export const useChargeStats = () => {
  return useQuery({
    queryKey: chargeKeys.stats(),
    queryFn: () => ChargesService.getChargeStats(),
  });
};

export const useCreateCharge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateChargeRequest) =>
      ChargesService.createCharge(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chargeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: chargeKeys.stats() });
    },
  });
};

export const useUpdateCharge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChargeRequest }) =>
      ChargesService.updateCharge(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: chargeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: chargeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: chargeKeys.stats() });
    },
  });
};

export const useDeleteCharge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ChargesService.deleteCharge(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chargeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: chargeKeys.stats() });
    },
  });
};
