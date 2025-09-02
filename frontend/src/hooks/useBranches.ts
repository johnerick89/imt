import { useQuery } from "@tanstack/react-query";
import { BranchesService } from "../services/BranchesService";
import type { BranchFilters } from "../types/BranchesTypes";

export const branchesKeys = {
  all: ["branches"] as const,
  lists: () => [...branchesKeys.all, "list"] as const,
  list: (filters: BranchFilters) => [...branchesKeys.lists(), filters] as const,
  details: () => [...branchesKeys.all, "detail"] as const,
  detail: (id: string) => [...branchesKeys.details(), id] as const,
};

export const useBranches = (filters: BranchFilters = {}) => {
  return useQuery({
    queryKey: branchesKeys.list(filters),
    queryFn: () => BranchesService.getBranches(filters),
  });
};

export const useBranch = (id: string) => {
  return useQuery({
    queryKey: branchesKeys.detail(id),
    queryFn: () => BranchesService.getBranchById(id),
    enabled: !!id,
  });
};
