import { useQuery } from "@tanstack/react-query";
import { IndustriesService } from "../services/IndustriesService";
import type { IndustryFilters } from "../types/IndustriesTypes";

export const industriesKeys = {
  all: ["industries"] as const,
  lists: () => [...industriesKeys.all, "list"] as const,
  list: (filters: IndustryFilters) =>
    [...industriesKeys.lists(), filters] as const,
  details: () => [...industriesKeys.all, "detail"] as const,
  detail: (id: string) => [...industriesKeys.details(), id] as const,
};

export const useIndustries = (filters: IndustryFilters = {}) => {
  return useQuery({
    queryKey: industriesKeys.list(filters),
    queryFn: () => IndustriesService.getIndustries(filters),
  });
};

export const useIndustry = (id: string) => {
  return useQuery({
    queryKey: industriesKeys.detail(id),
    queryFn: () => IndustriesService.getIndustryById(id),
    enabled: !!id,
  });
};
