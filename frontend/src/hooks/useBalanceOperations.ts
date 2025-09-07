import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BalanceOperationsService } from "../services/BalanceOperationsService";
import type {
  OrgBalanceFilters,
  PrefundRequest,
  TillTopupRequest,
  VaultTopupRequest,
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

  return useMutation({
    mutationFn: ({
      tillId,
      data,
    }: {
      tillId: string;
      data: TillTopupRequest;
    }) => BalanceOperationsService.topupTill(tillId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tills"] });
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
    },
  });
};

export const useTopupVault = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vaultId,
      data,
    }: {
      vaultId: string;
      data: VaultTopupRequest;
    }) => BalanceOperationsService.topupVault(vaultId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
    },
  });
};

export const useWithdrawTill = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tillId,
      data,
    }: {
      tillId: string;
      data: TillTopupRequest;
    }) => BalanceOperationsService.withdrawTill(tillId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tills"] });
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
    },
  });
};

export const useWithdrawVault = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      vaultId,
      data,
    }: {
      vaultId: string;
      data: VaultTopupRequest;
    }) => BalanceOperationsService.withdrawVault(vaultId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vaults"] });
      queryClient.invalidateQueries({ queryKey: ["bankAccounts"] });
    },
  });
};
