import axios from "./AxiosBase";
import type {
  OrgBalanceListResponse,
  OrgBalanceStatsResponse,
  BalanceOperationResponse,
  OrgBalanceFilters,
  PrefundRequest,
  TillTopupRequest,
  VaultTopupRequest,
} from "../types/BalanceOperationsTypes";

export const BalanceOperationsService = {
  // Organisation Balance Operations
  async getOrgBalances(
    filters: OrgBalanceFilters
  ): Promise<OrgBalanceListResponse> {
    const response = await axios.get("/api/v1/balance/organisations/balances", {
      params: filters,
    });
    return response.data;
  },

  async getOrgBalanceStats(
    organisationId?: string
  ): Promise<OrgBalanceStatsResponse> {
    const params = organisationId ? { organisation_id: organisationId } : {};
    const response = await axios.get(
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
    const response = await axios.post(
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
    const response = await axios.post(
      `/api/v1/balance/tills/${tillId}/topup`,
      data
    );
    return response.data;
  },

  async withdrawTill(
    tillId: string,
    data: TillTopupRequest
  ): Promise<BalanceOperationResponse> {
    const response = await axios.post(
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
    const response = await axios.post(
      `/api/v1/balance/vaults/${vaultId}/topup`,
      data
    );
    return response.data;
  },

  async withdrawVault(
    vaultId: string,
    data: VaultTopupRequest
  ): Promise<BalanceOperationResponse> {
    const response = await axios.post(
      `/api/v1/balance/vaults/${vaultId}/withdraw`,
      data
    );
    return response.data;
  },
};
