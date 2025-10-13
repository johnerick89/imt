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
  AgencyFloatRequest,
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
  const { showError, showSuccess } = useToast();

  return useMutation({
    mutationFn: ({ orgId, data }: { orgId: string; data: PrefundRequest }) =>
      BalanceOperationsService.prefundOrganisation(orgId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["orgBalances"] });
      queryClient.invalidateQueries({ queryKey: ["orgBalanceStats"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      showSuccess(
        "Organisation Prefunded Successfully",
        response.message || "The organisation has been prefunded successfully."
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to prefund organisation";
      showError("Prefund Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
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
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to top up till";
      showError("Topup Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
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
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to top up vault";
      showError("Topup Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
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
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to withdraw from till";
      showError("Withdrawal Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
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
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to withdraw from vault";
      showError("Withdrawal Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
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
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({
      orgId,
      data,
    }: {
      orgId: string;
      data: OpeningBalanceRequest;
    }) => BalanceOperationsService.setOpeningBalance(orgId, data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["orgBalances"] });
      queryClient.invalidateQueries({ queryKey: ["orgBalanceStats"] });
      queryClient.invalidateQueries({ queryKey: ["organisations"] });
      showSuccess(
        "Opening Balance Set Successfully",
        response.message || "The opening balance has been set successfully."
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to set opening balance";
      showError("Opening Balance Set Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

// Agency Float Balance Hook
export const useCreateAgencyFloat = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: (data: AgencyFloatRequest) =>
      BalanceOperationsService.createAgencyFloat(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["orgBalances"] });
      queryClient.invalidateQueries({ queryKey: ["orgBalanceStats"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
      showSuccess(
        "Agency Float Added Successfully",
        response.message || "The agency float has been added successfully."
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add agency float";
      showError("Agency Float Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};

// Update Float Limit Hook
export const useUpdateFloatLimit = () => {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  return useMutation({
    mutationFn: ({ balanceId, limit }: { balanceId: string; limit: number }) =>
      BalanceOperationsService.updateFloatLimit(balanceId, limit),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["orgBalances"] });
      queryClient.invalidateQueries({ queryKey: ["orgBalanceStats"] });
      showSuccess(
        "Float Limit Updated Successfully",
        response.message || "The float limit has been updated successfully."
      );
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update float limit";
      showError("Update Failed", errorMessage);
      return {
        success: false,
        message: errorMessage,
        error,
      };
    },
  });
};
