import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import RolesService from "../services/RolesService";
import { useToast } from "../contexts/ToastContext";
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  CreateRolePermissionRequest,
  RoleFilters,
  PermissionFilters,
} from "../types/RolesTypes";

export const rolesKeys = {
  all: ["roles"] as const,
  lists: () => [...rolesKeys.all, "list"] as const,
  list: (filters: RoleFilters) => [...rolesKeys.lists(), filters] as const,
  details: () => [...rolesKeys.all, "detail"] as const,
  detail: (id: string) => [...rolesKeys.details(), id] as const,
  stats: () => [...rolesKeys.all, "stats"] as const,
};

export const permissionsKeys = {
  all: ["permissions"] as const,
  lists: () => [...permissionsKeys.all, "list"] as const,
  list: (filters: PermissionFilters) =>
    [...permissionsKeys.lists(), filters] as const,
};

export const useRoles = (filters: RoleFilters = {}) => {
  return useQuery({
    queryKey: rolesKeys.list(filters),
    queryFn: () => RolesService.getRoles(filters),
  });
};

export const useRole = (id: string) => {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: () => RolesService.getRoleById(id),
    enabled: !!id,
  });
};

export const useRoleStats = () => {
  return useQuery({
    queryKey: rolesKeys.stats(),
    queryFn: () => RolesService.getRoleStats(),
  });
};

export const usePermissions = (filters: PermissionFilters = {}) => {
  return useQuery({
    queryKey: permissionsKeys.list(filters),
    queryFn: () => RolesService.getPermissions(filters),
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) => RolesService.createRole(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rolesKeys.stats() });

      showSuccess(
        "Role Created Successfully",
        response.message || "The role has been created successfully."
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create role";
      showError("Role Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRoleRequest }) =>
      RolesService.updateRole(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: rolesKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: rolesKeys.stats() });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => RolesService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rolesKeys.stats() });
    },
  });
};

export const useCreateRolePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRolePermissionRequest) =>
      RolesService.createRolePermission(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: rolesKeys.detail(variables.role_id),
      });
      queryClient.invalidateQueries({ queryKey: rolesKeys.stats() });
    },
  });
};

export const useDeleteRolePermission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { roleId: string; permissionId: string }) =>
      RolesService.deleteRolePermission(data.roleId, data.permissionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: rolesKeys.details() });
      queryClient.invalidateQueries({ queryKey: rolesKeys.stats() });
    },
  });
};
