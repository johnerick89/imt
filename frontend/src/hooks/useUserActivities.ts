import { useQuery } from "@tanstack/react-query";
import UserActivityService from "../services/UserActivityService";
import type { UserActivityFilters } from "../types/UserActivityTypes";

export const userActivityKeys = {
  all: ["userActivities"] as const,
  lists: () => [...userActivityKeys.all, "list"] as const,
  list: (filters: UserActivityFilters) =>
    [...userActivityKeys.lists(), filters] as const,
  details: () => [...userActivityKeys.all, "detail"] as const,
  detail: (id: string) => [...userActivityKeys.details(), id] as const,
  userHistory: (userId: string) =>
    [...userActivityKeys.all, "userHistory", userId] as const,
  entityHistory: (entityType: string, entityId: string) =>
    [...userActivityKeys.all, "entityHistory", entityType, entityId] as const,
  stats: () => [...userActivityKeys.all, "stats"] as const,
};

export const useUserActivities = (filters: UserActivityFilters = {}) => {
  return useQuery({
    queryKey: userActivityKeys.list(filters),
    queryFn: () => UserActivityService.getUserActivities(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserActivity = (id: string) => {
  return useQuery({
    queryKey: userActivityKeys.detail(id),
    queryFn: () => UserActivityService.getUserActivityById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserAuditHistory = (
  userId: string,
  filters: UserActivityFilters = {}
) => {
  return useQuery({
    queryKey: [...userActivityKeys.userHistory(userId), filters],
    queryFn: () => UserActivityService.getUserAuditHistory(userId, filters),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useEntityAuditHistory = (entityType: string, entityId: string) => {
  return useQuery({
    queryKey: userActivityKeys.entityHistory(entityType, entityId),
    queryFn: () =>
      UserActivityService.getEntityAuditHistory(entityType, entityId),
    enabled: !!entityType && !!entityId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useAuditStats = () => {
  return useQuery({
    queryKey: userActivityKeys.stats(),
    queryFn: () => UserActivityService.getAuditStats(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
