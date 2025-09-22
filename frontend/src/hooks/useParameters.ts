import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ParametersService } from "../services/ParametersService";
import type {
  ParameterFilters,
  CreateParameterRequest,
  UpdateParameterRequest,
} from "../types/ParametersTypes";

// Query hooks
export const useParameters = (filters: ParameterFilters = {}) => {
  return useQuery({
    queryKey: ["parameters", filters],
    queryFn: () => ParametersService.getParameters(filters),
  });
};

export const useParameterById = (id: string) => {
  return useQuery({
    queryKey: ["parameter", id],
    queryFn: () => ParametersService.getParameterById(id),
    enabled: !!id,
  });
};

// Mutation hooks
export const useCreateParameter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateParameterRequest) =>
      ParametersService.createParameter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parameters"] });
    },
  });
};

export const useUpdateParameter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateParameterRequest }) =>
      ParametersService.updateParameter(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["parameters"] });
      queryClient.invalidateQueries({ queryKey: ["parameter", id] });
    },
  });
};

export const useDeleteParameter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ParametersService.deleteParameter(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parameters"] });
    },
  });
};
