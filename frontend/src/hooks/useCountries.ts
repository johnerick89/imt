import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CountriesService from "../services/CountriesService";
import type {
  CountryFilters,
  CreateCountryRequest,
  UpdateCountryRequest,
} from "../types/CountriesTypes";

export const countryKeys = {
  all: ["countries"] as const,
  lists: () => [...countryKeys.all, "list"] as const,
  list: (filters: CountryFilters) => [...countryKeys.lists(), filters] as const,
  details: () => [...countryKeys.all, "detail"] as const,
  detail: (id: string) => [...countryKeys.details(), id] as const,
  stats: () => [...countryKeys.all, "stats"] as const,
  allCountries: () => [...countryKeys.all, "all"] as const,
};

export const useCountries = (filters: CountryFilters = {}) => {
  return useQuery({
    queryKey: countryKeys.list(filters),
    queryFn: () => CountriesService.getCountries(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCountry = (id: string) => {
  return useQuery({
    queryKey: countryKeys.detail(id),
    queryFn: () => CountriesService.getCountryById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAllCountries = () => {
  return useQuery({
    queryKey: countryKeys.allCountries(),
    queryFn: () => CountriesService.getAllCountries(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCountryStats = () => {
  return useQuery({
    queryKey: countryKeys.stats(),
    queryFn: () => CountriesService.getCountryStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCountryRequest) =>
      CountriesService.createCountry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: countryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: countryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: countryKeys.allCountries() });
    },
  });
};

export const useUpdateCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCountryRequest }) =>
      CountriesService.updateCountry(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: countryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: countryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: countryKeys.allCountries() });
    },
  });
};

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CountriesService.deleteCountry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: countryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: countryKeys.stats() });
      queryClient.invalidateQueries({ queryKey: countryKeys.allCountries() });
    },
  });
};
