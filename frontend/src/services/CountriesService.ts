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
    const params = new URLSearchParams();

    if (filters.search) params.append("search", filters.search);
    if (filters.code) params.append("code", filters.code);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());

    const response = await apiClient.get(`/api/v1/countries?${params}`);
    return response.data;
  }

  async getAllCountries(): Promise<CountryListResponse> {
    const response = await apiClient.get("/api/v1/countries/all");
    return response.data;
  }

  async getCountryById(id: string): Promise<CountryResponse> {
    const response = await apiClient.get(`/api/v1/countries/${id}`);
    return response.data;
  }

  async createCountry(data: CreateCountryRequest): Promise<CountryResponse> {
    const response = await apiClient.post("/api/v1/countries", data);
    return response.data;
  }

  async updateCountry(
    id: string,
    data: UpdateCountryRequest
  ): Promise<CountryResponse> {
    const response = await apiClient.put(`/api/v1/countries/${id}`, data);
    return response.data;
  }

  async deleteCountry(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete(`/api/v1/countries/${id}`);
    return response.data;
  }

  async getCountryStats(): Promise<CountryStatsResponse> {
    const response = await apiClient.get("/api/v1/countries/stats");
    return response.data;
  }
}

export default new CountriesService();
