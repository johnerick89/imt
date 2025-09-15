import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import TransactionChannelsService from "../services/TransactionChannelsService";
import type {
  TransactionChannelFilters,
  CreateTransactionChannelRequest,
  UpdateTransactionChannelRequest,
} from "../types/TransactionChannelsTypes";

// Query hooks
export const useTransactionChannels = (
  filters: TransactionChannelFilters = {}
) => {
  return useQuery({
    queryKey: ["transactionChannels", filters],
    queryFn: () => TransactionChannelsService.getTransactionChannels(filters),
  });
};

export const useTransactionChannelById = (id: string) => {
  return useQuery({
    queryKey: ["transactionChannel", id],
    queryFn: () => TransactionChannelsService.getTransactionChannelById(id),
    enabled: !!id,
  });
};

// Mutation hooks
export const useCreateTransactionChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionChannelRequest) =>
      TransactionChannelsService.createTransactionChannel(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactionChannels"] });
    },
  });
};

export const useUpdateTransactionChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransactionChannelRequest;
    }) => TransactionChannelsService.updateTransactionChannel(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["transactionChannels"] });
      queryClient.invalidateQueries({ queryKey: ["transactionChannel", id] });
    },
  });
};

export const useDeleteTransactionChannel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      TransactionChannelsService.deleteTransactionChannel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactionChannels"] });
    },
  });
};
