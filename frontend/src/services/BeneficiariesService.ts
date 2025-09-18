import apiClient from "./AxiosBase";
import type {
  Beneficiary,
  BeneficiaryFilters,
  BeneficiaryListResponse,
  BeneficiaryResponse,
  BeneficiaryStatsResponse,
  CreateBeneficiaryRequest,
  UpdateBeneficiaryRequest,
} from "../types/BeneficiariesTypes";

class BeneficiariesService {
  async getBeneficiaries(
    filters: BeneficiaryFilters = {}
  ): Promise<BeneficiaryListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.customer_id)
      params.append("customer_id", filters.customer_id);
    if (filters.organisation_id)
      params.append("organisation_id", filters.organisation_id);
    if (filters.nationality_id)
      params.append("nationality_id", filters.nationality_id);
    if (filters.id_type) params.append("id_type", filters.id_type);
    if (filters.status !== undefined)
      params.append("status", filters.status.toString());
    if (filters.created_by) params.append("created_by", filters.created_by);

    const queryString = params.toString();
    const url = `/api/v1/beneficiaries${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiClient.get(url);
    return response.data;
  }

  async getBeneficiaryById(id: string): Promise<BeneficiaryResponse> {
    const response = await apiClient.get(`/api/v1/beneficiaries/${id}`);
    return response.data;
  }

  async createBeneficiary(
    data: CreateBeneficiaryRequest
  ): Promise<BeneficiaryResponse> {
    const response = await apiClient.post("/api/v1/beneficiaries", data);
    return response.data;
  }

  async updateBeneficiary(
    id: string,
    data: UpdateBeneficiaryRequest
  ): Promise<BeneficiaryResponse> {
    const response = await apiClient.put(`/api/v1/beneficiaries/${id}`, data);
    return response.data;
  }

  async deleteBeneficiary(id: string): Promise<{
    success: boolean;
    message: string;
    data: Beneficiary;
    error: string;
  }> {
    const response = await apiClient.delete(`/api/v1/beneficiaries/${id}`);
    return response.data;
  }

  async getBeneficiaryStats(): Promise<BeneficiaryStatsResponse> {
    const response = await apiClient.get("/api/v1/beneficiaries/stats");
    return response.data;
  }
}

export default new BeneficiariesService();