import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransactionsService } from "../services/TransactionsService";
import type {
  TransactionFilters,
  CreateOutboundTransactionRequest,
  CancelTransactionRequest,
  ApproveTransactionRequest,
  ReverseTransactionRequest,
} from "../types/TransactionsTypes";

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

  return useMutation({
    mutationFn: ({
      organisationId,
      data,
    }: {
      organisationId: string;
      data: CreateOutboundTransactionRequest;
    }) => TransactionsService.createOutboundTransaction(organisationId, data),
    onSuccess: (_, variables) => {
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
  });
};

export const useCancelTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: CancelTransactionRequest;
    }) => TransactionsService.cancelTransaction(transactionId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionStats"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", result.data.id],
      });
    },
  });
};

export const useApproveTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: ApproveTransactionRequest;
    }) => TransactionsService.approveTransaction(transactionId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionStats"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", result.data.id],
      });
      queryClient.invalidateQueries({ queryKey: ["glTransactions"] });
    },
  });
};

export const useReverseTransaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      transactionId,
      data,
    }: {
      transactionId: string;
      data: ReverseTransactionRequest;
    }) => TransactionsService.reverseTransaction(transactionId, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["transactionStats"] });
      queryClient.invalidateQueries({
        queryKey: ["transaction", result.data.id],
      });
      queryClient.invalidateQueries({ queryKey: ["glTransactions"] });
    },
  });
};
