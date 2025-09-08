import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ChargesPaymentService from "../services/ChargesPaymentService";
import type {
  ChargesPaymentFilters,
  PendingTransactionChargesFilters,
  CreateChargesPaymentRequest,
  ApproveChargesPaymentRequest,
  ReverseChargesPaymentRequest,
} from "../types/ChargesPaymentTypes";

const chargesPaymentService = ChargesPaymentService.getInstance();

// Hook to get pending transaction charges
export const usePendingTransactionCharges = (
  organisationId: string,
  filters?: PendingTransactionChargesFilters
) => {
  return useQuery({
    queryKey: ["pendingTransactionCharges", organisationId, filters],
    queryFn: () =>
      chargesPaymentService.getPendingTransactionCharges(
        organisationId,
        filters
      ),
    enabled: !!organisationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get pending charges stats
export const usePendingChargesStats = (organisationId: string) => {
  return useQuery({
    queryKey: ["pendingChargesStats", organisationId],
    queryFn: () => chargesPaymentService.getPendingChargesStats(organisationId),
    enabled: !!organisationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get charge payments stats
export const useChargePaymentsStats = (organisationId: string) => {
  return useQuery({
    queryKey: ["chargePaymentsStats", organisationId],
    queryFn: () => chargesPaymentService.getChargePaymentsStats(organisationId),
    enabled: !!organisationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to create charges payment
export const useCreateChargesPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      organisationId,
      data,
    }: {
      organisationId: string;
      data: CreateChargesPaymentRequest;
    }) => chargesPaymentService.createChargesPayment(organisationId, data),
    onSuccess: () => {
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
  });
};

// Hook to get charges payments
export const useChargesPayments = (
  organisationId: string,
  filters?: ChargesPaymentFilters
) => {
  return useQuery({
    queryKey: ["chargesPayments", organisationId, filters],
    queryFn: () =>
      chargesPaymentService.getChargesPayments(organisationId, filters),
    enabled: !!organisationId,
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

  return useMutation({
    mutationFn: ({
      paymentId,
      data,
    }: {
      paymentId: string;
      data: ApproveChargesPaymentRequest;
    }) => chargesPaymentService.approveChargesPayment(paymentId, data),
    onSuccess: (data, variables) => {
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
      queryClient.setQueryData(["chargesPayment", variables.paymentId], data);
    },
  });
};

// Hook to reverse charges payment
export const useReverseChargesPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      paymentId,
      data,
    }: {
      paymentId: string;
      data: ReverseChargesPaymentRequest;
    }) => chargesPaymentService.reverseChargesPayment(paymentId, data),
    onSuccess: (data, variables) => {
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
      queryClient.setQueryData(["chargesPayment", variables.paymentId], data);
    },
  });
};
