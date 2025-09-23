import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionsService } from "../services/TransactionsService";
import type {
  TransactionFilters,
  CreateOutboundTransactionRequest,
  CancelTransactionRequest,
  ApproveTransactionRequest,
  ReverseTransactionRequest,
  MarkAsReadyRequest,
  UpdateTransactionRequest,
} from "../types/TransactionsTypes";
import { useToast } from "../contexts/ToastContext";

export const useTransactions = (
  organisationId: string,
  filters: TransactionFilters
) => {
  return useQuery({
    queryKey: ["transactions", organisationId, filters],
    queryFn: () => TransactionsService.getTransactions(organisationId, filters),
    enabled: !!organisationId,
  });
};

export const useTransactionById = (transactionId: string) => {
  return useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: () => TransactionsService.getTransactionById(transactionId),
    enabled: !!transactionId,
  });
};

export const useTransactionStats = (organisationId: string) => {
  return useQuery({
    queryKey: ["transactionStats", organisationId],
    queryFn: () => TransactionsService.getTransactionStats(organisationId),
    enabled: !!organisationId,
  });
};

export const useCreateOutboundTransaction = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      organisationId,
      data,
    }: {
      organisationId: string;
      data: CreateOutboundTransactionRequest;
    }) => TransactionsService.createOutboundTransaction(organisationId, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Outbound Transaction Created Successfully",
        response.message ||
          "The outbound transaction has been created successfully."
      );
      queryClient.invalidateQueries({
        queryKey: ["transactions", variables.organisationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["transactionStats", variables.organisationId],
      });
      queryClient.invalidateQueries({ queryKey: ["tills"] });
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create outbound transaction";
      showError("Outbound Transaction Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useCancelTransaction = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: CancelTransactionRequest;
    }) => TransactionsService.cancelTransaction(transactionId, data),
    onSuccess: (result) => {
      showSuccess(
        "Transaction Cancelled Successfully",
        result.message || "The transaction has been cancelled successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionStats"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", result.data.id],
      });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to cancel transaction";
      showError("Transaction Cancellation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useApproveTransaction = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: ApproveTransactionRequest;
    }) => TransactionsService.approveTransaction(transactionId, data),
    onSuccess: (result) => {
      showSuccess(
        "Transaction Approved Successfully",
        result.message || "The transaction has been approved successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionStats"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", result.data.id],
      });
      queryClient.invalidateQueries({ queryKey: ["glTransactions"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to approve transaction";
      showError("Transaction Approval Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useReverseTransaction = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: ReverseTransactionRequest;
    }) => TransactionsService.reverseTransaction(transactionId, data),
    onSuccess: (result) => {
      showSuccess(
        "Transaction Reversed Successfully",
        result.message || "The transaction has been reversed successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionStats"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", result.data.id],
      });
      queryClient.invalidateQueries({ queryKey: ["glTransactions"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to reverse transaction";
      showError("Transaction Reversal Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useMarkAsReady = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: MarkAsReadyRequest;
    }) => TransactionsService.markAsReady(transactionId, data),
    onSuccess: (result) => {
      showSuccess(
        "Transaction Marked as Ready",
        result.message ||
          "The transaction has been marked as ready successfully."
      );
      // Invalidate and refetch transaction queries
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", result.data.id],
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to mark transaction as ready";
      showError("Mark as Ready Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useUpdateOutboundTransaction = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: UpdateTransactionRequest;
    }) => TransactionsService.updateOutboundTransaction(transactionId, data),
    onSuccess: (result) => {
      showSuccess(
        "Transaction Updated Successfully",
        result.message || "The transaction has been updated successfully."
      );
      // Invalidate and refetch transaction queries
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", result.data.id],
      });
    },
    onError: (error) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update transaction";
      showError("Transaction Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
