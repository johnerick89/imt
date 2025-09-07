import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ExchangeRatesService from "../services/ExchangeRatesService";
import type {
  CreateExchangeRateRequest,
  UpdateExchangeRateRequest,
  ApproveExchangeRateRequest,
  ExchangeRateFilters,
} from "../types/ExchangeRatesTypes";

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

  return useMutation({
    mutationFn: (data: CreateExchangeRateRequest) =>
      ExchangeRatesService.createExchangeRate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.stats() });
    },
  });
};

export const useUpdateExchangeRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateExchangeRateRequest;
    }) => ExchangeRatesService.updateExchangeRate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: exchangeRatesKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.stats() });
    },
  });
};

export const useDeleteExchangeRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ExchangeRatesService.deleteExchangeRate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.stats() });
    },
  });
};

export const useApproveExchangeRate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ApproveExchangeRateRequest;
    }) => ExchangeRatesService.approveExchangeRate(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: exchangeRatesKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: exchangeRatesKeys.stats() });
    },
  });
};
