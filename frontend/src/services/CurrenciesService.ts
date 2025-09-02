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
    try {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.currency_code)
        params.append("currency_code", filters.currency_code);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await apiClient.get(`/api/v1/currencies?${params}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch currencies",
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async getAllCurrencies(): Promise<AllCurrenciesResponse> {
    try {
      const response = await apiClient.get("/api/v1/currencies/all");
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch currencies",
        data: [],
      };
    }
  }

  async getCurrencyById(id: string): Promise<CurrencyResponse> {
    try {
      const response = await apiClient.get(`/api/v1/currencies/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch currency",
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async createCurrency(data: CreateCurrencyRequest): Promise<CurrencyResponse> {
    try {
      const response = await apiClient.post("/api/v1/currencies", data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to create currency",
        error: axiosError.response?.data?.message || "CREATE_ERROR",
      };
    }
  }

  async updateCurrency(
    id: string,
    data: UpdateCurrencyRequest
  ): Promise<CurrencyResponse> {
    try {
      const response = await apiClient.put(`/api/v1/currencies/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to update currency",
        error: axiosError.response?.data?.message || "UPDATE_ERROR",
      };
    }
  }

  async deleteCurrency(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/v1/currencies/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to delete currency",
      };
    }
  }

  async getCurrencyStats(): Promise<CurrencyStatsResponse> {
    try {
      const response = await apiClient.get("/api/v1/currencies/stats");
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message ||
          "Failed to fetch currency stats",
        error: axiosError.response?.data?.message || "FETCH_ERROR",
        data: {
          totalCurrencies: 0,
        },
      };
    }
  }
}

export default new CurrenciesService();
