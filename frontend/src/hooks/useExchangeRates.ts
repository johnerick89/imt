import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ExchangeRatesService from "../services/ExchangeRatesService";
import type {
  CreateExchangeRateRequest,
  UpdateExchangeRateRequest,
  ApproveExchangeRateRequest,
  ExchangeRateFilters,
} from "../types/ExchangeRatesTypes";
import { useToast } from "../contexts/ToastContext";

export const exchangeRatesKeys = {
  all: ["exchangeRates"] as const,
  lists: () => [...exchangeRatesKeys.all, "list"] as const,
  list: (filters: ExchangeRateFilters) =>
    [...exchangeRatesKeys.lists(), filters] as const,
  details: () => [...exchangeRatesKeys.all, "detail"] as const,
  detail: (id: string) => [...exchangeRatesKeys.details(), id] as const,
  stats: () => [...exchangeRatesKeys.all, "stats"] as const,
};

// Exchange Rate Hooks
export const useExchangeRates = (filters: ExchangeRateFilters = {}) => {
  return useQuery({
    queryKey: exchangeRatesKeys.list(filters),
    queryFn: () => ExchangeRatesService.getExchangeRates(filters),
  });
};

export const useExchangeRate = (id: string) => {
  return useQuery({
    queryKey: exchangeRatesKeys.detail(id),
    queryFn: () => ExchangeRatesService.getExchangeRateById(id),
    enabled: !!id,
  });
};

export const useExchangeRateStats = () => {
  return useQuery({
    queryKey: exchangeRatesKeys.stats(),
    queryFn: () => ExchangeRatesService.getExchangeRateStats(),
  });
};

export const useCreateExchangeRate = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (data: CreateExchangeRateRequest) =>
      ExchangeRatesService.createExchangeRate(data),
    onSuccess: (response) => {
      showSuccess(
        "Exchange Rate Created Successfully",
        response.message || "The exchange rate has been created successfully."
      );
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create exchange rate";
      showError("Exchange Rate Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useUpdateExchangeRate = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateExchangeRateRequest;
    }) => ExchangeRatesService.updateExchangeRate(id, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Exchange Rate Updated Successfully",
        response.message || "The exchange rate has been updated successfully."
      );
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: exchangeRatesKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update exchange rate";
      showError("Exchange Rate Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useDeleteExchangeRate = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => ExchangeRatesService.deleteExchangeRate(id),
    onSuccess: (response) => {
      showSuccess(
        "Exchange Rate Deleted Successfully",
        response.message || "The exchange rate has been deleted successfully."
      );
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete exchange rate";
      showError("Exchange Rate Deletion Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useApproveExchangeRate = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ApproveExchangeRateRequest;
    }) => ExchangeRatesService.approveExchangeRate(id, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Exchange Rate Approved Successfully",
        response.message || "The exchange rate has been approved successfully."
      );
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: exchangeRatesKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to approve exchange rate";
      showError("Exchange Rate Approval Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
