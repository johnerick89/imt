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
    organisationId: string,
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
      `/api/v1/chargespayments/organisations/${organisationId}/pending-charges?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Get pending charges stats
   */
  async getPendingChargesStats(
    organisationId: string
  ): Promise<ChargesPaymentStatsResponse> {
    const response = await apiClient.get(
      `/api/v1/chargespayments/organisations/${organisationId}/pending-charges-stats`
    );
    return response.data;
  }

  /**
   * Get charge payments stats
   */
  async getChargePaymentsStats(
    organisationId: string
  ): Promise<ChargesPaymentStatsResponse> {
    const response = await apiClient.get(
      `/api/v1/chargespayments/organisations/${organisationId}/charge-payments-stats`
    );
    return response.data;
  }

  /**
   * Create charges payment
   */
  async createChargesPayment(
    organisationId: string,
    data: CreateChargesPaymentRequest
  ): Promise<ChargesPaymentResponse> {
    const response = await apiClient.post(
      `/api/v1/chargespayments/organisations/${organisationId}/charges-payments`,
      data
    );
    return response.data;
  }

  /**
   * Get charges payments
   */
  async getChargesPayments(
    organisationId: string,
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
      `/api/v1/chargespayments/organisations/${organisationId}/charges-payments?${params.toString()}`
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
}

export default ChargesPaymentService;
