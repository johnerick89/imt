import React, { useState, useMemo } from "react";
import { FiDownload, FiEye, FiRefreshCw } from "react-icons/fi";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { useSession, useCurrencies, useOrganisations } from "../hooks";
import {
  useExportReportToCSV,
  useExportReportToPDF,
} from "../hooks/useReports";
import { ReportType, REPORT_METADATA } from "../types/ReportsTypes";
import { formatToCurrency } from "../utils/textUtils";
import type { ReportItem } from "../types/ReportsTypes";
import { ReportsService } from "../services/ReportsService";

const ReportsPage: React.FC = () => {
  const { user } = useSession();
  const userOrganisationid = user?.organisation_id;
  const [selectedReport, setSelectedReport] = useState<ReportType>(
    ReportType.OUTBOUND_TRANSACTIONS
  );
  const [showData, setShowData] = useState(false);
  const [previewFilters, setPreviewFilters] = useState<Record<string, unknown>>(
    {}
  );
  const [filters, setFilters] = useState<Record<string, unknown>>({
    page: 1,
    limit: 1000,
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data fetching
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: organisationsData } = useOrganisations({ limit: 100 });

  const currencies = currenciesData?.data?.currencies || [];
  const organisations =
    organisationsData?.data?.organisations.filter(
      (org) => org.id !== userOrganisationid
    ) || [];

  // Data fetching will be done directly from service when preview is clicked

  // Export mutations
  const exportCSVMutation = useExportReportToCSV();
  const exportPDFMutation = useExportReportToPDF();

  // Get current report data from state
  const currentReportData = useMemo(() => {
    return {
      data: reportData,
      isLoading: isLoading,
      error: error,
    };
  }, [reportData, isLoading, error]);

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
    setShowData(false);
    setReportData(null);
    setError(null);
    // Reset filters when changing report type
    setFilters({
      organisation_id: user?.organisation_id || "",
      page: 1,
      limit: 1000,
    });
  };

  // Handle preview report
  const previewReport = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setPreviewFilters(filters);

      let data;
      switch (selectedReport) {
        case ReportType.OUTBOUND_TRANSACTIONS:
          data = await ReportsService.getOutboundTransactionsReport(filters);
          break;
        case ReportType.INBOUND_TRANSACTIONS:
          data = await ReportsService.getInboundTransactionsReport(filters);
          break;
        case ReportType.COMMISSIONS:
          data = await ReportsService.getCommissionsReport(filters);
          break;
        case ReportType.TAXES:
          data = await ReportsService.getTaxesReport(filters);
          break;
        case ReportType.USER_TILLS:
          data = await ReportsService.getUserTillsReport(filters);
          break;
        case ReportType.BALANCES_HISTORY:
          data = await ReportsService.getBalancesHistoryReport(filters);
          break;
        case ReportType.GL_ACCOUNTS:
          data = await ReportsService.getGlAccountsReport(filters);
          break;
        case ReportType.PROFIT_LOSS:
          data = await ReportsService.getProfitLossReport(filters);
          break;
        case ReportType.BALANCE_SHEET:
          data = await ReportsService.getBalanceSheetReport(filters);
          break;
        case ReportType.PARTNER_BALANCES:
          data = await ReportsService.getPartnerBalancesReport(filters);
          break;
        case ReportType.COMPLIANCE:
          data = await ReportsService.getComplianceReport(filters);
          break;
        case ReportType.EXCHANGE_RATES:
          data = await ReportsService.getExchangeRatesReport(filters);
          break;
        case ReportType.AUDIT_TRAIL:
          data = await ReportsService.getAuditTrailReport(filters);
          break;
        case ReportType.CORRIDOR_PERFORMANCE:
          data = await ReportsService.getCorridorPerformanceReport(filters);
          break;
        case ReportType.USER_PERFORMANCE:
          data = await ReportsService.getUserPerformanceReport(filters);
          break;
        case ReportType.INTEGRATION_STATUS:
          data = await ReportsService.getIntegrationStatusReport(filters);
          break;
        case ReportType.CASH_POSITION:
          data = await ReportsService.getCashPositionReport(filters);
          break;
        default:
          throw new Error("Invalid report type");
      }

      setReportData(data);
      setShowData(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch report data"
      );
      console.error("Error fetching report data:", err);
    } finally {
      setIsLoading(false);
    }
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
          filters: previewFilters,
          filename,
        });
      } else {
        await exportPDFMutation.mutateAsync({
          reportType: selectedReport,
          filters: previewFilters,
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
          "Destination Org",
          "Currency",
          "Destination Country",
          "Date",
        ];
      case ReportType.INBOUND_TRANSACTIONS:
        return [
          "Transaction ID",
          "Amount",
          "Status",
          "Customer",
          "Beneficiary",
          "Origin Org",
          "Currency",
          "Origin Country",
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTableRowCells = (item: any) => {
    switch (selectedReport) {
      case ReportType.OUTBOUND_TRANSACTIONS:
        return [
          item.transaction_no,
          formatToCurrency(item.origin_amount),
          item.status,
          `${item.customer?.full_name}`,
          `${item.beneficiary?.name}`,
          item.destination_organisation?.name,
          item.origin_currency?.currency_code,
          item.origin_country?.name,
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
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (sum: number, t: any) => sum + (t.origin_amount || 0),
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
          <Button onClick={previewReport} disabled={isLoading}>
            <FiEye className="h-4 w-4 mr-2" />
            {isLoading ? "Loading..." : "Preview Report"}
          </Button>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => handleExport("csv")}
            disabled={!showData || isLoading || exportCSVMutation.isPending}
          >
            <FiDownload className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("pdf")}
            disabled={!showData || isLoading || exportPDFMutation.isPending}
          >
            <FiDownload className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Report Data */}
      {showData && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {currentReportMetadata.name}
            </h2>
            {renderReportData()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
