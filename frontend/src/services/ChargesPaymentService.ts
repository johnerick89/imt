import apiClient from "./AxiosBase";
import type {
  ChargesPaymentFilters,
  PendingTransactionChargesFilters,
  ChargesPaymentListResponse,
  ChargesPaymentResponse,
  PendingTransactionChargesResponse,
  ChargesPaymentStatsResponse,
  CreateChargesPaymentRequest,
  ApproveChargesPaymentRequest,
  ReverseChargesPaymentRequest,
  PendingCommissionSplitResponse,
} from "../types/ChargesPaymentTypes";

export class ChargesPaymentService {
  private static instance: ChargesPaymentService;

  private constructor() {}

  public static getInstance(): ChargesPaymentService {
    if (!ChargesPaymentService.instance) {
      ChargesPaymentService.instance = new ChargesPaymentService();
    }
    return ChargesPaymentService.instance;
  }

  /**
   * Get pending transaction charges
   */
  async getPendingTransactionCharges(
    filters?: PendingTransactionChargesFilters
  ): Promise<PendingTransactionChargesResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(
      `/api/v1/chargespayments/pending-charges?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get pending charges stats
   */
  async getPendingChargesStats(
    filters?: PendingTransactionChargesFilters
  ): Promise<ChargesPaymentStatsResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(
      `/api/v1/chargespayments/pending-charges-stats?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get charge payments stats
   */
  async getChargePaymentsStats(
    filters?: ChargesPaymentFilters
  ): Promise<ChargesPaymentStatsResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(
      `/api/v1/chargespayments/charge-payments-stats?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Create charges payment
   */
  async createChargesPayment(
    data: CreateChargesPaymentRequest
  ): Promise<ChargesPaymentResponse> {
    const response = await apiClient.post(
      `/api/v1/chargespayments/charges-payments`,
      data
    );
    return response.data;
  }

  /**
   * Get charges payments
   */
  async getChargesPayments(
    filters?: ChargesPaymentFilters
  ): Promise<ChargesPaymentListResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(
      `/api/v1/chargespayments/charges-payments?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get charges payment by ID
   */
  async getChargesPaymentById(
    paymentId: string
  ): Promise<ChargesPaymentResponse> {
    const response = await apiClient.get(
      `/api/v1/chargespayments/charges-payments/${paymentId}`
    );
    return response.data;
  }

  /**
   * Approve charges payment
   */
  async approveChargesPayment(
    paymentId: string,
    data: ApproveChargesPaymentRequest
  ): Promise<ChargesPaymentResponse> {
    const response = await apiClient.post(
      `/api/v1/chargespayments/charges-payments/${paymentId}/approve`,
      data
    );
    return response.data;
  }

  /**
   * Reverse charges payment
   */
  async reverseChargesPayment(
    paymentId: string,
    data: ReverseChargesPaymentRequest
  ): Promise<ChargesPaymentResponse> {
    const response = await apiClient.post(
      `/api/v1/chargespayments/charges-payments/${paymentId}/reverse`,
      data
    );
    return response.data;
  }

  /**
   * Get pending commissions (commission splits)
   */
  async getPendingCommissions(
    filters?: PendingTransactionChargesFilters
  ): Promise<PendingCommissionSplitResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(
      `/api/v1/chargespayments/pending-commissions?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get pending commissions stats
   */
  async getPendingCommissionStats(
    filters?: PendingTransactionChargesFilters
  ): Promise<ChargesPaymentStatsResponse> {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString());
        }
      });
    }

    const response = await apiClient.get(
      `/api/v1/chargespayments/pending-commissions-stats?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Process commissions (commission splits to a charges payment)
   */
  async processCommissions(
    commissionSplitIds: string[]
  ): Promise<ChargesPaymentResponse> {
    const response = await apiClient.post(
      `/api/v1/chargespayments/process-commissions`,
      { commission_split_ids: commissionSplitIds }
    );
    return response.data;
  }

  /**
   * Approve commission payment
   */
  async approveCommissionPayment(
    paymentId: string,
    data: ApproveChargesPaymentRequest
  ): Promise<ChargesPaymentResponse> {
    const response = await apiClient.post(
      `/api/v1/chargespayments/commission-payments/${paymentId}/approve`,
      data
    );
    return response.data;
  }
}

export default ChargesPaymentService;
