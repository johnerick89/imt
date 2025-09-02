import apiClient from "./AxiosBase";
import type {
  ChargeListResponse,
  ChargeResponse,
  ChargeStatsResponse,
  CreateChargeRequest,
  UpdateChargeRequest,
  ChargeFilters,
} from "../types/ChargesTypes";

export class ChargesService {
  async getCharges(filters: ChargeFilters): Promise<ChargeListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.search) params.append("search", filters.search);
      if (filters.type) params.append("type", filters.type);
      if (filters.status) params.append("status", filters.status);
      if (filters.application_method)
        params.append("application_method", filters.application_method);
      if (filters.direction) params.append("direction", filters.direction);
      if (filters.currency_id)
        params.append("currency_id", filters.currency_id);
      if (filters.origin_organisation_id)
        params.append("origin_organisation_id", filters.origin_organisation_id);
      if (filters.destination_organisation_id)
        params.append(
          "destination_organisation_id",
          filters.destination_organisation_id
        );
      if (filters.created_by) params.append("created_by", filters.created_by);

      const response = await apiClient.get(
        `/api/v1/charges?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching charges:", error);
      throw error;
    }
  }

  async getChargeById(id: string): Promise<ChargeResponse> {
    try {
      const response = await apiClient.get(`/api/v1/charges/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching charge:", error);
      throw error;
    }
  }

  async createCharge(data: CreateChargeRequest): Promise<ChargeResponse> {
    try {
      const response = await apiClient.post("/api/v1/charges", data);
      return response.data;
    } catch (error) {
      console.error("Error creating charge:", error);
      throw error;
    }
  }

  async updateCharge(
    id: string,
    data: UpdateChargeRequest
  ): Promise<ChargeResponse> {
    try {
      const response = await apiClient.put(`/api/v1/charges/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating charge:", error);
      throw error;
    }
  }

  async deleteCharge(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/v1/charges/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting charge:", error);
      throw error;
    }
  }

  async getChargeStats(): Promise<ChargeStatsResponse> {
    try {
      const response = await apiClient.get("/api/v1/charges/stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching charge stats:", error);
      throw error;
    }
  }
}

export default new ChargesService();
