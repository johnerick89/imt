import apiClient from "./AxiosBase";
import type {
  InboundTransactionFilters,
  InboundTransactionListResponse,
  InboundTransactionResponse,
  InboundTransactionStatsResponse,
  ApproveTransactionRequest,
  ReverseTransactionRequest,
} from "../types/TransactionsTypes";

export class InboundTransactionService {
  private static instance: InboundTransactionService;

  private constructor() {}

  public static getInstance(): InboundTransactionService {
    if (!InboundTransactionService.instance) {
      InboundTransactionService.instance = new InboundTransactionService();
    }
    return InboundTransactionService.instance;
  }

  /**
   * Get inbound transactions for an organisation
   */
  async getInboundTransactions(
    organisationId: string,
    filters?: InboundTransactionFilters
  ): Promise<InboundTransactionListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(
      `/api/v1/transactions/organisations/${organisationId}/inbound?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get inbound transaction by ID
   */
  async getInboundTransactionById(
    transactionId: string
  ): Promise<InboundTransactionResponse> {
    const response = await apiClient.get(
      `/api/v1/transactions/inbound/${transactionId}`
    );
    return response.data;
  }

  /**
   * Get inbound transaction stats
   */
  async getInboundTransactionStats(
    organisationId: string
  ): Promise<InboundTransactionStatsResponse> {
    const response = await apiClient.get(
      `/api/v1/transactions/organisations/${organisationId}/inbound-stats`
    );
    return response.data;
  }

  /**
   * Approve inbound transaction
   */
  async approveInboundTransaction(
    transactionId: string,
    data: ApproveTransactionRequest
  ): Promise<InboundTransactionResponse> {
    const response = await apiClient.post(
      `/api/v1/transactions/inbound/${transactionId}/approve`,
      data
    );
    return response.data;
  }

  /**
   * Reverse inbound transaction
   */
  async reverseInboundTransaction(
    transactionId: string,
    data: ReverseTransactionRequest
  ): Promise<InboundTransactionResponse> {
    const response = await apiClient.post(
      `/api/v1/transactions/inbound/${transactionId}/reverse`,
      data
    );
    return response.data;
  }
}

export default InboundTransactionService;
