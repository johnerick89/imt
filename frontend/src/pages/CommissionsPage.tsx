import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { FiX } from "react-icons/fi";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useSession } from "../hooks";
import { useOrganisations } from "../hooks/useOrganisations";
import { useCurrencies } from "../hooks/useCurrencies";
import { formatToCurrency } from "../utils/textUtils";
import type {
  ChargesPayment,
  ChargesPaymentFilters,
  PendingTransactionChargesFilters,
  ChargesPaymentStatus,
  ChargeType,
  CommissionSplit,
} from "../types/ChargesPaymentTypes";
import {
  usePendingCommissions,
  useChargesPayments,
  useChargePaymentsStats,
  usePendingCommissionStats,
  useProcessCommissions,
  useApproveCommissionPayment,
} from "../hooks/useChargesPayments";
import { TransactionDetailsModal } from "../components/TransactionDetailsModal";
import CommissionDetailsModal from "../components/CommissionDetailsModal";
import { useTransactionById } from "../hooks/useTransactions";
import { usePermissions } from "../hooks/usePermissions";

const CommissionsPage: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const { user } = useSession();
  const financialOrganisationId = orgId || user?.organisation_id || "";

  const [activeTab, setActiveTab] = useState<"pending" | "payments">("pending");
  const [selectedCommissionPayment, setSelectedCommissionPayment] =
    useState<ChargesPayment | null>(null);
  const [isCommissionDetailsModalOpen, setIsCommissionDetailsModalOpen] =
    useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [paymentToApprove, setPaymentToApprove] =
    useState<ChargesPayment | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");

  // Filters
  const [pendingFilters, setPendingFilters] =
    useState<PendingTransactionChargesFilters>({
      page: 1,
      limit: 10,
      organisation_id: financialOrganisationId,
    });

  const [paymentFilters, setPaymentFilters] = useState<ChargesPaymentFilters>({
    page: 1,
    limit: 10,
    organisation_id: financialOrganisationId,
    type: "COMMISSION" as ChargeType,
  });

  // Data
  const { data: pendingData, refetch: refetchPending } =
    usePendingCommissions(pendingFilters);
  const { data: pendingStatsData } = usePendingCommissionStats(pendingFilters);
  const { data: paymentsData, refetch: refetchPayments } =
    useChargesPayments(paymentFilters);
  const { data: paymentsStatsData } = useChargePaymentsStats(paymentFilters);
  const approveCommissionPaymentMutation = useApproveCommissionPayment();
  const { hasPermission } = usePermissions();

  const { data: organisationsData } = useOrganisations();
  const { data: currenciesData } = useCurrencies({ limit: 1000 });

  const updatePendingFilters = (
    updates: Partial<PendingTransactionChargesFilters>
  ) => {
    setPendingFilters((prev) => ({
      ...prev,
      ...updates,
      organisation_id: financialOrganisationId,
    }));
  };
  const updatePaymentFilters = (updates: Partial<ChargesPaymentFilters>) => {
    setPaymentFilters((prev) => ({
      ...prev,
      ...updates,
      organisation_id: financialOrganisationId,
      type: "COMMISSION" as ChargeType,
    }));
  };

  const commissionSplits = useMemo(
    () => pendingData?.data?.commission_splits || [],
    [pendingData]
  );
  const pendingPagination = pendingData?.data?.pagination;
  const pendingStats = pendingStatsData?.data;

  const payments = useMemo(
    () => paymentsData?.data?.charges_payments || [],
    [paymentsData]
  );
  const paymentsPagination = paymentsData?.data?.pagination;

  // Transaction details modal state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] =
    useState<string>("");
  const { data: selectedTransactionData } = useTransactionById(
    selectedTransactionId
  );
  const selectedTransaction = selectedTransactionData?.data || null;

  // Selection state for commissions
  const [selectedSplits, setSelectedSplits] = useState<string[]>([]);
  const handleSelectAll = () => {
    if (selectedSplits.length === commissionSplits.length) {
      setSelectedSplits([]);
    } else {
      setSelectedSplits(commissionSplits.map((s: CommissionSplit) => s.id));
    }
  };
  const handleSelectSplit = (id: string) => {
    setSelectedSplits((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Process commission mutation
  const { mutateAsync: processCommissions } = useProcessCommissions();

  const handleProcessCommission = async () => {
    if (selectedSplits.length === 0) return;
    await processCommissions(selectedSplits);
    setSelectedSplits([]);
    refetchPending();
    refetchPayments();
  };

  // Commission payment handlers
  const handleViewCommission = (payment: ChargesPayment) => {
    setSelectedCommissionPayment(payment);
    setIsCommissionDetailsModalOpen(true);
  };

  const handleApproveCommission = (payment: ChargesPayment) => {
    setPaymentToApprove(payment);
    setApprovalNotes("");
    setApproveModalOpen(true);
  };

  const handleConfirmApprove = async () => {
    if (!paymentToApprove) return;
    await approveCommissionPaymentMutation.mutateAsync({
      paymentId: paymentToApprove.id,
      data: { notes: approvalNotes },
    });
    setApproveModalOpen(false);
    setPaymentToApprove(null);
    setApprovalNotes("");
    refetchPayments();
  };

  const organisations = useMemo(
    () => organisationsData?.data?.organisations || [],
    [organisationsData]
  );
  const currencies = useMemo(
    () => currenciesData?.data?.currencies || [],
    [currenciesData]
  );

  const getChargeTypeColor = (type: ChargeType) => {
    switch (type) {
      case "TAX":
        return "bg-red-100 text-red-800";
      case "COMMISSION":
        return "bg-blue-100 text-blue-800";
      case "INTERNAL_FEE":
        return "bg-green-100 text-green-800";
      case "OTHER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commissions</h1>
        <Button
          onClick={() =>
            activeTab === "pending" ? refetchPending() : refetchPayments()
          }
          variant="outline"
        >
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("pending")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Pending Commissions
            </button>
            <button
              onClick={() => setActiveTab("payments")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "payments"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Commission Payments
            </button>
          </nav>
        </div>
      </div>

      {/* Pending Commissions Tab */}
      {activeTab === "pending" && (
        <>
          {pendingStats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V9a2 2 0 012-2h6M9 19a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h2a2 2 0 012 2m2 10a2 2 0 002 2h2a2 2 0 002-2"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Pending Commissions
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {pendingStats.totalPendingCharges}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Pending Amount
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatToCurrency(pendingStats.totalPendingAmount)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search transactions or charges..."
                value={pendingFilters.search || ""}
                onChange={(e) =>
                  updatePendingFilters({ search: e.target.value, page: 1 })
                }
              />
              <SearchableSelect
                placeholder="Select destination org"
                value={pendingFilters.destination_org_id || ""}
                onChange={(value) =>
                  updatePendingFilters({ destination_org_id: value, page: 1 })
                }
                options={organisations.map((org) => ({
                  value: org.id,
                  label: org.name,
                }))}
              />
              <SearchableSelect
                placeholder="Select currency"
                value={pendingFilters.currency_id || ""}
                onChange={(value) =>
                  updatePendingFilters({ currency_id: value, page: 1 })
                }
                options={currencies.map((c) => ({
                  value: c.id,
                  label: c.currency_code,
                }))}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <Input
                type="date"
                placeholder="From Date"
                value={pendingFilters.date_from || ""}
                onChange={(e) =>
                  updatePendingFilters({ date_from: e.target.value, page: 1 })
                }
              />
              <Input
                type="date"
                placeholder="To Date"
                value={pendingFilters.date_to || ""}
                onChange={(e) =>
                  updatePendingFilters({ date_to: e.target.value, page: 1 })
                }
              />
            </div>
          </div>

          {/* Pending Commissions Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Action Bar */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedSplits.length === commissionSplits.length &&
                      commissionSplits.length > 0
                    }
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Select All</span>
                </label>
                <span className="text-sm text-gray-500">
                  {selectedSplits.length} of {commissionSplits.length} selected
                </span>
              </div>
              <Button
                onClick={handleProcessCommission}
                disabled={selectedSplits.length === 0}
              >
                Process Commission
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Select
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Organisation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Charge
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissionSplits.map((split: CommissionSplit) => (
                    <tr key={split.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedSplits.includes(split.id)}
                          onChange={() => handleSelectSplit(split.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {split.transaction?.transaction_no ? (
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-800 underline"
                            onClick={() => {
                              setSelectedTransactionId(split.transaction_id);
                              setIsTxModalOpen(true);
                            }}
                          >
                            {split.transaction.transaction_no}
                          </button>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {split.organisation?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {split.role || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {split.transaction_charge?.charge?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatToCurrency(split.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {split.currency?.currency_code || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {split.created_at
                          ? new Date(split.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pendingPagination && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between w-full">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing {""}
                      <span className="font-medium">
                        {(pendingPagination.page - 1) *
                          pendingPagination.limit +
                          1}
                      </span>{" "}
                      to {""}
                      <span className="font-medium">
                        {Math.min(
                          pendingPagination.page * pendingPagination.limit,
                          pendingPagination.total
                        )}
                      </span>{" "}
                      of {""}
                      <span className="font-medium">
                        {pendingPagination.total}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={pendingFilters.page === 1}
                        onClick={() =>
                          updatePendingFilters({
                            page: (pendingFilters.page || 1) - 1,
                          })
                        }
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          pendingFilters.page === pendingPagination.totalPages
                        }
                        onClick={() =>
                          updatePendingFilters({
                            page: (pendingFilters.page || 1) + 1,
                          })
                        }
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Commission Payments Tab (reuses charges payments) */}
      {activeTab === "payments" && (
        <>
          {/* Stats */}
          {paymentsStatsData && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19V9a2 2 0 012-2h6M9 19a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2h2a2 2 0 012 2m2 10a2 2 0 002 2h2a2 2 0 002-2"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Commission Payments
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {paymentsStatsData.data.totalPendingCharges}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatToCurrency(
                        paymentsStatsData.data.totalPendingAmount
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-yellow-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Pending Payments
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {paymentsStatsData.data.byType.find(
                        (t: { type: string; count: number }) =>
                          t.type === "PENDING"
                      )?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">
                      Completed Payments
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {paymentsStatsData.data.byType.find(
                        (t: { type: string; count: number }) =>
                          t.type === "COMPLETED"
                      )?.count || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="Search payments..."
                value={paymentFilters.search || ""}
                onChange={(e) =>
                  updatePaymentFilters({ search: e.target.value, page: 1 })
                }
              />
              <SearchableSelect
                placeholder="Select status"
                value={paymentFilters.status || ""}
                onChange={(value) =>
                  updatePaymentFilters({
                    status: value as ChargesPaymentStatus,
                    page: 1,
                  })
                }
                options={[
                  { value: "PENDING", label: "Pending" },
                  { value: "COMPLETED", label: "Completed" },
                  { value: "FAILED", label: "Failed" },
                ]}
              />
              <SearchableSelect
                placeholder="Select destination org"
                value={paymentFilters.destination_org_id || ""}
                onChange={(value) =>
                  updatePaymentFilters({ destination_org_id: value, page: 1 })
                }
                options={organisations.map((org) => ({
                  value: org.id,
                  label: org.name,
                }))}
              />
              <SearchableSelect
                placeholder="Select currency"
                value={paymentFilters.currency_id || ""}
                onChange={(value) =>
                  updatePaymentFilters({ currency_id: value, page: 1 })
                }
                options={currencies.map((currency) => ({
                  value: currency.id,
                  label: currency.currency_code,
                }))}
              />
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agency/Broker
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Currency
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment: ChargesPayment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.reference_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChargeTypeColor(
                            payment.type
                          )}`}
                        >
                          {payment.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.organisation?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatToCurrency(payment.amount ?? 0)}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {payment.currency?.currency_code || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={payment.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {payment.created_at
                          ? new Date(payment.created_at).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewCommission(payment)}
                        >
                          View
                        </Button>
                        {payment.status === "PENDING" &&
                          hasPermission("admin.chargesPayments.approve") && (
                            <Button
                              variant="default"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                              onClick={() => handleApproveCommission(payment)}
                              disabled={
                                approveCommissionPaymentMutation.isPending
                              }
                            >
                              Approve
                            </Button>
                          )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {paymentsPagination && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between w-full">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing {""}
                      <span className="font-medium">
                        {(paymentsPagination.page - 1) *
                          paymentsPagination.limit +
                          1}
                      </span>{" "}
                      to {""}
                      <span className="font-medium">
                        {Math.min(
                          paymentsPagination.page * paymentsPagination.limit,
                          paymentsPagination.total
                        )}
                      </span>{" "}
                      of {""}
                      <span className="font-medium">
                        {paymentsPagination.total}
                      </span>{" "}
                      results
                    </p>
                  </div>
                  <div>
                    <nav
                      className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                      aria-label="Pagination"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={paymentFilters.page === 1}
                        onClick={() =>
                          updatePaymentFilters({
                            page: (paymentFilters.page || 1) - 1,
                          })
                        }
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          paymentFilters.page === paymentsPagination.totalPages
                        }
                        onClick={() =>
                          updatePaymentFilters({
                            page: (paymentFilters.page || 1) + 1,
                          })
                        }
                      >
                        Next
                      </Button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        transaction={selectedTransaction}
      />

      {/* Commission Details Modal */}
      <CommissionDetailsModal
        isOpen={isCommissionDetailsModalOpen}
        onClose={() => setIsCommissionDetailsModalOpen(false)}
        commissionPayment={selectedCommissionPayment}
      />

      {/* Approval Modal */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Approve Commission Payment
              </h2>
              <button
                onClick={() => setApproveModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Reference Number
                </label>
                <p className="text-sm text-gray-900">
                  {paymentToApprove?.reference_number}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Agency/Broker
                </label>
                <p className="text-sm text-gray-900">
                  {paymentToApprove?.organisation?.name}
                </p>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Amount
                </label>
                <p className="text-sm text-gray-900">
                  {formatToCurrency(paymentToApprove?.amount ?? 0)}{" "}
                  {paymentToApprove?.currency?.currency_code}
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Approval Notes (Optional)
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter approval notes..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setApproveModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={handleConfirmApprove}
                  disabled={approveCommissionPaymentMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {approveCommissionPaymentMutation.isPending
                    ? "Approving..."
                    : "Approve"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommissionsPage;
