import { useQuery } from "@tanstack/react-query";
import { OccupationsService } from "../services/OccupationsService";
import type { OccupationFilters } from "../types/OccupationsTypes";

export const occupationsKeys = {
  all: ["occupations"] as const,
  lists: () => [...occupationsKeys.all, "list"] as const,
  list: (filters: OccupationFilters) => [...occupationsKeys.lists(), filters] as const,
  details: () => [...occupationsKeys.all, "detail"] as const,
  detail: (id: string) => [...occupationsKeys.details(), id] as const,
};

export const useOccupations = (filters: OccupationFilters = {}) => {
  return useQuery({
    queryKey: occupationsKeys.list(filters),
    queryFn: () => OccupationsService.getOccupations(filters),
  });
};

export const useOccupation = (id: string) => {
  return useQuery({
    queryKey: occupationsKeys.detail(id),
    queryFn: () => OccupationsService.getOccupationById(id),
    enabled: !!id,
  });
};
