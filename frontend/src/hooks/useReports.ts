import { useQuery } from "@tanstack/react-query";
import { ReportsService } from "../services/ReportsService";
import type {
  BaseReportFilters,
  OutboundTransactionsReportFilters,
  InboundTransactionsReportFilters,
  CommissionsReportFilters,
  TaxesReportFilters,
  UserTillsReportFilters,
  BalancesHistoryReportFilters,
  GlAccountsReportFilters,
  PartnerBalancesReportFilters,
  ComplianceReportFilters,
  ExchangeRatesReportFilters,
  AuditTrailReportFilters,
  CorridorPerformanceReportFilters,
  UserPerformanceReportFilters,
  IntegrationStatusReportFilters,
  CashPositionReportFilters,
} from "../types/ReportsTypes";

// Outbound Transactions Report
export const useOutboundTransactionsReport = (
  filters: OutboundTransactionsReportFilters
) => {
  return useQuery({
    queryKey: ["outboundTransactionsReport", filters],
    queryFn: () => ReportsService.getOutboundTransactionsReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Inbound Transactions Report
export const useInboundTransactionsReport = (
  filters: InboundTransactionsReportFilters
) => {
  return useQuery({
    queryKey: ["inboundTransactionsReport", filters],
    queryFn: () => ReportsService.getInboundTransactionsReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Commissions & Other Revenues Report
export const useCommissionsReport = (filters: CommissionsReportFilters) => {
  return useQuery({
    queryKey: ["commissionsReport", filters],
    queryFn: () => ReportsService.getCommissionsReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Taxes Report
export const useTaxesReport = (filters: TaxesReportFilters) => {
  return useQuery({
    queryKey: ["taxesReport", filters],
    queryFn: () => ReportsService.getTaxesReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// User Tills Report
export const useUserTillsReport = (filters: UserTillsReportFilters) => {
  return useQuery({
    queryKey: ["userTillsReport", filters],
    queryFn: () => ReportsService.getUserTillsReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Balances History Report
export const useBalancesHistoryReport = (
  filters: BalancesHistoryReportFilters
) => {
  return useQuery({
    queryKey: ["balancesHistoryReport", filters],
    queryFn: () => ReportsService.getBalancesHistoryReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// GL Accounts Report
export const useGlAccountsReport = (filters: GlAccountsReportFilters) => {
  return useQuery({
    queryKey: ["glAccountsReport", filters],
    queryFn: () => ReportsService.getGlAccountsReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Profit and Loss Report
export const useProfitLossReport = (filters: BaseReportFilters) => {
  return useQuery({
    queryKey: ["profitLossReport", filters],
    queryFn: () => ReportsService.getProfitLossReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Balance Sheet Report
export const useBalanceSheetReport = (filters: BaseReportFilters) => {
  return useQuery({
    queryKey: ["balanceSheetReport", filters],
    queryFn: () => ReportsService.getBalanceSheetReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Partner Balances Report
export const usePartnerBalancesReport = (
  filters: PartnerBalancesReportFilters
) => {
  return useQuery({
    queryKey: ["partnerBalancesReport", filters],
    queryFn: () => ReportsService.getPartnerBalancesReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Customer and Beneficiary Compliance Report
export const useComplianceReport = (filters: ComplianceReportFilters) => {
  return useQuery({
    queryKey: ["complianceReport", filters],
    queryFn: () => ReportsService.getComplianceReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Exchange Rates Report
export const useExchangeRatesReport = (filters: ExchangeRatesReportFilters) => {
  return useQuery({
    queryKey: ["exchangeRatesReport", filters],
    queryFn: () => ReportsService.getExchangeRatesReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Audit Trail Report
export const useAuditTrailReport = (filters: AuditTrailReportFilters) => {
  return useQuery({
    queryKey: ["auditTrailReport", filters],
    queryFn: () => ReportsService.getAuditTrailReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Corridor Performance Report
export const useCorridorPerformanceReport = (
  filters: CorridorPerformanceReportFilters
) => {
  return useQuery({
    queryKey: ["corridorPerformanceReport", filters],
    queryFn: () => ReportsService.getCorridorPerformanceReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// User Performance Report
export const useUserPerformanceReport = (
  filters: UserPerformanceReportFilters
) => {
  return useQuery({
    queryKey: ["userPerformanceReport", filters],
    queryFn: () => ReportsService.getUserPerformanceReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Integration Status Report
export const useIntegrationStatusReport = (
  filters: IntegrationStatusReportFilters
) => {
  return useQuery({
    queryKey: ["integrationStatusReport", filters],
    queryFn: () => ReportsService.getIntegrationStatusReport(filters),
    enabled: !!filters.organisation_id,
  });
};

// Cash Position Report
export const useCashPositionReport = (filters: CashPositionReportFilters) => {
  return useQuery({
    queryKey: ["cashPositionReport", filters],
    queryFn: () => ReportsService.getCashPositionReport(filters),
    enabled: !!filters.organisation_id,
  });
};
