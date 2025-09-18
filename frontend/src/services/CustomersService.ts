import apiClient from "./AxiosBase";
import type {
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerFilters,
  CustomerListResponse,
  CustomerResponse,
  CustomerStatsResponse,
  CustomerStatsFilters,
} from "../types/CustomersTypes";

export class CustomersService {
  static async getCustomers(
    filters: CustomerFilters
  ): Promise<CustomerListResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.customer_type)
      params.append("customer_type", filters.customer_type);
    if (filters.organisation_id)
      params.append("organisation_id", filters.organisation_id);
    if (filters.branch_id) params.append("branch_id", filters.branch_id);
    if (filters.nationality_id)
      params.append("nationality_id", filters.nationality_id);
    if (filters.residence_country_id)
      params.append("residence_country_id", filters.residence_country_id);
    if (filters.occupation_id)
      params.append("occupation_id", filters.occupation_id);
    if (filters.industry_id) params.append("industry_id", filters.industry_id);
    if (filters.gender) params.append("gender", filters.gender);
    if (filters.has_adverse_media !== undefined)
      params.append("has_adverse_media", filters.has_adverse_media.toString());
    if (filters.created_by) params.append("created_by", filters.created_by);

    const response = await apiClient.get<CustomerListResponse>(
      `/api/v1/customers?${params.toString()}`
    );
    return response.data;
  }

  static async getCustomerById(id: string): Promise<CustomerResponse> {
    const response = await apiClient.get<CustomerResponse>(
      `/api/v1/customers/${id}`
    );
    return response.data;
  }

  static async createCustomer(
    data: CreateCustomerRequest
  ): Promise<CustomerResponse> {
    const response = await apiClient.post<CustomerResponse>(
      "/api/v1/customers",
      data
    );
    return response.data;
  }

  static async updateCustomer(
    id: string,
    data: UpdateCustomerRequest
  ): Promise<CustomerResponse> {
    const response = await apiClient.put<CustomerResponse>(
      `/api/v1/customers/${id}`,
      data
    );
    return response.data;
  }

  static async deleteCustomer(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.delete<{
      success: boolean;
      message: string;
    }>(`/api/v1/customers/${id}`);
    return response.data;
  }

  static async getCustomerStats(
    filters: CustomerStatsFilters
  ): Promise<CustomerStatsResponse> {
    const response = await apiClient.get<CustomerStatsResponse>(
      "/api/v1/customers/stats",
      { params: filters }
    );
    return response.data;
  }
}
