import apiClient from "./AxiosBase";
import type { BranchFilters } from "../types/BranchesTypes";
import type {
  BranchListResponse,
  BranchResponse,
} from "../types/BranchesTypes";

export class BranchesService {
  static async getBranches(
    filters: BranchFilters = {}
  ): Promise<BranchListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.organisation_id)
      params.append("organisation_id", filters.organisation_id);

    const response = await apiClient.get<BranchListResponse>(
      `/api/v1/branches?${params.toString()}`
    );
    return response.data;
  }

  static async getBranchById(id: string): Promise<BranchResponse> {
    const response = await apiClient.get<BranchResponse>(
      `/api/v1/branches/${id}`
    );
    return response.data;
  }
}
