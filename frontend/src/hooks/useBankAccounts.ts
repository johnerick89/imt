import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BankAccountsService } from "../services/BankAccountsService";
import type {
  BankAccountFilters,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
  TopupRequest,
  WithdrawalRequest,
} from "../types/BankAccountsTypes";
import { useToast } from "../contexts/ToastContext";

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
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (data: CreateBankAccountRequest) =>
      BankAccountsService.createBankAccount(data),
    onSuccess: (response) => {
      showSuccess(
        "Bank Account Created Successfully",
        response.message || "The bank account has been created successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccountStats"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create bank account";
      showError("Bank Account Creation Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateBankAccountRequest;
    }) => BankAccountsService.updateBankAccount(id, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Bank Account Updated Successfully",
        response.message || "The bank account has been updated successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      queryClient.invalidateQueries({
        queryKey: ["bankAccount", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["bankAccountStats"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update bank account";
      showError("Bank Account Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: (id: string) => BankAccountsService.deleteBankAccount(id),
    onSuccess: (response) => {
      showSuccess(
        "Bank Account Deleted Successfully",
        response.message || "The bank account has been deleted successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccountStats"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete bank account";
      showError("Bank Account Deletion Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useTopupBankAccount = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TopupRequest }) =>
      BankAccountsService.topupBankAccount(id, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Bank Account Topped Up Successfully",
        response.message || "The bank account has been topped up successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      queryClient.invalidateQueries({
        queryKey: ["bankAccount", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["bankAccountStats"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to top up bank account";
      showError("Bank Account Topup Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

export const useWithdrawFromBankAccount = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: WithdrawalRequest }) =>
      BankAccountsService.withdrawFromBankAccount(id, data),
    onSuccess: (response, variables) => {
      showSuccess(
        "Bank Account Withdrawn Successfully",
        response.message || "The bank account has been withdrawn successfully."
      );
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      queryClient.invalidateQueries({
        queryKey: ["bankAccount", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["bankAccountStats"] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to withdraw from bank account";
      showError("Bank Account Withdrawal Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
