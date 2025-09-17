import apiClient from "./AxiosBase";
import type {
  CurrencyFilters,
  CurrencyListResponse,
  CurrencyResponse,
  AllCurrenciesResponse,
  CurrencyStatsResponse,
  CreateCurrencyRequest,
  UpdateCurrencyRequest,
} from "../types/CurrenciesTypes";

class CurrenciesService {
  async getCurrencies(
    filters: CurrencyFilters = {}
  ): Promise<CurrencyListResponse> {
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.currency_code)
      params.append("currency_code", filters.currency_code);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await apiClient.get(`/api/v1/currencies?${params}`);
    return response.data;
  }

  async getAllCurrencies(): Promise<AllCurrenciesResponse> {
    const response = await apiClient.get("/api/v1/currencies/all");
    return response.data;
  }

  async getCurrencyById(id: string): Promise<CurrencyResponse> {
    const response = await apiClient.get(`/api/v1/currencies/${id}`);
    return response.data;
  }

  async createCurrency(data: CreateCurrencyRequest): Promise<CurrencyResponse> {
    const response = await apiClient.post("/api/v1/currencies", data);
    return response.data;
  }

  async updateCurrency(
    id: string,
    data: UpdateCurrencyRequest
  ): Promise<CurrencyResponse> {
    const response = await apiClient.put(`/api/v1/currencies/${id}`, data);
    return response.data;
  }

  async deleteCurrency(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/v1/currencies/${id}`);
    return response.data;
  }

  async getCurrencyStats(): Promise<CurrencyStatsResponse> {
    const response = await apiClient.get("/api/v1/currencies/stats");
    return response.data;
  }
}

export default new CurrenciesService();
