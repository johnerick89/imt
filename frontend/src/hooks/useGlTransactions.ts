import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlTransactionsService } from "../services/GlTransactionsService";
import type {
  GlTransactionFilters,
  ReverseGlTransactionRequest,
} from "../types/GlTransactionsTypes";
import { useToast } from "../contexts/ToastContext";

export const useGlTransactions = (
  organisationId: string,
  filters: GlTransactionFilters
) => {
  return useQuery({
    queryKey: ["glTransactions", organisationId, filters],
    queryFn: () =>
      GlTransactionsService.getGlTransactions(organisationId, filters),
    enabled: !!organisationId,
  });
};

export const useGlTransactionById = (
  organisationId: string,
  transactionId: string
) => {
  return useQuery({
    queryKey: ["glTransaction", organisationId, transactionId],
    queryFn: () =>
      GlTransactionsService.getGlTransactionById(organisationId, transactionId),
    enabled: !!organisationId && !!transactionId,
  });
};

export const useGlTransactionStats = (organisationId: string) => {
  return useQuery({
    queryKey: ["glTransactionStats", organisationId],
    queryFn: () => GlTransactionsService.getGlTransactionStats(organisationId),
    enabled: !!organisationId,
  });
};

export const useReverseGlTransaction = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      organisationId,
      transactionId,
      data,
    }: {
      organisationId: string;
      transactionId: string;
      data: ReverseGlTransactionRequest;
    }) =>
      GlTransactionsService.reverseGlTransaction(
        organisationId,
        transactionId,
        data
      ),
    onSuccess: (response, variables) => {
      showSuccess(
        "GL Transaction Reversed Successfully",
        response.message || "The GL transaction has been reversed successfully."
      );
      queryClient.invalidateQueries({
        queryKey: ["glTransactions", variables.organisationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["glTransactionStats", variables.organisationId],
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reverse GL transaction";
      showError("GL Transaction Reversal Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
