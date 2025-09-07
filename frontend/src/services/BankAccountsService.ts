import axios from "./AxiosBase";
import type {
  BankAccountListResponse,
  BankAccountResponse,
  BankAccountStatsResponse,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
  BankAccountFilters,
  TopupRequest,
  WithdrawalRequest,
  BalanceOperationResponse,
} from "../types/BankAccountsTypes";

export const BankAccountsService = {
  // CRUD Operations
  async getBankAccounts(
    filters: BankAccountFilters
  ): Promise<BankAccountListResponse> {
    const response = await axios.get("/api/v1/bankaccounts", {
      params: filters,
    });
    return response.data;
  },

  async getBankAccountById(id: string): Promise<BankAccountResponse> {
    const response = await axios.get(`/api/v1/bankaccounts/${id}`);
    return response.data;
  },

  async createBankAccount(
    data: CreateBankAccountRequest
  ): Promise<BankAccountResponse> {
    const response = await axios.post("/api/v1/bankaccounts", data);
    return response.data;
  },

  async updateBankAccount(
    id: string,
    data: UpdateBankAccountRequest
  ): Promise<BankAccountResponse> {
    const response = await axios.put(`/api/v1/bankaccounts/${id}`, data);
    return response.data;
  },

  async deleteBankAccount(id: string): Promise<BankAccountResponse> {
    const response = await axios.delete(`/api/v1/bankaccounts/${id}`);
    return response.data;
  },

  async getBankAccountStats(
    organisationId?: string
  ): Promise<BankAccountStatsResponse> {
    const params = organisationId ? { organisation_id: organisationId } : {};
    const response = await axios.get("/api/v1/bankaccounts/stats", { params });
    return response.data;
  },

  // Balance Operations
  async topupBankAccount(
    id: string,
    data: TopupRequest
  ): Promise<BalanceOperationResponse> {
    const response = await axios.post(`/api/v1/bankaccounts/${id}/topup`, data);
    return response.data;
  },

  async withdrawFromBankAccount(
    id: string,
    data: WithdrawalRequest
  ): Promise<BalanceOperationResponse> {
    const response = await axios.post(
      `/api/v1/bankaccounts/${id}/withdraw`,
      data
    );
    return response.data;
  },
};
