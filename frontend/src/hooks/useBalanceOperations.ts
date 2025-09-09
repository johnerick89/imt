import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BalanceOperationsService } from "../services/BalanceOperationsService";
import { useToast } from "../contexts/ToastContext";
import type {
  OrgBalanceFilters,
  BalanceHistoryFilters,
  PrefundRequest,
  TillTopupRequest,
  VaultTopupRequest,
  OpeningBalanceRequest,
} from "../types/BalanceOperationsTypes";

export const useOrgBalances = (filters: OrgBalanceFilters) => {
  return useQuery({
    queryKey: ["orgBalances", filters],
    queryFn: () => BalanceOperationsService.getOrgBalances(filters),
  });
};

export const useOrgBalanceStats = (organisationId?: string) => {
  return useQuery({
    queryKey: ["orgBalanceStats", organisationId],
    queryFn: () => BalanceOperationsService.getOrgBalanceStats(organisationId),
  });
};

export const usePrefundOrganisation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: PrefundRequest }) =>
      BalanceOperationsService.prefundOrganisation(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgBalances"] });
      queryClient.invalidateQueries({ queryKey: ["orgBalanceStats"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
    },
  });
};

export const useTopupTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      tillId,
      data,
    }: {
      tillId: string;
      data: TillTopupRequest;
    }) => BalanceOperationsService.topupTill(tillId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["tills"] });
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
      showSuccess(
        "Till Topped Up Successfully",
        response.message || "The till has been topped up successfully."
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to top up till";
      showError("Topup Failed", errorMessage);
    },
  });
};

export const useTopupVault = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      vaultId,
      data,
    }: {
      vaultId: string;
      data: VaultTopupRequest;
    }) => BalanceOperationsService.topupVault(vaultId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      showSuccess(
        "Vault Topped Up Successfully",
        response.message || "The vault has been topped up successfully."
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to top up vault";
      showError("Topup Failed", errorMessage);
    },
  });
};

export const useWithdrawTill = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      tillId,
      data,
    }: {
      tillId: string;
      data: TillTopupRequest;
    }) => BalanceOperationsService.withdrawTill(tillId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["tills"] });
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
      showSuccess(
        "Withdrawal Successful",
        response.message ||
          "Amount has been withdrawn from the till successfully."
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to withdraw from till";
      showError("Withdrawal Failed", errorMessage);
    },
  });
};

export const useWithdrawVault = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      vaultId,
      data,
    }: {
      vaultId: string;
      data: VaultTopupRequest;
    }) => BalanceOperationsService.withdrawVault(vaultId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      showSuccess(
        "Withdrawal Successful",
        response.message ||
          "Amount has been withdrawn from the vault successfully."
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to withdraw from vault";
      showError("Withdrawal Failed", errorMessage);
    },
  });
};

// Balance History Hooks
export const useOrgBalanceHistory = (
  orgId: string,
  filters: BalanceHistoryFilters = {}
) => {
  return useQuery({
    queryKey: ["orgBalanceHistory", orgId, filters],
    queryFn: () =>
      BalanceOperationsService.getOrgBalanceHistory(orgId, filters),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTillBalanceHistory = (
  tillId: string,
  filters: BalanceHistoryFilters = {}
) => {
  return useQuery({
    queryKey: ["tillBalanceHistory", tillId, filters],
    queryFn: () =>
      BalanceOperationsService.getTillBalanceHistory(tillId, filters),
    enabled: !!tillId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVaultBalanceHistory = (
  vaultId: string,
  filters: BalanceHistoryFilters = {}
) => {
  return useQuery({
    queryKey: ["vaultBalanceHistory", vaultId, filters],
    queryFn: () =>
      BalanceOperationsService.getVaultBalanceHistory(vaultId, filters),
    enabled: !!vaultId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Opening Balance Hook
export const useSetOpeningBalance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      orgId,
      data,
    }: {
      orgId: string;
      data: OpeningBalanceRequest;
    }) => BalanceOperationsService.setOpeningBalance(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orgBalances"] });
      queryClient.invalidateQueries({ queryKey: ["orgBalanceStats"] });
      queryClient.invalidateQueries({ queryKey: ["organisations"] });
    },
  });
};
