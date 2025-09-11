import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomersService } from "../services/CustomersService";
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerFilters,
} from "../types/CustomersTypes";

export const customerKeys = {
  all: ["customers"] as const,
  lists: () => [...customerKeys.all, "list"] as const,
  list: (filters: CustomerFilters) =>
    [...customerKeys.lists(), filters] as const,
  details: () => [...customerKeys.all, "detail"] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  stats: () => [...customerKeys.all, "stats"] as const,
};

export const useCustomers = (filters: CustomerFilters) => {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => CustomersService.getCustomers(filters),
  });
};

export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => CustomersService.getCustomerById(id),
    enabled: !!id,
  });
};

export const useCustomerStats = () => {
  return useQuery({
    queryKey: customerKeys.stats(),
    queryFn: () => CustomersService.getCustomerStats(),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerRequest) =>
      CustomersService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      CustomersService.updateCustomer(id, data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(customerKeys.detail(variables.id), data);
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.id),
      });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CustomersService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
  });
};
