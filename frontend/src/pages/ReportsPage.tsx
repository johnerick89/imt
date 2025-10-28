import React, { useState, useMemo } from "react";
import { FiDownload, FiEye, FiRefreshCw } from "react-icons/fi";
// @ts-expect-error - react-csv doesn't have TypeScript declarations
import { CSVLink } from "react-csv";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import {
  useSession,
  useCurrencies,
  useOrganisations,
  useOrganisation,
} from "../hooks";
// Removed unused export hooks since we're implementing direct export
import { ReportType, REPORT_METADATA } from "../types/ReportsTypes";
import { formatToCurrency } from "../utils/textUtils";
import type { ReportItem } from "../types/ReportsTypes";
import { ReportsService } from "../services/ReportsService";
import { ReportsPDFService } from "../services/ReportsPDFService";
import type { Transaction } from "../types/TransactionsTypes";

const ReportsPage: React.FC = () => {
  const { user } = useSession();
  const userOrganisationid = user?.organisation_id;
  const [selectedReport, setSelectedReport] = useState<ReportType>(
    ReportType.OUTBOUND_TRANSACTIONS
  );
  const { data: organisationData } = useOrganisation(
    userOrganisationid as string
  );
  const userOrganisation = organisationData?.data;
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
  const organisations = organisationsData?.data?.organisations || [];

  // Data fetching will be done directly from service when preview is clicked

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
      page: 1,
      limit: 1000,
      ...(typeof filters.date_from !== "undefined"
        ? { date_from: filters.date_from }
        : {}),
      ...(typeof filters.date_to !== "undefined"
        ? { date_to: filters.date_to }
        : {}),
      ...(typeof filters.organisation_id !== "undefined"
        ? { organisation_id: filters.organisation_id }
        : {}),
      ...(typeof filters.currency_id !== "undefined"
        ? { currency_id: filters.currency_id }
        : {}),
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
          console.log("userOrganisation", userOrganisation);
          console.log("filters", filters);
          data = await ReportsService.getOutboundTransactionsReport(filters);
          console.log("getOutboundTransactionsReport data", data);
          break;
        case ReportType.INBOUND_TRANSACTIONS:
          data = await ReportsService.getInboundTransactionsReport(filters);
          console.log("getInboundTransactionsReport data", data);
          break;
        case ReportType.COMMISSIONS:
          data = await ReportsService.getCommissionsReport(filters);
          break;
        case ReportType.TAXES:
          data = await ReportsService.getTaxesReport(filters);
          break;
        // case ReportType.USER_TILLS:
        //   data = await ReportsService.getUserTillsReport(filters);
        //   break;
        // case ReportType.BALANCES_HISTORY:
        //   data = await ReportsService.getBalancesHistoryReport(filters);
        //   break;
        case ReportType.ORGANISATION_BALANCES_HISTORY:
          data = await ReportsService.getOrganisationBalancesHistoryReport(
            filters
          );
          break;
        case ReportType.GL_ACCOUNTS:
          data = await ReportsService.getGlAccountsReport(filters);
          break;
        // case ReportType.PROFIT_LOSS:
        //   data = await ReportsService.getProfitLossReport(filters);
        //   break;
        // case ReportType.BALANCE_SHEET:
        //   data = await ReportsService.getBalanceSheetReport(filters);
        //   break;
        case ReportType.PARTNER_BALANCES:
          data = await ReportsService.getPartnerBalancesReport(filters);
          console.log("getPartnerBalancesReport data", data);
          break;
        // case ReportType.COMPLIANCE:
        //   data = await ReportsService.getComplianceReport(filters);
        //   break;
        // case ReportType.EXCHANGE_RATES:
        //   data = await ReportsService.getExchangeRatesReport(filters);
        //   break;
        // case ReportType.AUDIT_TRAIL:
        //   data = await ReportsService.getAuditTrailReport(filters);
        //   break;
        case ReportType.CORRIDOR_PERFORMANCE:
          data = await ReportsService.getCorridorPerformanceReport(filters);

          console.log("getCorridorPerformanceReport data", data);
          break;
        // case ReportType.USER_PERFORMANCE:
        //   data = await ReportsService.getUserPerformanceReport(filters);
        //   break;
        // case ReportType.INTEGRATION_STATUS:
        //   data = await ReportsService.getIntegrationStatusReport(filters);
        //   break;
        // case ReportType.CASH_POSITION:
        //   data = await ReportsService.getCashPositionReport(filters);
        //   break;
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

  const getData = () => {
    switch (selectedReport) {
      case ReportType.OUTBOUND_TRANSACTIONS:
        return reportData?.data.transactions;
      case ReportType.INBOUND_TRANSACTIONS:
        return reportData?.data.transactions;
      case ReportType.COMMISSIONS:
        return reportData?.data.agencyCommissions;
      case ReportType.TAXES:
        return reportData?.data.taxes;
      case ReportType.ORGANISATION_BALANCES_HISTORY:
        return reportData?.data.balanceHistory;
      default:
        return [];
    }
  };

  // Prepare CSV data
  const prepareCSVData = () => {
    if (!reportData?.data) return [];

    const headers = getTableHeaders();

    const data = getData();
    console.log("prepareCSVData data", data);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const csvData = data.map((item: any) => {
      const row: Record<string, string> = {};
      const cells = getTableRowCells(item);

      headers.forEach((header, index) => {
        row[header] = cells[index] || "";
      });

      return row;
    });

    // Add totals row for specific report types
    if (
      selectedReport === ReportType.OUTBOUND_TRANSACTIONS ||
      selectedReport === ReportType.INBOUND_TRANSACTIONS ||
      selectedReport === ReportType.COMMISSIONS
    ) {
      const totalsRow: Record<string, string> = {};
      const totalsCells = renderTotalsRowCells(data);

      headers.forEach((header, index) => {
        totalsRow[header] = totalsCells[index] || "";
      });

      csvData.push(totalsRow);
    }

    return csvData;
  };

  // Handle CSV export
  const handleCSVExport = () => {
    const csvData = prepareCSVData();
    return csvData;
  };

  // Handle PDF export
  const handlePDFExport = async () => {
    try {
      if (!reportData?.data) {
        throw new Error("No data available for PDF export");
      }

      const data = getData();
      if (!data || data.length === 0) {
        throw new Error("No data available for PDF export");
      }

      // Add totals data for specific report types
      let exportData = data;
      if (
        selectedReport === ReportType.OUTBOUND_TRANSACTIONS ||
        selectedReport === ReportType.INBOUND_TRANSACTIONS ||
        selectedReport === ReportType.COMMISSIONS
      ) {
        const totalsCells = renderTotalsRowCells(data);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const totalsRow: any = {};
        const headers = getTableHeaders();

        headers.forEach((header, index) => {
          totalsRow[header] = totalsCells[index] || "";
        });

        exportData = [...data, totalsRow];
      }

      const filename = `${currentReportMetadata.name.replace(/\s+/g, "_")}_${
        new Date().toISOString().split("T")[0]
      }.pdf`;

      await ReportsPDFService.downloadReportPDF(
        selectedReport,
        exportData,
        previewFilters,
        currentReportMetadata,
        filename
      );
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate PDF. Please try again.");
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
    // if (
    //   selectedReport === ReportType.PROFIT_LOSS ||
    //   selectedReport === ReportType.BALANCE_SHEET
    // ) {
    //   return renderSummaryReport(data);
    // }

    // Handle paginated reports
    const items =
      data[
        Object.keys(data).find((key) => Array.isArray(data[key])) as string
      ] || [];
    const pagination = data.pagination;

    return (
      <div className="space-y-4">
        {/* Summary section for Organisation Balances History Report */}
        {selectedReport === ReportType.ORGANISATION_BALANCES_HISTORY &&
          data.summary && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Balance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Current Balance
                  </h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatToCurrency(data.summary.currentBalance)}{" "}
                    {data.summary.currency}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {data.summary.organisation}
                  </p>
                </div>
                {data.summary.periodicBalance && (
                  <>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Period Summary
                      </h4>
                      <p className="text-sm text-gray-600">
                        {data.summary.periodicBalance.period.year}/
                        {data.summary.periodicBalance.period.month}
                      </p>
                      <p className="text-lg font-semibold text-green-600 mt-1">
                        Opening:{" "}
                        {formatToCurrency(
                          data.summary.periodicBalance.openingBalance
                        )}
                      </p>
                      <p className="text-lg font-semibold text-blue-600">
                        Closing:{" "}
                        {formatToCurrency(
                          data.summary.periodicBalance.closingBalance
                        )}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Activity Summary
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p className="text-green-600">
                          In:{" "}
                          {formatToCurrency(
                            data.summary.periodicBalance.transactionsIn
                          )}
                        </p>
                        <p className="text-red-600">
                          Out:{" "}
                          {formatToCurrency(
                            data.summary.periodicBalance.transactionsOut
                          )}
                        </p>
                        <p className="text-blue-600">
                          Commissions:{" "}
                          {formatToCurrency(
                            data.summary.periodicBalance.commissions
                          )}
                        </p>
                        <p className="text-purple-600">
                          Deposits:{" "}
                          {formatToCurrency(
                            data.summary.periodicBalance.depositsAmount
                          )}
                        </p>
                        <p className="text-orange-600">
                          Withdrawals:{" "}
                          {formatToCurrency(
                            data.summary.periodicBalance.withdrawalsAmount
                          )}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
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
                {renderTotalsRow(items)}
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
  // const renderSummaryReport = (data: Record<string, unknown>) => {
  //   if (selectedReport === ReportType.PROFIT_LOSS) {
  //     return (
  //       <div className="space-y-6">
  //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //           <div className="bg-white p-6 rounded-lg shadow">
  //             <h3 className="text-lg font-semibold text-gray-900 mb-2">
  //               Total Revenue
  //             </h3>
  //             <p className="text-2xl font-bold text-green-600">
  //               {formatToCurrency(data.totalRevenue as number)}
  //             </p>
  //           </div>
  //           <div className="bg-white p-6 rounded-lg shadow">
  //             <h3 className="text-lg font-semibold text-gray-900 mb-2">
  //               Total Expenses
  //             </h3>
  //             <p className="text-2xl font-bold text-red-600">
  //               {formatToCurrency(data.totalExpenses as number)}
  //             </p>
  //           </div>
  //           <div className="bg-white p-6 rounded-lg shadow">
  //             <h3 className="text-lg font-semibold text-gray-900 mb-2">
  //               Net Profit
  //             </h3>
  //             <p
  //               className={`text-2xl font-bold ${
  //                 (data.netProfit as number) >= 0
  //                   ? "text-green-600"
  //                   : "text-red-600"
  //               }`}
  //             >
  //               {formatToCurrency(data.netProfit as number)}
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   if (selectedReport === ReportType.BALANCE_SHEET) {
  //     return (
  //       <div className="space-y-6">
  //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //           <div className="bg-white p-6 rounded-lg shadow">
  //             <h3 className="text-lg font-semibold text-gray-900 mb-2">
  //               Total Assets
  //             </h3>
  //             <p className="text-2xl font-bold text-blue-600">
  //               {formatToCurrency(data.totalAssets as number)}
  //             </p>
  //           </div>
  //           <div className="bg-white p-6 rounded-lg shadow">
  //             <h3 className="text-lg font-semibold text-gray-900 mb-2">
  //               Total Liabilities
  //             </h3>
  //             <p className="text-2xl font-bold text-orange-600">
  //               {formatToCurrency(data.totalLiabilities as number)}
  //             </p>
  //           </div>
  //           <div className="bg-white p-6 rounded-lg shadow">
  //             <h3 className="text-lg font-semibold text-gray-900 mb-2">
  //               Total Equity
  //             </h3>
  //             <p className="text-2xl font-bold text-purple-600">
  //               {formatToCurrency(data.totalEquity as number)}
  //             </p>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   }

  //   return null;
  // };

  // Get table headers based on report type
  const getTableHeaders = () => {
    switch (selectedReport) {
      case ReportType.OUTBOUND_TRANSACTIONS:
        return [
          "Transaction No",
          "Amount To Send",
          "Total Received",
          "Total Charges",
          "Currency",
          "Status",
          "Sender",
          "Receiver",
          "Origin Org",
          "Origin Country",
          "Destination Org",
          "Destination Country",
          "Date",
        ];
      case ReportType.INBOUND_TRANSACTIONS:
        return [
          "Transaction No",
          "Amount To Receive",
          "Total Paid",
          "Total Charges",
          "Currency",
          "Status",
          "Sender",
          "Receiver",
          "Origin Org",
          "Origin Country",
          "Destination Org",
          "Destination Country",
          "Date",
        ];
      case ReportType.COMMISSIONS:
        return [
          "Charge Name",
          "Charge Type",
          "Transaction No",
          "Agency/Partner",
          "Commission Amount",
          "Currency",
          "Date",
        ];
      case ReportType.TAXES:
        return [
          "Name",
          "Tax Type",
          "Transaction",
          "External Organisation",
          "Amount",
          "Internal Amount",
          "External Amount",
          "Currency",
          "Date",
        ];
      // case ReportType.USER_TILLS:
      //   return [
      //     "User",
      //     "Till",
      //     "Opening Balance",
      //     "Closing Balance",
      //     "Net Transactions",
      //     "Status",
      //     "Date",
      //   ];
      // case ReportType.BALANCES_HISTORY:
      //   return [
      //     "Entity Type",
      //     "Entity ID",
      //     "Old Balance",
      //     "New Balance",
      //     "Change",
      //     "Currency",
      //     "Date",
      //   ];
      case ReportType.ORGANISATION_BALANCES_HISTORY:
        return [
          "Entity Type",
          "Entity Name",
          "Old Balance",
          "New Balance",
          "Change Amount",
          "Currency",
          "Transaction No",
          "Customer",
          "Beneficiary",
          "Description",
          "Created By",
          "Date",
        ];
      case ReportType.GL_ACCOUNTS:
        return ["Account Name", "Type", "Balance", "Currency", "Date"];
      case ReportType.PARTNER_BALANCES:
        return ["Partner Org", "Balance", "Currency", "Date"];
      // case ReportType.COMPLIANCE:
      //   return [
      //     "Customer",
      //     "Risk Rating",
      //     "Type",
      //     "Nationality",
      //     "Transaction Count",
      //     "Date",
      //   ];
      // case ReportType.EXCHANGE_RATES:
      //   return ["Corridor", "Currency Pair", "Rate", "Date"];
      // case ReportType.AUDIT_TRAIL:
      //   return ["Action", "Entity", "User", "Date"];
      case ReportType.CORRIDOR_PERFORMANCE:
        return [
          "Corridor",
          "Agency/Partner",
          "Transaction Count",
          "Total Amount Paid",
          "Total Amount to Send",
          "Total Charges",
          "Date",
        ];
      // case ReportType.USER_PERFORMANCE:
      //   return ["User", "Till", "Net Transactions", "Date"];
      // case ReportType.INTEGRATION_STATUS:
      //   return [
      //     "Integration Type",
      //     "Partner",
      //     "Status",
      //     "Success Rate",
      //     "Date",
      //   ];
      // case ReportType.CASH_POSITION:
      //   return ["Entity Type", "Entity ID", "Balance", "Currency", "Date"];
      default:
        return [];
    }
  };

  // Get table row cells based on report type
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getTableRowCells = (item: any) => {
    switch (selectedReport) {
      case ReportType.OUTBOUND_TRANSACTIONS:
        console.log("item", item);
        return [
          item.transaction_no,
          formatToCurrency(item.origin_amount),
          formatToCurrency(item.amount_payable),
          formatToCurrency(item.total_all_charges),
          item.origin_currency?.currency_code,
          `${item.status} - ${item.remittance_status}`,
          `${item.customer?.full_name}`,
          `${item.beneficiary?.name}`,
          item.corridor?.origin_organisation?.name,
          item.corridor?.origin_country?.name,
          item.corridor?.destination_organisation?.name,
          item.corridor?.destination_country?.name,
          new Date(item.created_at || "").toLocaleDateString(),
        ];
      case ReportType.INBOUND_TRANSACTIONS:
        return [
          item.transaction_no,
          formatToCurrency(item.dest_amount),
          formatToCurrency(item.amount_payable),
          formatToCurrency(item.total_all_charges),
          item.dest_currency?.currency_code,
          `${item.status} - ${item.remittance_status}`,
          `${item.sender_trasaction_party?.name}`,
          `${item.receiver_trasaction_party?.name}`,
          item.corridor?.origin_organisation?.name,
          item.corridor?.origin_country?.name,
          item.corridor?.destination_organisation?.name,
          item.corridor?.destination_country?.name,
          new Date(item.created_at || "").toLocaleDateString(),
        ];
      case ReportType.COMMISSIONS:
        return [
          item.transaction_charge?.charge?.name || "N/A",
          item.transaction_charge?.charge?.type || "N/A",
          item.transaction?.transaction_no || "N/A",

          item.organisation?.name || "N/A",
          formatToCurrency(item.amount || 0),
          item.currency?.currency_code || "N/A",
          new Date(item.created_at).toLocaleDateString(),
        ];
      case ReportType.TAXES:
        return [
          item.charge.name,
          item.type,
          item.transaction?.transaction_no,
          item.transaction?.corridor?.organisation?.name,
          formatToCurrency(item.amount),
          formatToCurrency(item.internal_amount),
          formatToCurrency(item.external_amount),
          item.transaction?.origin_currency?.currency_code,
          new Date(item.created_at).toLocaleDateString(),
        ];
      // case ReportType.USER_TILLS:
      //   return [
      //     `${item.user?.first_name} ${item.user?.last_name}`,
      //     item.till?.name,
      //     formatToCurrency(item.opening_balance),
      //     formatToCurrency(item.closing_balance),
      //     formatToCurrency(item.net_transactions_total),
      //     item.status,
      //     new Date(item.created_at).toLocaleDateString(),
      //   ];
      // case ReportType.BALANCES_HISTORY:
      //   return [
      //     item.entity_type,
      //     item.entity_id,
      //     formatToCurrency(item.old_balance),
      //     formatToCurrency(item.new_balance),
      //     formatToCurrency(item.change_amount),
      //     item.currency?.currency_code,
      //     new Date(item.created_at).toLocaleDateString(),
      //   ];
      case ReportType.ORGANISATION_BALANCES_HISTORY:
        return [
          item.entity_type,
          getEntityName(item),
          formatToCurrency(item.old_balance || 0),
          formatToCurrency(item.new_balance || 0),
          formatToCurrency(item.change_amount || 0),
          item.currency?.currency_code,
          item.transaction?.transaction_no || "N/A",
          item.transaction?.customer?.full_name || "N/A",
          item.transaction?.beneficiary?.name || "N/A",
          item.description || "N/A",
          item.created_by_user
            ? `${item.created_by_user.first_name} ${item.created_by_user.last_name}`
            : "System",
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
          item.dest_org?.name,
          formatToCurrency(item.balance),
          item.currency?.currency_code,
          new Date(item.created_at).toLocaleDateString(),
        ];
      // case ReportType.COMPLIANCE:
      //   return [
      //     `${item.first_name} ${item.last_name}`,
      //     item.risk_rating,
      //     item.type,
      //     item.nationality,
      //     item.transactions?.length || 0,
      //     new Date(item.created_at).toLocaleDateString(),
      //   ];
      // case ReportType.EXCHANGE_RATES:
      //   return [
      //     item.corridor?.name,
      //     item.currency_pair,
      //     item.rate,
      //     new Date(item.created_at).toLocaleDateString(),
      //   ];
      // case ReportType.AUDIT_TRAIL:
      //   return [
      //     item.action,
      //     `${item.entity_type}: ${item.entity_id}`,
      //     `${item.user?.first_name} ${item.user?.last_name}`,
      //     new Date(item.created_at).toLocaleDateString(),
      //   ];
      case ReportType.CORRIDOR_PERFORMANCE:
        return [
          item.name,
          item.organisation?.name,
          item.transactions?.length || 0,
          formatToCurrency(
            item.transactions?.reduce(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (sum: number, t: any) => sum + (Number(t.amount_payable) || 0),
              0
            ) || 0
          ),
          formatToCurrency(
            item.transactions?.reduce(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (sum: number, t: any) => sum + (Number(t.dest_amount) || 0),
              0
            ) || 0
          ),
          formatToCurrency(
            item.transactions?.reduce(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (sum: number, t: any) => sum + (Number(t.total_all_charges) || 0),
              0
            ) || 0
          ),
          new Date(item.created_at).toLocaleDateString(),
        ];
      // case ReportType.USER_PERFORMANCE:
      //   return [
      //     `${item.user?.first_name} ${item.user?.last_name}`,
      //     item.till?.name,
      //     formatToCurrency(item.net_transactions_total),
      //     new Date(item.created_at).toLocaleDateString(),
      //   ];
      // case ReportType.INTEGRATION_STATUS:
      //   return [
      //     item.type,
      //     item.partner_organisation?.name,
      //     item.status,
      //     `${item.success_rate}%`,
      //     new Date(item.created_at).toLocaleDateString(),
      //   ];
      // case ReportType.CASH_POSITION:
      //   return [
      //     item.entity_type,
      //     item.entity_id,
      //     formatToCurrency(item.balance),
      //     item.currency?.currency_code,
      //     new Date(item.created_at).toLocaleDateString(),
      //   ];
      default:
        return [];
    }
  };

  // Render totals row for specific report types
  const renderTotalsRow = (items: ReportItem[]) => {
    // Only show totals for specific report types
    if (
      selectedReport !== ReportType.OUTBOUND_TRANSACTIONS &&
      selectedReport !== ReportType.INBOUND_TRANSACTIONS &&
      selectedReport !== ReportType.COMMISSIONS
    ) {
      return null;
    }

    const totalsCells: string[] = [];

    switch (selectedReport) {
      case ReportType.OUTBOUND_TRANSACTIONS: {
        const outboundTotals = {
          count: items.length,

          origin_amount: items.reduce(
            (sum, item) =>
              sum + (Number((item as Transaction).origin_amount) || 0),
            0
          ),

          amount_payable: items.reduce(
            (sum, item) =>
              sum + (Number((item as Transaction).amount_payable) || 0),
            0
          ),

          total_charges: items.reduce(
            (sum, item) =>
              sum + (Number((item as Transaction).total_all_charges) || 0),
            0
          ),
        };

        totalsCells.push("TOTAL"); // Transaction No
        totalsCells.push(formatToCurrency(outboundTotals.origin_amount)); // Origin Amount
        totalsCells.push(formatToCurrency(outboundTotals.amount_payable)); // Amount Payable
        totalsCells.push(formatToCurrency(outboundTotals.total_charges)); // Total Charges
        totalsCells.push(""); // Currency
        totalsCells.push(""); // Status
        totalsCells.push(""); // Customer
        totalsCells.push(""); // Beneficiary
        totalsCells.push(""); // Origin Org
        totalsCells.push(""); // Origin Country
        totalsCells.push(""); // Destination Org
        totalsCells.push(""); // Destination Country
        totalsCells.push(`Count: ${outboundTotals.count}`); // Date
        break;
      }

      case ReportType.INBOUND_TRANSACTIONS: {
        const inboundTotals = {
          count: items.length,

          dest_amount: items.reduce(
            (sum, item) =>
              sum + (Number((item as Transaction).dest_amount) || 0),
            0
          ),

          amount_payable: items.reduce(
            (sum, item) =>
              sum + (Number((item as Transaction).amount_payable) || 0),
            0
          ),

          total_charges: items.reduce(
            (sum, item) =>
              sum + (Number((item as Transaction).total_all_charges) || 0),
            0
          ),
        };

        totalsCells.push("TOTAL"); // Transaction No
        totalsCells.push(formatToCurrency(inboundTotals.dest_amount)); // Dest Amount
        totalsCells.push(formatToCurrency(inboundTotals.amount_payable)); // Amount Payable
        totalsCells.push(formatToCurrency(inboundTotals.total_charges)); // Total Charges
        totalsCells.push(""); // Currency
        totalsCells.push(""); // Status
        totalsCells.push(""); // Sender
        totalsCells.push(""); // Receiver
        totalsCells.push(""); // Origin Org
        totalsCells.push(""); // Origin Country
        totalsCells.push(""); // Destination Org
        totalsCells.push(""); // Destination Country
        totalsCells.push(`Count: ${inboundTotals.count}`); // Date
        break;
      }

      case ReportType.COMMISSIONS: {
        const commissionTotals = {
          count: items.length,

          amount: items.reduce(
            (sum, item) => sum + (Number((item as any).amount) || 0),
            0
          ),
        };

        totalsCells.push("TOTAL"); // Charge Name
        totalsCells.push(""); // Charge Type
        totalsCells.push(""); // Transaction No
        totalsCells.push(""); // Agency/Partner
        totalsCells.push(formatToCurrency(commissionTotals.amount)); // Commission Amount
        totalsCells.push(""); // Currency
        totalsCells.push(`Count: ${commissionTotals.count}`); // Date
        break;
      }

      default:
        return null;
    }

    return (
      <tr className="bg-gray-50 font-semibold">
        {totalsCells.map((cell, index) => (
          <td
            key={index}
            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 border-t-2 border-gray-300"
          >
            {cell}
          </td>
        ))}
      </tr>
    );
  };

  // Render totals row cells as an array (for CSV and PDF export)
  const renderTotalsRowCells = (items: ReportItem[]): string[] => {
    // Only show totals for specific report types
    if (
      selectedReport !== ReportType.OUTBOUND_TRANSACTIONS &&
      selectedReport !== ReportType.INBOUND_TRANSACTIONS &&
      selectedReport !== ReportType.COMMISSIONS
    ) {
      return [];
    }

    const totalsCells: string[] = [];

    switch (selectedReport) {
      case ReportType.OUTBOUND_TRANSACTIONS: {
        const outboundTotals = {
          count: items.length,

          origin_amount: items.reduce(
            (sum, item) => sum + (Number((item as any).origin_amount) || 0),
            0
          ),

          amount_payable: items.reduce(
            (sum, item) => sum + (Number((item as any).amount_payable) || 0),
            0
          ),

          total_charges: items.reduce(
            (sum, item) => sum + (Number((item as any).total_all_charges) || 0),
            0
          ),
        };

        totalsCells.push("TOTAL"); // Transaction No
        totalsCells.push(formatToCurrency(outboundTotals.origin_amount)); // Origin Amount
        totalsCells.push(formatToCurrency(outboundTotals.amount_payable)); // Amount Payable
        totalsCells.push(formatToCurrency(outboundTotals.total_charges)); // Total Charges
        totalsCells.push(""); // Currency
        totalsCells.push(""); // Status
        totalsCells.push(""); // Customer
        totalsCells.push(""); // Beneficiary
        totalsCells.push(""); // Origin Org
        totalsCells.push(""); // Origin Country
        totalsCells.push(""); // Destination Org
        totalsCells.push(""); // Destination Country
        totalsCells.push(`Count: ${outboundTotals.count}`); // Date
        break;
      }

      case ReportType.INBOUND_TRANSACTIONS: {
        const inboundTotals = {
          count: items.length,

          dest_amount: items.reduce(
            (sum, item) => sum + (Number((item as any).dest_amount) || 0),
            0
          ),

          amount_payable: items.reduce(
            (sum, item) => sum + (Number((item as any).amount_payable) || 0),
            0
          ),

          total_charges: items.reduce(
            (sum, item) => sum + (Number((item as any).total_all_charges) || 0),
            0
          ),
        };

        totalsCells.push("TOTAL"); // Transaction No
        totalsCells.push(formatToCurrency(inboundTotals.dest_amount)); // Dest Amount
        totalsCells.push(formatToCurrency(inboundTotals.amount_payable)); // Amount Payable
        totalsCells.push(formatToCurrency(inboundTotals.total_charges)); // Total Charges
        totalsCells.push(""); // Currency
        totalsCells.push(""); // Status
        totalsCells.push(""); // Sender
        totalsCells.push(""); // Receiver
        totalsCells.push(""); // Origin Org
        totalsCells.push(""); // Origin Country
        totalsCells.push(""); // Destination Org
        totalsCells.push(""); // Destination Country
        totalsCells.push(`Count: ${inboundTotals.count}`); // Date
        break;
      }

      case ReportType.COMMISSIONS: {
        const commissionTotals = {
          count: items.length,

          amount: items.reduce(
            (sum, item) => sum + (Number((item as any).amount) || 0),
            0
          ),
        };

        totalsCells.push("TOTAL"); // Charge Name
        totalsCells.push(""); // Charge Type
        totalsCells.push(""); // Transaction No
        totalsCells.push(""); // Agency/Partner
        totalsCells.push(formatToCurrency(commissionTotals.amount)); // Commission Amount
        totalsCells.push(""); // Currency
        totalsCells.push(`Count: ${commissionTotals.count}`); // Date
        break;
      }

      default:
        return [];
    }

    return totalsCells;
  };

  // Helper function to get entity name based on entity type
  const getEntityName = (item: any) => {
    switch (item.entity_type) {
      case "ORG_BALANCE":
        return (
          item.org_balance?.dest_org?.name ||
          item.float_org?.name ||
          "Organisation Balance"
        );
      case "TILL":
        return item.till?.name || "Till";
      case "VAULT":
        return item.vault?.name || "Vault";
      case "BANK_ACCOUNT":
        return item.bank_account?.name || "Bank Account";
      default:
        return item.entity_id || "Unknown Entity";
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
          <CSVLink
            data={handleCSVExport()}
            filename={`${currentReportMetadata.name.replace(/\s+/g, "_")}_${
              new Date().toISOString().split("T")[0]
            }.csv`}
            headers={getTableHeaders()}
          >
            <Button variant="outline" disabled={!showData || isLoading}>
              <FiDownload className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </CSVLink>
          <Button
            variant="outline"
            onClick={handlePDFExport}
            disabled={!showData || isLoading}
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
