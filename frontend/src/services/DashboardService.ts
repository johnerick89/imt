import apiClient from "./AxiosBase";
import type { DashboardResponse } from "../types/DashboardTypes";

export const DashboardService = {
  async getDashboardData(organisationId: string): Promise<DashboardResponse> {
    const response = await apiClient.get(
      `/api/v1/dashboard/organisations/${organisationId}/dashboard`
    );
    return response.data;
  },
};
