import AxiosBase from "./AxiosBase";
import type {
  OutboundTransactionsReportFilters,
  InboundTransactionsReportFilters,
  CommissionsReportFilters,
  TaxesReportFilters,
  UserTillsReportFilters,
  BalancesHistoryReportFilters,
  GlAccountsReportFilters,
  ProfitLossReportFilters,
  BalanceSheetReportFilters,
  PartnerBalancesReportFilters,
  ComplianceReportFilters,
  ExchangeRatesReportFilters,
  AuditTrailReportFilters,
  CorridorPerformanceReportFilters,
  UserPerformanceReportFilters,
  IntegrationStatusReportFilters,
  CashPositionReportFilters,
} from "../types/ReportsTypes";

export class ReportsService {
  // Outbound Transactions Report
  static async getOutboundTransactionsReport(
    filters: OutboundTransactionsReportFilters
  ) {
    const response = await AxiosBase.get("/reports/outbound-transactions", {
      params: filters,
    });
    return response.data;
  }

  // Inbound Transactions Report
  static async getInboundTransactionsReport(
    filters: InboundTransactionsReportFilters
  ) {
    const response = await AxiosBase.get("/reports/inbound-transactions", {
      params: filters,
    });
    return response.data;
  }

  // Commissions & Other Revenues Report
  static async getCommissionsReport(filters: CommissionsReportFilters) {
    const response = await AxiosBase.get("/reports/commissions", {
      params: filters,
    });
    return response.data;
  }

  // Taxes Report
  static async getTaxesReport(filters: TaxesReportFilters) {
    const response = await AxiosBase.get("/reports/taxes", {
      params: filters,
    });
    return response.data;
  }

  // User Tills Report
  static async getUserTillsReport(filters: UserTillsReportFilters) {
    const response = await AxiosBase.get("/reports/user-tills", {
      params: filters,
    });
    return response.data;
  }

  // Balances History Report
  static async getBalancesHistoryReport(filters: BalancesHistoryReportFilters) {
    const response = await AxiosBase.get("/reports/balances-history", {
      params: filters,
    });
    return response.data;
  }

  // GL Accounts Report
  static async getGlAccountsReport(filters: GlAccountsReportFilters) {
    const response = await AxiosBase.get("/reports/gl-accounts", {
      params: filters,
    });
    return response.data;
  }

  // Profit and Loss Report
  static async getProfitLossReport(filters: ProfitLossReportFilters) {
    const response = await AxiosBase.get("/reports/profit-loss", {
      params: filters,
    });
    return response.data;
  }

  // Balance Sheet Report
  static async getBalanceSheetReport(filters: BalanceSheetReportFilters) {
    const response = await AxiosBase.get("/reports/balance-sheet", {
      params: filters,
    });
    return response.data;
  }

  // Partner Balances Report
  static async getPartnerBalancesReport(filters: PartnerBalancesReportFilters) {
    const response = await AxiosBase.get("/reports/partner-balances", {
      params: filters,
    });
    return response.data;
  }

  // Customer and Beneficiary Compliance Report
  static async getComplianceReport(filters: ComplianceReportFilters) {
    const response = await AxiosBase.get("/reports/compliance", {
      params: filters,
    });
    return response.data;
  }

  // Exchange Rates Report
  static async getExchangeRatesReport(filters: ExchangeRatesReportFilters) {
    const response = await AxiosBase.get("/reports/exchange-rates", {
      params: filters,
    });
    return response.data;
  }

  // Audit Trail Report
  static async getAuditTrailReport(filters: AuditTrailReportFilters) {
    const response = await AxiosBase.get("/reports/audit-trail", {
      params: filters,
    });
    return response.data;
  }

  // Corridor Performance Report
  static async getCorridorPerformanceReport(
    filters: CorridorPerformanceReportFilters
  ) {
    const response = await AxiosBase.get("/reports/corridor-performance", {
      params: filters,
    });
    return response.data;
  }

  // User Performance Report
  static async getUserPerformanceReport(filters: UserPerformanceReportFilters) {
    const response = await AxiosBase.get("/reports/user-performance", {
      params: filters,
    });
    return response.data;
  }

  // Integration Status Report
  static async getIntegrationStatusReport(
    filters: IntegrationStatusReportFilters
  ) {
    const response = await AxiosBase.get("/reports/integration-status", {
      params: filters,
    });
    return response.data;
  }

  // Cash Position Report
  static async getCashPositionReport(filters: CashPositionReportFilters) {
    const response = await AxiosBase.get("/reports/cash-position", {
      params: filters,
    });
    return response.data;
  }

  // Export report to CSV
  static async exportReportToCSV(
    reportType: string,
    filters: Record<string, unknown>,
    filename?: string
  ) {
    const response = await AxiosBase.get(`/reports/${reportType}/export/csv`, {
      params: { ...filters, filename },
      responseType: "blob",
    });
    return response.data;
  }

  // Export report to PDF
  static async exportReportToPDF(
    reportType: string,
    filters: Record<string, unknown>,
    filename?: string
  ) {
    const response = await AxiosBase.get(`/reports/${reportType}/export/pdf`, {
      params: { ...filters, filename },
      responseType: "blob",
    });
    return response.data;
  }
}
