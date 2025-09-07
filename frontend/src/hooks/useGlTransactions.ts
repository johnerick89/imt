import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GlTransactionsService } from "../services/GlTransactionsService";
import type {
  GlTransactionFilters,
  ReverseGlTransactionRequest,
} from "../types/GlTransactionsTypes";

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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["glTransactions", variables.organisationId],
      });
      queryClient.invalidateQueries({
        queryKey: ["glTransactionStats", variables.organisationId],
      });
    },
  });
};
