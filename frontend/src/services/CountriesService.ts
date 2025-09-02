import apiClient from "./AxiosBase";
import type {
  CountryFilters,
  CountryListResponse,
  CountryResponse,
  CountryStatsResponse,
  CreateCountryRequest,
  UpdateCountryRequest,
} from "../types/CountriesTypes";

class CountriesService {
  async getCountries(
    filters: CountryFilters = {}
  ): Promise<CountryListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.code) params.append("code", filters.code);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());

      const response = await apiClient.get(`/api/v1/countries?${params}`);
      console.log("response", response.data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch countries",
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async getAllCountries(): Promise<CountryListResponse> {
    try {
      const response = await apiClient.get("/api/v1/countries/all");
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch countries",
        data: {
          countries: [],
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

  async getCountryById(id: string): Promise<CountryResponse> {
    try {
      const response = await apiClient.get(`/api/v1/countries/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch country",
        error: axiosError.response?.data?.message || "FETCH_ERROR",
      };
    }
  }

  async createCountry(data: CreateCountryRequest): Promise<CountryResponse> {
    try {
      const response = await apiClient.post("/api/v1/countries", data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to create country",
        error: axiosError.response?.data?.message || "CREATE_ERROR",
      };
    }
  }

  async updateCountry(
    id: string,
    data: UpdateCountryRequest
  ): Promise<CountryResponse> {
    try {
      const response = await apiClient.put(`/api/v1/countries/${id}`, data);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to update country",
        error: axiosError.response?.data?.message || "UPDATE_ERROR",
      };
    }
  }

  async deleteCountry(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiClient.delete(`/api/v1/countries/${id}`);
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to delete country",
      };
    }
  }

  async getCountryStats(): Promise<CountryStatsResponse> {
    try {
      const response = await apiClient.get("/api/v1/countries/stats");
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      return {
        success: false,
        message:
          axiosError.response?.data?.message || "Failed to fetch country stats",
        error: axiosError.response?.data?.message || "FETCH_ERROR",
        data: {
          totalCountries: 0,
        },
      };
    }
  }
}

export default new CountriesService();
