import AxiosBase from "./AxiosBase";
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
  private axiosBase;

  private constructor() {
    this.axiosBase = AxiosBase;
  }

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
    try {
      const params = new URLSearchParams();

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.append(key, value.toString());
          }
        });
      }

      const response = await this.axiosBase.get(
        `/api/v1/transactions/organisations/${organisationId}/inbound?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching inbound transactions:", error);
      throw error;
    }
  }

  /**
   * Get a single inbound transaction by ID
   */
  async getInboundTransactionById(
    transactionId: string
  ): Promise<InboundTransactionResponse> {
    try {
      const response = await this.axiosBase.get(
        `/api/v1/transactions/inbound/${transactionId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching inbound transaction:", error);
      throw error;
    }
  }

  /**
   * Approve an inbound transaction
   */
  async approveInboundTransaction(
    transactionId: string,
    data: ApproveTransactionRequest
  ): Promise<InboundTransactionResponse> {
    try {
      const response = await this.axiosBase.post(
        `/api/v1/transactions/inbound/${transactionId}/approve`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error approving inbound transaction:", error);
      throw error;
    }
  }

  /**
   * Reverse an inbound transaction
   */
  async reverseInboundTransaction(
    transactionId: string,
    data: ReverseTransactionRequest
  ): Promise<InboundTransactionResponse> {
    try {
      const response = await this.axiosBase.post(
        `/api/v1/transactions/inbound/${transactionId}/reverse`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error reversing inbound transaction:", error);
      throw error;
    }
  }

  /**
   * Get inbound transaction stats for an organisation
   */
  async getInboundTransactionStats(
    organisationId: string
  ): Promise<InboundTransactionStatsResponse> {
    try {
      const response = await this.axiosBase.get(
        `/api/v1/transactions/organisations/${organisationId}/inbound/stats`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching inbound transaction stats:", error);
      throw error;
    }
  }
}

export default InboundTransactionService;
