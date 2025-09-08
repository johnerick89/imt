import AxiosBase from "./AxiosBase";
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
  private axiosBase;

  private constructor() {
    this.axiosBase = AxiosBase;
  }

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
        `/api/v1/chargespayments/organisations/${organisationId}/pending-charges?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending transaction charges:", error);
      throw error;
    }
  }

  /**
   * Get pending charges stats
   */
  async getPendingChargesStats(
    organisationId: string
  ): Promise<ChargesPaymentStatsResponse> {
    try {
      const response = await this.axiosBase.get(
        `/api/v1/chargespayments/organisations/${organisationId}/pending-charges-stats`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching pending charges stats:", error);
      throw error;
    }
  }

  /**
   * Get charge payments stats
   */
  async getChargePaymentsStats(
    organisationId: string
  ): Promise<ChargesPaymentStatsResponse> {
    try {
      const response = await this.axiosBase.get(
        `/api/v1/chargespayments/organisations/${organisationId}/charge-payments-stats`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching charge payments stats:", error);
      throw error;
    }
  }

  /**
   * Create charges payment
   */
  async createChargesPayment(
    organisationId: string,
    data: CreateChargesPaymentRequest
  ): Promise<ChargesPaymentResponse> {
    try {
      const response = await this.axiosBase.post(
        `/api/v1/chargespayments/organisations/${organisationId}/charges-payments`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error creating charges payment:", error);
      throw error;
    }
  }

  /**
   * Get charges payments
   */
  async getChargesPayments(
    organisationId: string,
    filters?: ChargesPaymentFilters
  ): Promise<ChargesPaymentListResponse> {
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
        `/api/v1/chargespayments/organisations/${organisationId}/charges-payments?${params.toString()}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching charges payments:", error);
      throw error;
    }
  }

  /**
   * Get charges payment by ID
   */
  async getChargesPaymentById(
    paymentId: string
  ): Promise<ChargesPaymentResponse> {
    try {
      const response = await this.axiosBase.get(
        `/api/v1/chargespayments/charges-payments/${paymentId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching charges payment:", error);
      throw error;
    }
  }

  /**
   * Approve charges payment
   */
  async approveChargesPayment(
    paymentId: string,
    data: ApproveChargesPaymentRequest
  ): Promise<ChargesPaymentResponse> {
    try {
      const response = await this.axiosBase.post(
        `/api/v1/chargespayments/charges-payments/${paymentId}/approve`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error approving charges payment:", error);
      throw error;
    }
  }

  /**
   * Reverse charges payment
   */
  async reverseChargesPayment(
    paymentId: string,
    data: ReverseChargesPaymentRequest
  ): Promise<ChargesPaymentResponse> {
    try {
      const response = await this.axiosBase.post(
        `/api/v1/chargespayments/charges-payments/${paymentId}/reverse`,
        data
      );
      return response.data;
    } catch (error) {
      console.error("Error reversing charges payment:", error);
      throw error;
    }
  }
}

export default ChargesPaymentService;
