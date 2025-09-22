import apiClient from "./AxiosBase";
import type {
  ParameterFilters,
  ParameterListResponse,
  ParameterResponse,
  CreateParameterRequest,
  UpdateParameterRequest,
} from "../types/ParametersTypes";

export class ParametersService {
  static async getParameters(
    filters: ParameterFilters
  ): Promise<ParameterListResponse> {
    const response = await apiClient.get("/api/v1/parameters", {
      params: filters,
    });
    return response.data;
  }

  static async getParameterById(id: string): Promise<ParameterResponse> {
    const response = await apiClient.get(`/api/v1/parameters/${id}`);
    return response.data;
  }

  static async createParameter(
    data: CreateParameterRequest
  ): Promise<ParameterResponse> {
    const response = await apiClient.post("/api/v1/parameters", data);
    return response.data;
  }

  static async updateParameter(
    id: string,
    data: UpdateParameterRequest
  ): Promise<ParameterResponse> {
    const response = await apiClient.put(`/api/v1/parameters/${id}`, data);
    return response.data;
  }

  static async deleteParameter(id: string): Promise<ParameterResponse> {
    const response = await apiClient.delete(`/api/v1/parameters/${id}`);
    return response.data;
  }
}
