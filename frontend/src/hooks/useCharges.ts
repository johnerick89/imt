import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ChargesService from "../services/ChargesService";
import type {
  CreateChargeRequest,
  UpdateChargeRequest,
  ChargeFilters,
} from "../types/ChargesTypes";
import { useToast } from "../contexts/ToastContext";

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
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (data: CreateChargeRequest) =>
      ChargesService.createCharge(data),
    onSuccess: (response) => {
      showSuccess(
        "Charge Created Successfully",
        response.message || "The charge has been created successfully."
      );
      queryClient.invalidateQueries({ queryKey: chargeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: chargeKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create charge";
      showError("Charge Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useUpdateCharge = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateChargeRequest }) =>
      ChargesService.updateCharge(id, data),
    onSuccess: (response, { id }) => {
      showSuccess(
        "Charge Updated Successfully",
        response.message || "The charge has been updated successfully."
      );
      queryClient.invalidateQueries({ queryKey: chargeKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: chargeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: chargeKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update charge";
      showError("Charge Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useDeleteCharge = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => ChargesService.deleteCharge(id),
    onSuccess: (response) => {
      showSuccess(
        "Charge Deleted Successfully",
        response.message || "The charge has been deleted successfully."
      );
      queryClient.invalidateQueries({ queryKey: chargeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: chargeKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete charge";
      showError("Charge Deletion Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
