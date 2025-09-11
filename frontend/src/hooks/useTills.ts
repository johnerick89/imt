import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TillsService from "../services/TillsService";
import UserTillsService from "../services/UserTillsService";
import type {
  CreateTillRequest,
  UpdateTillRequest,
  CreateUserTillRequest,
  UpdateUserTillRequest,
  TillFilters,
  UserTillFilters,
} from "../types/TillsTypes";

export const tillsKeys = {
  all: ["tills"] as const,
  lists: () => [...tillsKeys.all, "list"] as const,
  list: (filters: TillFilters) => [...tillsKeys.lists(), filters] as const,
  details: () => [...tillsKeys.all, "detail"] as const,
  detail: (id: string) => [...tillsKeys.details(), id] as const,
  stats: () => [...tillsKeys.all, "stats"] as const,
};

export const userTillsKeys = {
  all: ["userTills"] as const,
  lists: () => [...userTillsKeys.all, "list"] as const,
  list: (filters: UserTillFilters) =>
    [...userTillsKeys.lists(), filters] as const,
  details: () => [...userTillsKeys.all, "detail"] as const,
  detail: (id: string) => [...userTillsKeys.details(), id] as const,
};

// Till Hooks
export const useTills = (filters: TillFilters = {}) => {
  return useQuery({
    queryKey: tillsKeys.list(filters),
    queryFn: () => TillsService.getTills(filters),
  });
};

export const useTill = (id: string) => {
  return useQuery({
    queryKey: tillsKeys.detail(id),
    queryFn: () => TillsService.getTillById(id),
    enabled: !!id,
  });
};

export const useTillStats = (filters: TillFilters = {}) => {
  return useQuery({
    queryKey: tillsKeys.stats(),
    queryFn: () => TillsService.getTillStats(filters),
  });
};

export const useCreateTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTillRequest) => TillsService.createTill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
    },
  });
};

export const useUpdateTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTillRequest }) =>
      TillsService.updateTill(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: tillsKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
    },
  });
};

export const useDeleteTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TillsService.deleteTill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
    },
  });
};

// Till Operations
export const useOpenTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TillsService.openTill(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tillsKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
    },
  });
};

export const useCloseTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TillsService.closeTill(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tillsKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
    },
  });
};

export const useBlockTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TillsService.blockTill(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tillsKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
    },
  });
};

export const useDeactivateTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TillsService.deactivateTill(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: tillsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tillsKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: tillsKeys.stats() });
    },
  });
};

// UserTill Hooks
export const useUserTills = (filters: UserTillFilters = {}) => {
  return useQuery({
    queryKey: userTillsKeys.list(filters),
    queryFn: () => UserTillsService.getUserTills(filters),
  });
};

export const useUserTill = (id: string) => {
  return useQuery({
    queryKey: userTillsKeys.detail(id),
    queryFn: () => UserTillsService.getUserTillById(id),
    enabled: !!id,
  });
};

export const useCreateUserTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserTillRequest) =>
      UserTillsService.createUserTill(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
    },
  });
};

export const useUpdateUserTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserTillRequest }) =>
      UserTillsService.updateUserTill(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userTillsKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteUserTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UserTillsService.deleteUserTill(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
    },
  });
};

export const useCloseUserTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UserTillsService.closeUserTill(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userTillsKeys.detail(variables),
      });
    },
  });
};

export const useBlockUserTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => UserTillsService.blockUserTill(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: userTillsKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: userTillsKeys.detail(variables),
      });
    },
  });
};
