import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BankAccountsService } from "../services/BankAccountsService";
import type {
  BankAccountFilters,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
  TopupRequest,
  WithdrawalRequest,
} from "../types/BankAccountsTypes";

export const useBankAccounts = (filters: BankAccountFilters) => {
  return useQuery({
    queryKey: ["bankAccounts", filters],
    queryFn: () => BankAccountsService.getBankAccounts(filters),
  });
};

export const useBankAccountById = (id: string) => {
  return useQuery({
    queryKey: ["bankAccount", id],
    queryFn: () => BankAccountsService.getBankAccountById(id),
    enabled: !!id,
  });
};

export const useBankAccountStats = (organisationId?: string) => {
  return useQuery({
    queryKey: ["bankAccountStats", organisationId],
    queryFn: () => BankAccountsService.getBankAccountStats(organisationId),
  });
};

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBankAccountRequest) =>
      BankAccountsService.createBankAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccountStats"] });
    },
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBankAccountRequest;
    }) => BankAccountsService.updateBankAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      queryClient.invalidateQueries({
        queryKey: ["bankAccount", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["bankAccountStats"] });
    },
  });
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => BankAccountsService.deleteBankAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccountStats"] });
    },
  });
};

export const useTopupBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TopupRequest }) =>
      BankAccountsService.topupBankAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      queryClient.invalidateQueries({
        queryKey: ["bankAccount", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["bankAccountStats"] });
    },
  });
};

export const useWithdrawFromBankAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WithdrawalRequest }) =>
      BankAccountsService.withdrawFromBankAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      queryClient.invalidateQueries({
        queryKey: ["bankAccount", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["bankAccountStats"] });
    },
  });
};
