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
    try {
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
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch beneficiaries",
        data: {
          beneficiaries: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        },
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async getBeneficiaryById(id: string): Promise<BeneficiaryResponse> {
    try {
      const response = await apiClient.get(`/api/v1/beneficiaries/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch beneficiary",
        data: {} as unknown as Beneficiary,
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async createBeneficiary(
    data: CreateBeneficiaryRequest
  ): Promise<BeneficiaryResponse> {
    try {
      const response = await apiClient.post("/api/v1/beneficiaries", data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to create beneficiary",
        data: {} as unknown as Beneficiary,
        error: axiosError.response?.data?.message || "CREATE_ERROR",
      };
    }
  }

  async updateBeneficiary(
    id: string,
    data: UpdateBeneficiaryRequest
  ): Promise<BeneficiaryResponse> {
    try {
      const response = await apiClient.put(`/api/v1/beneficiaries/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to update beneficiary",
        data: {} as unknown as Beneficiary,
        error: axiosError.response?.data?.message || "UPDATE_ERROR",
      };
    }
  }

  async deleteBeneficiary(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/v1/beneficiaries/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to delete beneficiary",
      };
    }
  }

  async getBeneficiaryStats(): Promise<BeneficiaryStatsResponse> {
    try {
      const response = await apiClient.get("/api/v1/beneficiaries/stats");
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to fetch beneficiary statistics",
        data: {
          totalBeneficiaries: 0,
          activeBeneficiaries: 0,
          inactiveBeneficiaries: 0,
          beneficiariesByType: {},
          beneficiariesByNationality: {},
        },
        error: axiosError.response?.data?.message || "STATS_ERROR",
      };
    }
  }
}

export default new BeneficiariesService();
