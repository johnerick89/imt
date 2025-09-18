import apiClient from "./AxiosBase";
import type {
  ExchangeRate,
  CreateExchangeRateRequest,
  UpdateExchangeRateRequest,
  ApproveExchangeRateRequest,
  ExchangeRateFilters,
  ExchangeRateListResponse,
  ExchangeRateResponse,
  ExchangeRateStatsResponse,
} from "../types/ExchangeRatesTypes";

class ExchangeRatesService {
  async getExchangeRates(
    filters: ExchangeRateFilters = {}
  ): Promise<ExchangeRateListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.status) params.append("status", filters.status);
    if (filters.operator_status)
      params.append("operator_status", filters.operator_status);
    if (filters.from_currency_id)
      params.append("from_currency_id", filters.from_currency_id);
    if (filters.to_currency_id)
      params.append("to_currency_id", filters.to_currency_id);
    if (filters.origin_country_id)
      params.append("origin_country_id", filters.origin_country_id);
    if (filters.destination_country_id)
      params.append("destination_country_id", filters.destination_country_id);
    if (filters.organisation_id)
      params.append("organisation_id", filters.organisation_id);
    if (filters.created_by) params.append("created_by", filters.created_by);

    const queryString = params.toString();
    const url = `/api/v1/exchangerates${queryString ? `?${queryString}` : ""}`;

    const response = await apiClient.get(url);
    return response.data;
  }

  async getExchangeRateById(id: string): Promise<ExchangeRateResponse> {
    const response = await apiClient.get(`/api/v1/exchangerates/${id}`);
    return response.data;
  }

  async createExchangeRate(
    data: CreateExchangeRateRequest
  ): Promise<ExchangeRateResponse> {
    const response = await apiClient.post("/api/v1/exchangerates", data);
    return response.data;
  }

  async updateExchangeRate(
    id: string,
    data: UpdateExchangeRateRequest
  ): Promise<ExchangeRateResponse> {
    const response = await apiClient.put(`/api/v1/exchangerates/${id}`, data);
    return response.data;
  }

  async deleteExchangeRate(id: string): Promise<{
    success: boolean;
    message: string;
    data: ExchangeRate;
    error: string;
  }> {
    const response = await apiClient.delete(`/api/v1/exchangerates/${id}`);
    return response.data;
  }

  async approveExchangeRate(
    id: string,
    data: ApproveExchangeRateRequest
  ): Promise<ExchangeRateResponse> {
    const response = await apiClient.post(
      `/api/v1/exchangerates/${id}/approve`,
      data
    );
    return response.data;
  }

  async getExchangeRateStats(): Promise<ExchangeRateStatsResponse> {
    const response = await apiClient.get("/api/v1/exchangerates/stats");
    return response.data;
  }
}

export default new ExchangeRatesService();
