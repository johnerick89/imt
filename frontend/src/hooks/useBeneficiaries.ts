import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import BeneficiariesService from "../services/BeneficiariesService";
import type {
  BeneficiaryFilters,
  UpdateBeneficiaryRequest,
  CreateBeneficiaryRequest,
} from "../types/BeneficiariesTypes";
import { useToast } from "../contexts/ToastContext";

export const beneficiariesKeys = {
  all: ["beneficiaries"] as const,
  lists: () => [...beneficiariesKeys.all, "list"] as const,
  list: (filters: BeneficiaryFilters) =>
    [...beneficiariesKeys.lists(), filters] as const,
  details: () => [...beneficiariesKeys.all, "detail"] as const,
  detail: (id: string) => [...beneficiariesKeys.details(), id] as const,
  stats: () => [...beneficiariesKeys.all, "stats"] as const,
};

export const useBeneficiaries = (filters: BeneficiaryFilters = {}) => {
  return useQuery({
    queryKey: beneficiariesKeys.list(filters),
    queryFn: () => BeneficiariesService.getBeneficiaries(filters),
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useBeneficiary = (id: string) => {
  return useQuery({
    queryKey: beneficiariesKeys.detail(id),
    queryFn: () => BeneficiariesService.getBeneficiaryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useBeneficiaryStats = () => {
  return useQuery({
    queryKey: beneficiariesKeys.stats(),
    queryFn: () => BeneficiariesService.getBeneficiaryStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateBeneficiary = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (data: CreateBeneficiaryRequest) =>
      BeneficiariesService.createBeneficiary(data),
    onSuccess: (response) => {
      showSuccess(
        "Beneficiary Created Successfully",
        response.message || "The beneficiary has been created successfully."
      );
      queryClient.invalidateQueries({ queryKey: beneficiariesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: beneficiariesKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create beneficiary";
      showError("Beneficiary Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useUpdateBeneficiary = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBeneficiaryRequest;
    }) => BeneficiariesService.updateBeneficiary(id, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Beneficiary Updated Successfully",
        response.message || "The beneficiary has been updated successfully."
      );
      queryClient.invalidateQueries({ queryKey: beneficiariesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: beneficiariesKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: beneficiariesKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update beneficiary";
      showError("Beneficiary Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useDeleteBeneficiary = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: BeneficiariesService.deleteBeneficiary,
    onSuccess: (response) => {
      showSuccess(
        "Beneficiary Deleted Successfully",
        response.message || "The beneficiary has been deleted successfully."
      );
      queryClient.invalidateQueries({ queryKey: beneficiariesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: beneficiariesKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete beneficiary";
      showError("Beneficiary Deletion Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
