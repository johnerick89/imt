import apiClient from "./AxiosBase";
import type {
  OrgBalanceListResponse,
  OrgBalanceStatsResponse,
  OrgBalanceResponse,
  BalanceOperationResponse,
  BalanceHistoryResponse,
  OrgBalanceFilters,
  BalanceHistoryFilters,
  PrefundRequest,
  TillTopupRequest,
  VaultTopupRequest,
  OpeningBalanceRequest,
  AgencyFloatRequest,
} from "../types/BalanceOperationsTypes";

export const BalanceOperationsService = {
  // Organisation Balance Operations
  async getOrgBalances(
    filters: OrgBalanceFilters
  ): Promise<OrgBalanceListResponse> {
    const response = await apiClient.get(
      "/api/v1/balance/organisations/balances",
      {
        params: filters,
      }
    );
    return response.data;
  },

  async getOrgBalanceStats(
    organisationId?: string
  ): Promise<OrgBalanceStatsResponse> {
    const params = organisationId ? { organisation_id: organisationId } : {};
    const response = await apiClient.get(
      "/api/v1/balance/organisations/balances/stats",
      {
        params,
      }
    );
    return response.data;
  },

  async prefundOrganisation(
    orgId: string,
    data: PrefundRequest
  ): Promise<BalanceOperationResponse> {
    const response = await apiClient.post(
      `/api/v1/balance/organisations/${orgId}/prefund`,
      data
    );
    return response.data;
  },

  // Till Balance Operations
  async topupTill(
    tillId: string,
    data: TillTopupRequest
  ): Promise<BalanceOperationResponse> {
    const response = await apiClient.post(
      `/api/v1/balance/tills/${tillId}/topup`,
      data
    );
    return response.data;
  },

  async withdrawTill(
    tillId: string,
    data: TillTopupRequest
  ): Promise<BalanceOperationResponse> {
    const response = await apiClient.post(
      `/api/v1/balance/tills/${tillId}/withdraw`,
      data
    );
    return response.data;
  },

  // Vault Balance Operations
  async topupVault(
    vaultId: string,
    data: VaultTopupRequest
  ): Promise<BalanceOperationResponse> {
    const response = await apiClient.post(
      `/api/v1/balance/vaults/${vaultId}/topup`,
      data
    );
    return response.data;
  },

  async withdrawVault(
    vaultId: string,
    data: VaultTopupRequest
  ): Promise<BalanceOperationResponse> {
    const response = await apiClient.post(
      `/api/v1/balance/vaults/${vaultId}/withdraw`,
      data
    );
    return response.data;
  },

  // Balance History Operations
  async getOrgBalanceHistory(
    orgId: string,
    filters: BalanceHistoryFilters = {}
  ): Promise<BalanceHistoryResponse> {
    const response = await apiClient.get(
      `/api/v1/balance/organisations/${orgId}/balance-history`,
      { params: filters }
    );
    return response.data;
  },

  async getTillBalanceHistory(
    tillId: string,
    filters: BalanceHistoryFilters = {}
  ): Promise<BalanceHistoryResponse> {
    const response = await apiClient.get(
      `/api/v1/balance/tills/${tillId}/balance-history`,
      { params: filters }
    );
    return response.data;
  },

  async getVaultBalanceHistory(
    vaultId: string,
    filters: BalanceHistoryFilters = {}
  ): Promise<BalanceHistoryResponse> {
    const response = await apiClient.get(
      `/api/v1/balance/vaults/${vaultId}/balance-history`,
      { params: filters }
    );
    return response.data;
  },

  // Opening Balance Operations
  async setOpeningBalance(
    orgId: string,
    data: OpeningBalanceRequest
  ): Promise<BalanceOperationResponse> {
    const response = await apiClient.post(
      `/api/v1/balance/organisations/${orgId}/opening-balance`,
      data
    );
    return response.data;
  },

  // Agency Float Balance Operations
  async createAgencyFloat(
    data: AgencyFloatRequest
  ): Promise<OrgBalanceResponse> {
    const response = await apiClient.post(
      `/api/v1/balance/organisations/agency-float`,
      data
    );
    return response.data;
  },

  async updateFloatLimit(
    balanceId: string,
    limit: number
  ): Promise<OrgBalanceResponse> {
    const response = await apiClient.patch(
      `/api/v1/balance/organisations/balances/${balanceId}/limit`,
      { limit }
    );
    return response.data;
  },
};
