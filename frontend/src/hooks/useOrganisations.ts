import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import OrganisationsService from "../services/OrganisationsService";
import type {
  OrganisationFilters,
  CreateOrganisationRequest,
  UpdateOrganisationRequest,
} from "../types/OrganisationsTypes";

// Query keys
export const organisationKeys = {
  all: ["organisations"] as const,
  lists: () => [...organisationKeys.all, "list"] as const,
  list: (filters: OrganisationFilters) =>
    [...organisationKeys.lists(), filters] as const,
  details: () => [...organisationKeys.all, "detail"] as const,
  detail: (id: string) => [...organisationKeys.details(), id] as const,
  stats: () => [...organisationKeys.all, "stats"] as const,
  allOrganisations: () => [...organisationKeys.all, "all"] as const,
};

// Get organisations list
export const useOrganisations = (filters: OrganisationFilters = {}) => {
  return useQuery({
    queryKey: organisationKeys.list(filters),
    queryFn: () => OrganisationsService.getOrganisations(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single organisation
export const useOrganisation = (id: string) => {
  return useQuery({
    queryKey: organisationKeys.detail(id),
    queryFn: () => OrganisationsService.getOrganisationById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get organisation stats
export const useOrganisationStats = () => {
  return useQuery({
    queryKey: organisationKeys.stats(),
    queryFn: () => OrganisationsService.getOrganisationStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create organisation
export const useCreateOrganisation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organisationData: CreateOrganisationRequest) =>
      OrganisationsService.createOrganisation(organisationData),
    onSuccess: () => {
      // Invalidate and refetch organisations list
      queryClient.invalidateQueries({ queryKey: organisationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: organisationKeys.stats() });
    },
  });
};

// Update organisation
export const useUpdateOrganisation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      organisationData,
    }: {
      id: string;
      organisationData: UpdateOrganisationRequest;
    }) => OrganisationsService.updateOrganisation(id, organisationData),
    onSuccess: (data, variables) => {
      // Update the organisation in the cache
      queryClient.setQueryData(organisationKeys.detail(variables.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: organisationKeys.lists() });
    },
  });
};

// Delete organisation
export const useDeleteOrganisation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => OrganisationsService.deleteOrganisation(id),
    onSuccess: (data, variables) => {
      // Remove from cache
      queryClient.removeQueries({
        queryKey: organisationKeys.detail(variables),
      });
      // Invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: organisationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: organisationKeys.stats() });
    },
  });
};

// Toggle organisation status
export const useToggleOrganisationStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      OrganisationsService.toggleOrganisationStatus(id, status),
    onSuccess: (data, variables) => {
      // Update the organisation in the cache
      queryClient.setQueryData(organisationKeys.detail(variables.id), data);
      // Invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: organisationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: organisationKeys.stats() });
    },
  });
};

// Get all organisations
export const useAllOrganisations = () => {
  return useQuery({
    queryKey: organisationKeys.allOrganisations(),
    queryFn: () => OrganisationsService.getAllOrganisations(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
