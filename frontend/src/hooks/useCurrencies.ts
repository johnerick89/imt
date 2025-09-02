import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CurrenciesService from "../services/CurrenciesService";
import type {
  CurrencyFilters,
  CreateCurrencyRequest,
  UpdateCurrencyRequest,
} from "../types/CurrenciesTypes";

export const currencyKeys = {
  all: ["currencies"] as const,
  lists: () => [...currencyKeys.all, "list"] as const,
  list: (filters: CurrencyFilters) =>
    [...currencyKeys.lists(), filters] as const,
  details: () => [...currencyKeys.all, "detail"] as const,
  detail: (id: string) => [...currencyKeys.details(), id] as const,
  stats: () => [...currencyKeys.all, "stats"] as const,
  allCurrencies: () => [...currencyKeys.all, "all"] as const,
};

export const useCurrencies = (filters: CurrencyFilters = {}) => {
  return useQuery({
    queryKey: currencyKeys.list(filters),
    queryFn: () => CurrenciesService.getCurrencies(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCurrency = (id: string) => {
  return useQuery({
    queryKey: currencyKeys.detail(id),
    queryFn: () => CurrenciesService.getCurrencyById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAllCurrencies = () => {
  return useQuery({
    queryKey: currencyKeys.allCurrencies(),
    queryFn: () => CurrenciesService.getAllCurrencies(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCurrencyStats = () => {
  return useQuery({
    queryKey: currencyKeys.stats(),
    queryFn: () => CurrenciesService.getCurrencyStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCurrencyRequest) =>
      CurrenciesService.createCurrency(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: currencyKeys.stats() });
      queryClient.invalidateQueries({ queryKey: currencyKeys.allCurrencies() });
    },
  });
};

export const useUpdateCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCurrencyRequest }) =>
      CurrenciesService.updateCurrency(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: currencyKeys.allCurrencies() });
    },
  });
};

export const useDeleteCurrency = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CurrenciesService.deleteCurrency(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: currencyKeys.lists() });
      queryClient.invalidateQueries({ queryKey: currencyKeys.stats() });
      queryClient.invalidateQueries({ queryKey: currencyKeys.allCurrencies() });
    },
  });
};
