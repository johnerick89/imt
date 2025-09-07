import axios from "./AxiosBase";
import type {
  GlAccountListResponse,
  GlAccountResponse,
  GlAccountStatsResponse,
  CreateGlAccountRequest,
  UpdateGlAccountRequest,
  GlAccountFilters,
  GenerateAccountsRequest,
  GenerateAccountsResponse,
} from "../types/GlAccountsTypes";

export const GlAccountsService = {
  // CRUD Operations
  async getGlAccounts(
    filters: GlAccountFilters
  ): Promise<GlAccountListResponse> {
    const response = await axios.get("/api/v1/glaccounts", { params: filters });
    return response.data;
  },

  async getGlAccountById(id: string): Promise<GlAccountResponse> {
    const response = await axios.get(`/api/v1/glaccounts/${id}`);
    return response.data;
  },

  async createGlAccount(
    data: CreateGlAccountRequest
  ): Promise<GlAccountResponse> {
    const response = await axios.post("/api/v1/glaccounts", data);
    return response.data;
  },

  async updateGlAccount(
    id: string,
    data: UpdateGlAccountRequest
  ): Promise<GlAccountResponse> {
    const response = await axios.put(`/api/v1/glaccounts/${id}`, data);
    return response.data;
  },

  async deleteGlAccount(id: string): Promise<GlAccountResponse> {
    const response = await axios.delete(`/api/v1/glaccounts/${id}`);
    return response.data;
  },

  async getGlAccountStats(
    organisationId?: string
  ): Promise<GlAccountStatsResponse> {
    const params = organisationId ? { organisation_id: organisationId } : {};
    const response = await axios.get("/api/v1/glaccounts/stats", { params });
    return response.data;
  },

  // Generate GL Accounts
  async generateGlAccounts(
    data: GenerateAccountsRequest
  ): Promise<GenerateAccountsResponse> {
    const response = await axios.post("/api/v1/glaccounts/generate", data);
    return response.data;
  },
};
