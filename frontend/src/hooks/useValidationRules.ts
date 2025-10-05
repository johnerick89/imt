import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ValidationRulesService from "../services/ValidationRulesService";
import type {
  ValidationRuleFilters,
  UpdateValidationRuleRequest,
} from "../types/ValidationRulesTypes";
import { useToast } from "../contexts/ToastContext";

export const validationRuleKeys = {
  all: ["validationRules"] as const,
  lists: () => [...validationRuleKeys.all, "list"] as const,
  list: (filters: ValidationRuleFilters) =>
    [...validationRuleKeys.lists(), filters] as const,
  details: () => [...validationRuleKeys.all, "detail"] as const,
  detail: (id: number) => [...validationRuleKeys.details(), id] as const,
  entity: (entity: string) =>
    [...validationRuleKeys.details(), "entity", entity] as const,
  stats: () => [...validationRuleKeys.all, "stats"] as const,
};

// Hook to get validation rules list
export const useValidationRules = (filters: ValidationRuleFilters = {}) => {
  return useQuery({
    queryKey: validationRuleKeys.list(filters),
    queryFn: () => ValidationRulesService.getValidationRules(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Hook to get a single validation rule by ID
export const useValidationRule = (id: number) => {
  return useQuery({
    queryKey: validationRuleKeys.detail(id),
    queryFn: () => ValidationRulesService.getValidationRuleById(id),
    enabled: !!id,
  });
};

// Hook to get validation rule by entity
export const useValidationRuleByEntity = (entity: string) => {
  return useQuery({
    queryKey: validationRuleKeys.entity(entity),
    queryFn: () => ValidationRulesService.getValidationRuleByEntity(entity),
    enabled: !!entity,
  });
};

// Hook to get validation rule stats
export const useValidationRuleStats = () => {
  return useQuery({
    queryKey: validationRuleKeys.stats(),
    queryFn: () => ValidationRulesService.getValidationRuleStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to update validation rule
export const useUpdateValidationRule = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: UpdateValidationRuleRequest;
    }) => ValidationRulesService.updateValidationRule(id, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Validation Rule Updated Successfully",
        response.message || "The validation rule has been updated successfully."
      );

      // Invalidate and refetch validation rules list
      queryClient.invalidateQueries({ queryKey: validationRuleKeys.lists() });
      // Invalidate specific validation rule
      queryClient.invalidateQueries({
        queryKey: validationRuleKeys.detail(variables.id),
      });
      // Invalidate stats
      queryClient.invalidateQueries({ queryKey: validationRuleKeys.stats() });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update validation rule";
      showError("Validation Rule Update Failed", errorMessage);
    },
  });
};
