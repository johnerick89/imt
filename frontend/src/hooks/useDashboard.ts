import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "../services/DashboardService";

export const useDashboardData = (organisationId: string) => {
  return useQuery({
    queryKey: ["dashboard", organisationId],
    queryFn: () => DashboardService.getDashboardData(organisationId),
    enabled: !!organisationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};
