import axios from "./AxiosBase";
import type {
  GlTransactionListResponse,
  GlTransactionResponse,
  GlTransactionStatsResponse,
  GlTransactionFilters,
  ReverseGlTransactionRequest,
  ReverseGlTransactionResponse,
} from "../types/GlTransactionsTypes";

export const GlTransactionsService = {
  // Get GL Transactions
  async getGlTransactions(
    organisationId: string,
    filters: GlTransactionFilters
  ): Promise<GlTransactionListResponse> {
    const response = await axios.get(
      `/organisations/${organisationId}/gltransactions`,
      {
        params: filters,
      }
    );
    return response.data;
  },

  // Get GL Transaction by ID
  async getGlTransactionById(
    organisationId: string,
    transactionId: string
  ): Promise<GlTransactionResponse> {
    const response = await axios.get(
      `/organisations/${organisationId}/gltransactions/${transactionId}`
    );
    return response.data;
  },

  // Get GL Transaction Stats
  async getGlTransactionStats(
    organisationId: string
  ): Promise<GlTransactionStatsResponse> {
    const response = await axios.get(
      `/organisations/${organisationId}/gltransactions/stats`
    );
    return response.data;
  },

  // Reverse GL Transaction
  async reverseGlTransaction(
    organisationId: string,
    transactionId: string,
    data: ReverseGlTransactionRequest
  ): Promise<ReverseGlTransactionResponse> {
    const response = await axios.post(
      `/organisations/${organisationId}/gltransactions/${transactionId}/reverse`,
      data
    );
    return response.data;
  },
};
