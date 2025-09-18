import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import InboundTransactionService from "../services/InboundTransactionService";
import type {
  InboundTransactionFilters,
  ApproveTransactionRequest,
  ReverseTransactionRequest,
} from "../types/TransactionsTypes";
import { useToast } from "../contexts/ToastContext";

const inboundTransactionService = InboundTransactionService.getInstance();

// Hook to get inbound transactions
export const useInboundTransactions = (
  organisationId: string,
  filters?: InboundTransactionFilters
) => {
  return useQuery({
    queryKey: ["inboundTransactions", organisationId, filters],
    queryFn: () =>
      inboundTransactionService.getInboundTransactions(organisationId, filters),
    enabled: !!organisationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get a single inbound transaction
export const useInboundTransaction = (transactionId: string) => {
  return useQuery({
    queryKey: ["inboundTransaction", transactionId],
    queryFn: () =>
      inboundTransactionService.getInboundTransactionById(transactionId),
    enabled: !!transactionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get inbound transaction stats
export const useInboundTransactionStats = (organisationId: string) => {
  return useQuery({
    queryKey: ["inboundTransactionStats", organisationId],
    queryFn: () =>
      inboundTransactionService.getInboundTransactionStats(organisationId),
    enabled: !!organisationId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to approve an inbound transaction
export const useApproveInboundTransaction = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: ApproveTransactionRequest;
    }) =>
      inboundTransactionService.approveInboundTransaction(transactionId, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Inbound Transaction Approved Successfully",
        response.message ||
          "The inbound transaction has been approved successfully."
      );
      // Invalidate and refetch inbound transactions
      queryClient.invalidateQueries({
        queryKey: ["inboundTransactions"],
      });

      // Update the specific transaction in cache
      queryClient.setQueryData(
        ["inboundTransaction", variables.transactionId],
        response.data
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to approve inbound transaction";
      showError("Inbound Transaction Approval Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

// Hook to reverse an inbound transaction
export const useReverseInboundTransaction = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: ReverseTransactionRequest;
    }) =>
      inboundTransactionService.reverseInboundTransaction(transactionId, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Inbound Transaction Reversed Successfully",
        response.message ||
          "The inbound transaction has been reversed successfully."
      );
      // Invalidate and refetch inbound transactions
      queryClient.invalidateQueries({
        queryKey: ["inboundTransactions"],
      });

      // Update the specific transaction in cache
      queryClient.setQueryData(
        ["inboundTransaction", variables.transactionId],
        response.data
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reverse inbound transaction";
      showError("Inbound Transaction Reversal Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
