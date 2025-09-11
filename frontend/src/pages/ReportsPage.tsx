import React, { useState, useMemo } from "react";
import { FiDownload, FiEye, FiRefreshCw } from "react-icons/fi";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { useSession, useCurrencies, useOrganisations } from "../hooks";
import {
  useOutboundTransactionsReport,
  useInboundTransactionsReport,
  useCommissionsReport,
  useTaxesReport,
  useUserTillsReport,
  useBalancesHistoryReport,
  useGlAccountsReport,
  useProfitLossReport,
  useBalanceSheetReport,
  usePartnerBalancesReport,
  useComplianceReport,
  useExchangeRatesReport,
  useAuditTrailReport,
  useCorridorPerformanceReport,
  useUserPerformanceReport,
  useIntegrationStatusReport,
  useCashPositionReport,
  useExportReportToCSV,
  useExportReportToPDF,
} from "../hooks/useReports";
import { ReportType, REPORT_METADATA } from "../types/ReportsTypes";
import { formatToCurrency } from "../utils/textUtils";
import type { ReportItem } from "../types/ReportsTypes";

const ReportsPage: React.FC = () => {
  const { user } = useSession();
  const userOrganisationid = user?.organisation_id;
  const [selectedReport, setSelectedReport] = useState<ReportType>(
    ReportType.OUTBOUND_TRANSACTIONS
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [filters, setFilters] = useState<Record<string, unknown>>({
    organisation_id: user?.organisation_id || "",
    page: 1,
    limit: 10,
  });

  // Data fetching
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: organisationsData } = useOrganisations({ limit: 100 });

  const currencies = currenciesData?.data?.currencies || [];
  const organisations =
    organisationsData?.data?.organisations.filter(
      (org) => org.id !== userOrganisationid
    ) || [];

  // Report queries - only execute the query for the selected report type
  const outboundTransactionsQuery = useOutboundTransactionsReport(
    selectedReport === ReportType.OUTBOUND_TRANSACTIONS
      ? filters
      : { organisation_id: "" }
  );
  const inboundTransactionsQuery = useInboundTransactionsReport(
    selectedReport === ReportType.INBOUND_TRANSACTIONS
      ? filters
      : { organisation_id: "" }
  );
  const commissionsQuery = useCommissionsReport(
    selectedReport === ReportType.COMMISSIONS
      ? filters
      : { organisation_id: "" }
  );
  const taxesQuery = useTaxesReport(
    selectedReport === ReportType.TAXES ? filters : { organisation_id: "" }
  );
  const userTillsQuery = useUserTillsReport(
    selectedReport === ReportType.USER_TILLS ? filters : { organisation_id: "" }
  );
  const balancesHistoryQuery = useBalancesHistoryReport(
    selectedReport === ReportType.BALANCES_HISTORY
      ? filters
      : { organisation_id: "" }
  );
  const glAccountsQuery = useGlAccountsReport(
    selectedReport === ReportType.GL_ACCOUNTS
      ? filters
      : { organisation_id: "" }
  );
  const profitLossQuery = useProfitLossReport(
    selectedReport === ReportType.PROFIT_LOSS
      ? filters
      : { organisation_id: "" }
  );
  const balanceSheetQuery = useBalanceSheetReport(
    selectedReport === ReportType.BALANCE_SHEET
      ? filters
      : { organisation_id: "" }
  );
  const partnerBalancesQuery = usePartnerBalancesReport(
    selectedReport === ReportType.PARTNER_BALANCES
      ? filters
      : { organisation_id: "" }
  );
  const complianceQuery = useComplianceReport(
    selectedReport === ReportType.COMPLIANCE ? filters : { organisation_id: "" }
  );
  const exchangeRatesQuery = useExchangeRatesReport(
    selectedReport === ReportType.EXCHANGE_RATES
      ? filters
      : { organisation_id: "" }
  );
  const auditTrailQuery = useAuditTrailReport(
    selectedReport === ReportType.AUDIT_TRAIL
      ? filters
      : { organisation_id: "" }
  );
  const corridorPerformanceQuery = useCorridorPerformanceReport(
    selectedReport === ReportType.CORRIDOR_PERFORMANCE
      ? filters
      : { organisation_id: "" }
  );
  const userPerformanceQuery = useUserPerformanceReport(
    selectedReport === ReportType.USER_PERFORMANCE
      ? filters
      : { organisation_id: "" }
  );
  const integrationStatusQuery = useIntegrationStatusReport(
    selectedReport === ReportType.INTEGRATION_STATUS
      ? filters
      : { organisation_id: "" }
  );
  const cashPositionQuery = useCashPositionReport(
    selectedReport === ReportType.CASH_POSITION
      ? filters
      : { organisation_id: "" }
  );

  // Export mutations
  const exportCSVMutation = useExportReportToCSV();
  const exportPDFMutation = useExportReportToPDF();

  // Get current report data
  const currentReportData = useMemo(() => {
    switch (selectedReport) {
      case ReportType.OUTBOUND_TRANSACTIONS:
        return outboundTransactionsQuery;
      case ReportType.INBOUND_TRANSACTIONS:
        return inboundTransactionsQuery;
      case ReportType.COMMISSIONS:
        return commissionsQuery;
      case ReportType.TAXES:
        return taxesQuery;
      case ReportType.USER_TILLS:
        return userTillsQuery;
      case ReportType.BALANCES_HISTORY:
        return balancesHistoryQuery;
      case ReportType.GL_ACCOUNTS:
        return glAccountsQuery;
      case ReportType.PROFIT_LOSS:
        return profitLossQuery;
      case ReportType.BALANCE_SHEET:
        return balanceSheetQuery;
      case ReportType.PARTNER_BALANCES:
        return partnerBalancesQuery;
      case ReportType.COMPLIANCE:
        return complianceQuery;
      case ReportType.EXCHANGE_RATES:
        return exchangeRatesQuery;
      case ReportType.AUDIT_TRAIL:
        return auditTrailQuery;
      case ReportType.CORRIDOR_PERFORMANCE:
        return corridorPerformanceQuery;
      case ReportType.USER_PERFORMANCE:
        return userPerformanceQuery;
      case ReportType.INTEGRATION_STATUS:
        return integrationStatusQuery;
      case ReportType.CASH_POSITION:
        return cashPositionQuery;
      default:
        return outboundTransactionsQuery;
    }
  }, [
    selectedReport,
    outboundTransactionsQuery,
    inboundTransactionsQuery,
    commissionsQuery,
    taxesQuery,
    userTillsQuery,
    balancesHistoryQuery,
    glAccountsQuery,
    profitLossQuery,
    balanceSheetQuery,
    partnerBalancesQuery,
    complianceQuery,
    exchangeRatesQuery,
    auditTrailQuery,
    corridorPerformanceQuery,
    userPerformanceQuery,
    integrationStatusQuery,
    cashPositionQuery,
  ]);

  const currentReportMetadata = REPORT_METADATA[selectedReport];

  // Handle filter changes
  const handleFilterChange = (key: string, value: unknown) => {
    let processedValue = value;

    // Convert date values to ISO datetime format
    if (key === "date_from" || key === "date_to") {
      if (value && typeof value === "string") {
        // Convert YYYY-MM-DD to ISO datetime (start of day for date_from, end of day for date_to)
        const date = new Date(value);
        if (key === "date_from") {
          // Set to start of day (00:00:00.000Z)
          date.setUTCHours(0, 0, 0, 0);
        } else {
          // Set to end of day (23:59:59.999Z)
          date.setUTCHours(23, 59, 59, 999);
        }
        processedValue = date.toISOString();
      } else if (!value) {
        processedValue = undefined;
      }
    }

    setFilters((prev: Record<string, unknown>) => ({
      ...prev,
      [key]: processedValue,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle report type change
  const handleReportTypeChange = (reportType: ReportType) => {
    setSelectedReport(reportType);
    // Reset filters when changing report type
    setFilters({
      organisation_id: user?.organisation_id || "",
      page: 1,
      limit: 10,
    });
  };

  // Handle export
  const handleExport = async (format: "csv" | "pdf") => {
    try {
      const filename = `${currentReportMetadata.name.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }`;

      if (format === "csv") {
        await exportCSVMutation.mutateAsync({
          reportType: selectedReport,
          filters,
          filename,
        });
      } else {
        await exportPDFMutation.mutateAsync({
          reportType: selectedReport,
          filters,
          filename,
        });
      }
    } catch (error) {
      console.error(`Error exporting ${format.toUpperCase()}:`, error);
    }
  };

  // Render report data
  const renderReportData = () => {
    if (currentReportData.isLoading) {
      return (
        <div className="flex items-center justify-center py-8">
          <FiRefreshCw className="h-6 w-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading report data...</span>
        </div>
      );
    }

    if (currentReportData.error) {
      return (
        <div className="text-center py-8">
          <p className="text-red-600">Error loading report data</p>
        </div>
      );
    }

    const data = currentReportData.data?.data;
    if (!data) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No data available</p>
        </div>
      );
    }

    // Handle different report types
    if (
      selectedReport === ReportType.PROFIT_LOSS ||
      selectedReport === ReportType.BALANCE_SHEET
    ) {
      return renderSummaryReport(data);
    }

    // Handle paginated reports
    const items =
      data[
        Object.keys(data).find((key) => Array.isArray(data[key])) as string
      ] || [];
    const pagination = data.pagination;

    return (
      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {getTableHeaders().map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item: ReportItem, index: number) => (
                  <tr key={index}>
                    {getTableRowCells(item).map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange("page", pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleFilterChange("page", pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render summary reports (P&L, Balance Sheet)
  const renderSummaryReport = (data: Record<string, unknown>) => {
    if (selectedReport === ReportType.PROFIT_LOSS) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Revenue
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {formatToCurrency(data.totalRevenue as number)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Expenses
              </h3>
              <p className="text-2xl font-bold text-red-600">
                {formatToCurrency(data.totalExpenses as number)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Net Profit
              </h3>
              <p
                className={`text-2xl font-bold ${
                  (data.netProfit as number) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatToCurrency(data.netProfit as number)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    if (selectedReport === ReportType.BALANCE_SHEET) {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Assets
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {formatToCurrency(data.totalAssets as number)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Liabilities
              </h3>
              <p className="text-2xl font-bold text-orange-600">
                {formatToCurrency(data.totalLiabilities as number)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Equity
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {formatToCurrency(data.totalEquity as number)}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // Get table headers based on report type
  const getTableHeaders = () => {
    switch (selectedReport) {
      case ReportType.OUTBOUND_TRANSACTIONS:
        return [
          "Transaction ID",
          "Amount",
          "Status",
          "Customer",
          "Beneficiary",
          "Corridor",
          "Date",
        ];
      case ReportType.INBOUND_TRANSACTIONS:
        return [
          "Transaction ID",
          "Amount",
          "Status",
          "Customer",
          "Beneficiary",
          "Corridor",
          "Date",
        ];
      case ReportType.COMMISSIONS:
        return ["Charge Type", "Amount", "Transaction", "Corridor", "Date"];
      case ReportType.TAXES:
        return ["Tax Type", "Amount", "Transaction", "Corridor", "Date"];
      case ReportType.USER_TILLS:
        return [
          "User",
          "Till",
          "Opening Balance",
          "Closing Balance",
          "Net Transactions",
          "Status",
          "Date",
        ];
      case ReportType.BALANCES_HISTORY:
        return [
          "Entity Type",
          "Entity ID",
          "Old Balance",
          "New Balance",
          "Change",
          "Currency",
          "Date",
        ];
      case ReportType.GL_ACCOUNTS:
        return ["Account Name", "Type", "Balance", "Currency", "Date"];
      case ReportType.PARTNER_BALANCES:
        return ["Partner Org", "Balance", "Currency", "Date"];
      case ReportType.COMPLIANCE:
        return [
          "Customer",
          "Risk Rating",
          "Type",
          "Nationality",
          "Transaction Count",
          "Date",
        ];
      case ReportType.EXCHANGE_RATES:
        return ["Corridor", "Currency Pair", "Rate", "Date"];
      case ReportType.AUDIT_TRAIL:
        return ["Action", "Entity", "User", "Date"];
      case ReportType.CORRIDOR_PERFORMANCE:
        return ["Corridor", "Transaction Count", "Total Amount", "Date"];
      case ReportType.USER_PERFORMANCE:
        return ["User", "Till", "Net Transactions", "Date"];
      case ReportType.INTEGRATION_STATUS:
        return [
          "Integration Type",
          "Partner",
          "Status",
          "Success Rate",
          "Date",
        ];
      case ReportType.CASH_POSITION:
        return ["Entity Type", "Entity ID", "Balance", "Currency", "Date"];
      default:
        return [];
    }
  };

  // Get table row cells based on report type
  const getTableRowCells = (item: any) => {
    switch (selectedReport) {
      case ReportType.OUTBOUND_TRANSACTIONS:
        return [
          item.transaction_id,
          formatToCurrency(item.origin_amount),
          item.status,
          `${item.customer?.first_name} ${item.customer?.last_name}`,
          `${item.beneficiary?.first_name} ${item.beneficiary?.last_name}`,
          item.corridor?.name,
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.INBOUND_TRANSACTIONS:
        return [
          item.transaction_id,
          formatToCurrency(item.dest_amount),
          item.status,
          `${item.customer?.first_name} ${item.customer?.last_name}`,
          `${item.beneficiary?.first_name} ${item.beneficiary?.last_name}`,
          item.corridor?.name,
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.COMMISSIONS:
        return [
          item.charge_type,
          formatToCurrency(item.amount),
          item.transaction?.transaction_id,
          item.transaction?.corridor?.name,
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.TAXES:
        return [
          item.charge_type,
          formatToCurrency(item.amount),
          item.transaction?.transaction_id,
          item.transaction?.corridor?.name,
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.USER_TILLS:
        return [
          `${item.user?.first_name} ${item.user?.last_name}`,
          item.till?.name,
          formatToCurrency(item.opening_balance),
          formatToCurrency(item.closing_balance),
          formatToCurrency(item.net_transactions_total),
          item.status,
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.BALANCES_HISTORY:
        return [
          item.entity_type,
          item.entity_id,
          formatToCurrency(item.old_balance),
          formatToCurrency(item.new_balance),
          formatToCurrency(item.change_amount),
          item.currency?.currency_code,
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.GL_ACCOUNTS:
        return [
          item.name,
          item.type,
          formatToCurrency(item.balance),
          item.currency?.currency_code,
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.PARTNER_BALANCES:
        return [
          item.organisation?.name,
          formatToCurrency(item.balance),
          item.currency?.currency_code,
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.COMPLIANCE:
        return [
          `${item.first_name} ${item.last_name}`,
          item.risk_rating,
          item.type,
          item.nationality,
          item.transactions?.length || 0,
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.EXCHANGE_RATES:
        return [
          item.corridor?.name,
          item.currency_pair,
          item.rate,
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.AUDIT_TRAIL:
        return [
          item.action,
          `${item.entity_type}: ${item.entity_id}`,
          `${item.user?.first_name} ${item.user?.last_name}`,
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.CORRIDOR_PERFORMANCE:
        return [
          item.name,
          item.transactions?.length || 0,
          formatToCurrency(
            item.transactions?.reduce(
              (sum: number, t: any) => sum + t.origin_amount,
              0
            ) || 0
          ),
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.USER_PERFORMANCE:
        return [
          `${item.user?.first_name} ${item.user?.last_name}`,
          item.till?.name,
          formatToCurrency(item.net_transactions_total),
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.INTEGRATION_STATUS:
        return [
          item.type,
          item.partner_organisation?.name,
          item.status,
          `${item.success_rate}%`,
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.CASH_POSITION:
        return [
          item.entity_type,
          item.entity_id,
          formatToCurrency(item.balance),
          item.currency?.currency_code,
          new Date(item.created_at).toLocaleDateString(),
        ];
      default:
        return [];
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">
          Generate and export various financial and operational reports.
        </p>
      </div>

      {/* Report Selection */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Select Report
        </h2>
        <div className="max-w-md">
          <SearchableSelect
            value={selectedReport}
            onChange={(value) => handleReportTypeChange(value as ReportType)}
            options={Object.values(ReportType).map((reportType) => ({
              value: reportType,
              label: REPORT_METADATA[reportType].name,
            }))}
            placeholder="Select a report type"
            searchPlaceholder="Search reports..."
          />
          {selectedReport && (
            <p className="text-sm text-gray-600 mt-2">
              {REPORT_METADATA[selectedReport].description}
            </p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <Input
              type="date"
              value={
                filters.date_from && typeof filters.date_from === "string"
                  ? new Date(filters.date_from).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleFilterChange("date_from", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date To
            </label>
            <Input
              type="date"
              value={
                filters.date_to && typeof filters.date_to === "string"
                  ? new Date(filters.date_to).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) => handleFilterChange("date_to", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organisation
            </label>
            <SearchableSelect
              value={
                typeof filters.organisation_id === "string"
                  ? filters.organisation_id
                  : ""
              }
              onChange={(value) => handleFilterChange("organisation_id", value)}
              options={organisations.map((org) => ({
                value: org.id,
                label: org.name,
              }))}
              placeholder="Select organisation"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <SearchableSelect
              value={
                typeof filters.currency_id === "string"
                  ? filters.currency_id
                  : ""
              }
              onChange={(value: string) =>
                handleFilterChange("currency_id", value)
              }
              options={currencies.map((currency) => ({
                value: String(currency.id),
                label: `${currency.currency_code} - ${currency.currency_name}`,
              }))}
              placeholder="Select currency"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowPreviewModal(true)}
            disabled={currentReportData.isLoading}
          >
            <FiEye className="h-4 w-4 mr-2" />
            Preview Report
          </Button>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            disabled={
              currentReportData.isLoading || exportCSVMutation.isPending
            }
          >
            <FiDownload className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            disabled={
              currentReportData.isLoading || exportPDFMutation.isPending
            }
          >
            <FiDownload className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={currentReportMetadata.name}
        size="xl"
      >
        <div className="max-h-96 overflow-y-auto">{renderReportData()}</div>
      </Modal>

      {/* Report Data */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {currentReportMetadata.name}
          </h2>
          {renderReportData()}
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
