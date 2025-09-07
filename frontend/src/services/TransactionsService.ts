import axios from "./AxiosBase";
import type {
  TransactionListResponse,
  TransactionResponse,
  TransactionStatsResponse,
  CreateOutboundTransactionRequest,
  TransactionFilters,
  CancelTransactionRequest,
  ApproveTransactionRequest,
  ReverseTransactionRequest,
  OutboundTransactionResult,
} from "../types/TransactionsTypes";

export const TransactionsService = {
  // Get Transactions
  async getTransactions(
    organisationId: string,
    filters: TransactionFilters
  ): Promise<TransactionListResponse> {
    const response = await axios.get(
      `/api/v1/transactions/organisations/${organisationId}/transactions`,
      {
        params: filters,
      }
    );
    return response.data;
  },

  // Get Transaction by ID
  async getTransactionById(
    transactionId: string
  ): Promise<TransactionResponse> {
    const response = await axios.get(
      `/api/v1/transactions/transactions/${transactionId}`
    );
    return response.data;
  },

  // Get Transaction Stats
  async getTransactionStats(
    organisationId: string
  ): Promise<TransactionStatsResponse> {
    const response = await axios.get(
      `/api/v1/transactions/organisations/${organisationId}/transactions/stats`
    );
    return response.data;
  },

  // Create Outbound Transaction
  async createOutboundTransaction(
    organisationId: string,
    data: CreateOutboundTransactionRequest
  ): Promise<{
    success: boolean;
    message: string;
    data: OutboundTransactionResult;
  }> {
    const response = await axios.post(
      `/api/v1/transactions/organisations/${organisationId}/outbound`,
      data
    );
    return response.data;
  },

  // Cancel Transaction
  async cancelTransaction(
    transactionId: string,
    data: CancelTransactionRequest
  ): Promise<TransactionResponse> {
    const response = await axios.post(
      `/api/v1/transactions/transactions/${transactionId}/cancel`,
      data
    );
    return response.data;
  },

  // Approve Transaction
  async approveTransaction(
    transactionId: string,
    data: ApproveTransactionRequest
  ): Promise<TransactionResponse> {
    const response = await axios.post(
      `/api/v1/transactions/transactions/${transactionId}/approve`,
      data
    );
    return response.data;
  },

  // Reverse Transaction
  async reverseTransaction(
    transactionId: string,
    data: ReverseTransactionRequest
  ): Promise<TransactionResponse> {
    const response = await axios.post(
      `/api/v1/transactions/transactions/${transactionId}/reverse`,
      data
    );
    return response.data;
  },
};
