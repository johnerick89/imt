import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CustomersService } from "../services/CustomersService";
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerFilters,
  CustomerStatsFilters,
} from "../types/CustomersTypes";
import { useToast } from "../contexts/ToastContext";

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

export const useCustomerStats = (filters: CustomerStatsFilters) => {
  return useQuery({
    queryKey: customerKeys.stats(),
    queryFn: () => CustomersService.getCustomerStats(filters),
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (data: CreateCustomerRequest) =>
      CustomersService.createCustomer(data),
    onSuccess: (response) => {
      showSuccess(
        "Customer Created Successfully",
        response.message || "The customer has been created successfully."
      );
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create customer";
      showError("Customer Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCustomerRequest }) =>
      CustomersService.updateCustomer(id, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Customer Updated Successfully",
        response.message || "The customer has been updated successfully."
      );
      queryClient.setQueryData(
        customerKeys.detail(variables.id),
        response.data
      );
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({
        queryKey: customerKeys.detail(variables.id),
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update customer";
      showError("Customer Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => CustomersService.deleteCustomer(id),
    onSuccess: (response) => {
      showSuccess(
        "Customer Deleted Successfully",
        response.message || "The customer has been deleted successfully."
      );
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete customer";
      showError("Customer Deletion Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
