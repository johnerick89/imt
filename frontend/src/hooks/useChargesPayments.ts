import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ChargesPaymentService from "../services/ChargesPaymentService";
import type {
  ChargesPaymentFilters,
  PendingTransactionChargesFilters,
  CreateChargesPaymentRequest,
  ApproveChargesPaymentRequest,
  ReverseChargesPaymentRequest,
} from "../types/ChargesPaymentTypes";
import { useToast } from "../contexts/ToastContext";

const chargesPaymentService = ChargesPaymentService.getInstance();

// Hook to get pending transaction charges
export const usePendingTransactionCharges = (
  filters?: PendingTransactionChargesFilters
) => {
  return useQuery({
    queryKey: ["pendingTransactionCharges", filters],
    queryFn: () => chargesPaymentService.getPendingTransactionCharges(filters),
    enabled: !!filters?.organisation_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get pending charges stats
export const usePendingChargesStats = (
  filters?: PendingTransactionChargesFilters
) => {
  return useQuery({
    queryKey: ["pendingChargesStats", filters],
    queryFn: () => chargesPaymentService.getPendingChargesStats(filters),
    enabled: !!filters?.organisation_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get charge payments stats
export const useChargePaymentsStats = (filters?: ChargesPaymentFilters) => {
  return useQuery({
    queryKey: ["chargePaymentsStats", filters],
    queryFn: () => chargesPaymentService.getChargePaymentsStats(filters),
    enabled: !!filters?.organisation_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create charges payment
export const useCreateChargesPayment = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (data: CreateChargesPaymentRequest) =>
      chargesPaymentService.createChargesPayment(data),
    onSuccess: (response) => {
      showSuccess(
        "Charges Payment Created Successfully",
        response.message || "The charges payment has been created successfully."
      );
      // Invalidate and refetch pending charges and stats
      queryClient.invalidateQueries({
        queryKey: ["pendingTransactionCharges"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pendingChargesStats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["chargePaymentsStats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["chargesPayments"],
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create charges payment";
      showError("Charges Payment Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

// Hook to get charges payments
export const useChargesPayments = (filters?: ChargesPaymentFilters) => {
  return useQuery({
    queryKey: ["chargesPayments", filters],
    queryFn: () => chargesPaymentService.getChargesPayments(filters),
    enabled: !!filters?.organisation_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get a single charges payment
export const useChargesPayment = (paymentId: string) => {
  return useQuery({
    queryKey: ["chargesPayment", paymentId],
    queryFn: () => chargesPaymentService.getChargesPaymentById(paymentId),
    enabled: !!paymentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to approve charges payment
export const useApproveChargesPayment = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      paymentId,
      data,
    }: {
      paymentId: string;
      data: ApproveChargesPaymentRequest;
    }) => chargesPaymentService.approveChargesPayment(paymentId, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Charges Payment Approved Successfully",
        response.message ||
          "The charges payment has been approved successfully."
      );
      // Invalidate and refetch charges payments
      queryClient.invalidateQueries({
        queryKey: ["chargesPayments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pendingChargesStats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["chargePaymentsStats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pendingTransactionCharges"],
      });

      // Update the specific payment in cache
      queryClient.setQueryData(
        ["chargesPayment", variables.paymentId],
        response.data
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to approve charges payment";
      showError("Charges Payment Approval Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

// Hook to reverse charges payment
export const useReverseChargesPayment = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      paymentId,
      data,
    }: {
      paymentId: string;
      data: ReverseChargesPaymentRequest;
    }) => chargesPaymentService.reverseChargesPayment(paymentId, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Charges Payment Reversed Successfully",
        response.message ||
          "The charges payment has been reversed successfully."
      );
      // Invalidate and refetch charges payments
      queryClient.invalidateQueries({
        queryKey: ["chargesPayments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pendingChargesStats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["chargePaymentsStats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pendingTransactionCharges"],
      });

      // Update the specific payment in cache
      queryClient.setQueryData(
        ["chargesPayment", variables.paymentId],
        response.data
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reverse charges payment";
      showError("Charges Payment Reversal Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
