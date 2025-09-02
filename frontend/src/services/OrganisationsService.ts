import apiClient from "./AxiosBase";
import type {
  CreateOrganisationRequest,
  UpdateOrganisationRequest,
  OrganisationFilters,
  OrganisationsListResponse,
  OrganisationResponse,
  OrganisationStatsResponse,
} from "../types/OrganisationsTypes";

class OrganisationsService {
  async getOrganisations(
    filters: OrganisationFilters = {}
  ): Promise<OrganisationsListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.type) params.append("type", filters.type);
      if (filters.status) params.append("status", filters.status);
      if (filters.integration_mode)
        params.append("integration_mode", filters.integration_mode);
      if (filters.country_id) params.append("country_id", filters.country_id);
      if (filters.base_currency_id)
        params.append("base_currency_id", filters.base_currency_id);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await apiClient.get(`/api/v1/organisations?${params}`);

      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching organisations:", error);
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch organisations",
        error: axiosError.response?.data?.error || "FETCH_ERROR",
      };
    }
  }

  async getOrganisationById(id: string): Promise<OrganisationResponse> {
    try {
      const response = await apiClient.get(`/api/v1/organisations/${id}`);

      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching organisation:", error);
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch organisation",
        error: axiosError.response?.data?.error || "FETCH_ERROR",
      };
    }
  }

  async createOrganisation(
    data: CreateOrganisationRequest
  ): Promise<OrganisationResponse> {
    try {
      const response = await apiClient.post("/api/v1/organisations", data);

      return response.data;
    } catch (error: unknown) {
      console.error("Error creating organisation:", error);
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to create organisation",
        error: axiosError.response?.data?.error || "CREATE_ERROR",
      };
    }
  }

  async updateOrganisation(
    id: string,
    data: UpdateOrganisationRequest
  ): Promise<OrganisationResponse> {
    try {
      const response = await apiClient.put(`/api/v1/organisations/${id}`, data);

      return response.data;
    } catch (error: unknown) {
      console.error("Error updating organisation:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to update organisation",
        error: axiosError.response?.data?.message || "UPDATE_ERROR",
      };
    }
  }

  async deleteOrganisation(id: string): Promise<OrganisationResponse> {
    try {
      const response = await apiClient.delete(`/api/v1/organisations/${id}`);

      return response.data;
    } catch (error: unknown) {
      console.error("Error deleting organisation:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to delete organisation",
        error: axiosError.response?.data?.message || "DELETE_ERROR",
      };
    }
  }

  async toggleOrganisationStatus(
    id: string,
    status: string
  ): Promise<OrganisationResponse> {
    try {
      const response = await apiClient.patch(
        `/api/v1/organisations/${id}/status`,
        { status }
      );

      return response.data;
    } catch (error: unknown) {
      console.error("Error toggling organisation status:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to update organisation status",
        error: axiosError.response?.data?.message || "STATUS_UPDATE_ERROR",
      };
    }
  }

  async getOrganisationStats(): Promise<OrganisationStatsResponse> {
    try {
      const response = await apiClient.get("/api/v1/organisations/stats");

      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching organisation stats:", error);
      const axiosError = error as {
        response?: { data?: { message?: string; error?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to fetch organisation stats",
        error: axiosError.response?.data?.error || "STATS_ERROR",
      };
    }
  }

  async getAllOrganisations(): Promise<OrganisationsListResponse> {
    try {
      const response = await apiClient.get("/api/v1/organisations/all");
      return response.data;
    } catch (error: unknown) {
      console.error("Error fetching all organisations:", error);
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      throw new Error(
        axiosError.response?.data?.message ||
          "Failed to fetch all organisations"
      );
    }
  }
}

export default new OrganisationsService();
