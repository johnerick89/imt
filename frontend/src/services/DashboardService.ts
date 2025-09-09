import axios from "./AxiosBase";
import type { DashboardResponse } from "../types/DashboardTypes";

export const DashboardService = {
  async getDashboardData(organisationId: string): Promise<DashboardResponse> {
    const response = await axios.get(
      `/api/v1/dashboard/organisations/${organisationId}/dashboard`
    );
    return response.data;
  },
};
