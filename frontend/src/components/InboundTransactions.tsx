import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  useInboundTransactions,
  useInboundTransactionStats,
  useApproveInboundTransaction,
  useReverseInboundTransaction,
  useCancelInboundTransaction,
} from "../hooks/useInboundTransactions";
import { useSession } from "../hooks";
import { useOrganisations } from "../hooks/useOrganisations";
import { useCurrencies } from "../hooks/useCurrencies";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { formatToCurrency } from "../utils/textUtils";
import InboundTransactionsTable from "./InboundTransactionsTable";
import ApproveTransactionModal from "./ApproveTransactionModal";
import TransactionDetailsModal from "./TransactionDetailsModal";
import type {
  Transaction,
  InboundTransactionFilters,
  Status,
  RemittanceStatus,
} from "../types/TransactionsTypes";
import { siteCommonStrings } from "../config";

const InboundTransactions: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const { user } = useSession();
  const financialOrganisationId = orgId || user?.organisation_id || "";
  const [filters, setFilters] = useState<InboundTransactionFilters>({
    page: 1,
    limit: 10,
    direction: "INBOUND",
    destination_organisation_id: financialOrganisationId,
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reverseReason, setReverseReason] = useState("");
  const [reverseRemarks, setReverseRemarks] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const commonStrings = siteCommonStrings;
  const inboundLabel = commonStrings?.inbound;

  const {
    data: transactionsData,
    isLoading,
    error,
    refetch,
  } = useInboundTransactions(financialOrganisationId, filters);

  const { data: statsData } = useInboundTransactionStats(
    financialOrganisationId
  );

  // Fetch data for filters
  const { data: organisationsData } = useOrganisations({
    limit: 100,
  });
  const { data: currenciesData } = useCurrencies({ limit: 1000 });

  const approveMutation = useApproveInboundTransaction();
  const reverseMutation = useReverseInboundTransaction();
  const cancelMutation = useCancelInboundTransaction();

  const transactions = useMemo(
    () => transactionsData?.data?.transactions || [],
    [transactionsData]
  );
  const stats = statsData?.data;

  // Handle filter changes
  const handleFilterChange = (
    key: keyof InboundTransactionFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleApprove = async (remarks: string) => {
    if (!selectedTransaction) return;

    try {
      await approveMutation.mutateAsync({
        transactionId: selectedTransaction.id,
        data: { remarks: remarks || undefined },
      });
      setShowApproveModal(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Error approving transaction:", error);
    }
  };

  const handleReverse = async () => {
    if (!selectedTransaction || !reverseReason.trim()) return;

    try {
      await reverseMutation.mutateAsync({
        transactionId: selectedTransaction.id,
        data: {
          reason: reverseReason,
          remarks: reverseRemarks,
        },
      });
      setShowReverseModal(false);
      setReverseReason("");
      setReverseRemarks("");
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Error reversing transaction:", error);
    }
  };

  // Table handlers
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleApproveTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowApproveModal(true);
  };

  const handleReverseTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowReverseModal(true);
  };

  const handleCancelTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!selectedTransaction || !cancelReason.trim()) return;

    try {
      await cancelMutation.mutateAsync({
        transactionId: selectedTransaction.id,
        data: { reason: cancelReason },
      });
      setShowCancelModal(false);
      setCancelReason("");
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Error cancelling transaction:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading inbound transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-600">Error loading inbound transactions</div>
      </div>
    );
  }

  console.log("stats", stats);

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {inboundLabel} Transactions
          </h1>
          <p className="text-gray-600">
            Manage {inboundLabel?.toLocaleLowerCase()} money transfer
            transactions for your organisation.
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total {inboundLabel} Transactions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalTransactions}
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
                  Total {inboundLabel} Amount
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatToCurrency(stats.totalAmount)}
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  {inboundLabel} Pending
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byStatus.find((s) => s.status === "PENDING_APPROVAL")
                    ?.count || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.byStatus.find((s) => s.status === "APPROVED")?.count ||
                    0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <Input
              type="text"
              value={filters.search || ""}
              onChange={(e) =>
                handleFilterChange("search", e.target.value || undefined)
              }
              placeholder="Search transactions..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <SearchableSelect
              options={[
                { value: "PENDING_APPROVAL", label: "Pending Approval" },
                { value: "APPROVED", label: "Approved" },
                { value: "PENDING", label: "Pending" },
                { value: "FAILED", label: "Failed" },
                { value: "CANCELLED", label: "Cancelled" },
                { value: "REJECTED", label: "Rejected" },
                { value: "COMPLETED", label: "Completed" },
                { value: "REVERSED", label: "Reversed" },
              ]}
              value={filters.status || ""}
              onChange={(value) =>
                handleFilterChange("status", (value as Status) || undefined)
              }
              placeholder="Select status..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remittance Status
            </label>
            <SearchableSelect
              options={[
                { value: "PENDING", label: "Pending" },
                { value: "FAILED", label: "Failed" },
                { value: "REJECTED", label: "Rejected" },
                { value: "READY", label: "Ready" },
                { value: "TRANSIT", label: "Transit" },
                { value: "HOLD", label: "Hold" },
                { value: "PAID", label: "Paid" },
                { value: "STOP", label: "Stop" },
                { value: "COMPLETED", label: "Completed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
              value={filters.remittance_status || ""}
              onChange={(value) =>
                handleFilterChange(
                  "remittance_status",
                  (value as RemittanceStatus) || undefined
                )
              }
              placeholder="Select remittance status..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Origin Organisation
            </label>
            <SearchableSelect
              options={
                organisationsData?.data?.organisations
                  ?.filter(
                    (organisation) =>
                      organisation.id !== financialOrganisationId
                  )
                  ?.map((organisation) => ({
                    value: organisation.id,
                    label: organisation.name,
                  })) || []
              }
              value={filters.origin_organisation_id || ""}
              onChange={(value) =>
                handleFilterChange("origin_organisation_id", value || undefined)
              }
              placeholder="Select origin organisation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <SearchableSelect
              options={
                currenciesData?.data?.currencies?.map((currency) => ({
                  value: currency.id,
                  label: `${currency.currency_code} - ${currency.currency_name}`,
                })) || []
              }
              value={filters.origin_currency_id || ""}
              onChange={(value) =>
                handleFilterChange("origin_currency_id", value || undefined)
              }
              placeholder="Select currency..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date From
            </label>
            <Input
              type="date"
              value={filters.date_from || ""}
              onChange={(e) =>
                handleFilterChange("date_from", e.target.value || undefined)
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date To
            </label>
            <Input
              type="date"
              value={filters.date_to || ""}
              onChange={(e) =>
                handleFilterChange("date_to", e.target.value || undefined)
              }
            />
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={() =>
              setFilters({
                page: 1,
                limit: 10,
                search: "",
                direction: "INBOUND",
                destination_organisation_id: financialOrganisationId,
                status: undefined,
                remittance_status: undefined,
                origin_organisation_id: undefined,
                origin_currency_id: undefined,
                date_from: undefined,
                date_to: undefined,
              })
            }
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <InboundTransactionsTable
        transactions={transactions}
        isLoading={isLoading}
        onView={handleViewTransaction}
        onApprove={handleApproveTransaction}
      />

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
        onApprove={handleApproveTransaction}
        onReverse={handleReverseTransaction}
        onCancel={handleCancelTransaction}
        isLoading={
          approveMutation.isPending ||
          reverseMutation.isPending ||
          cancelMutation.isPending
        }
      />

      {/* Approve Modal */}
      <ApproveTransactionModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedTransaction(null);
        }}
        onApprove={handleApprove}
        transaction={selectedTransaction}
        isLoading={approveMutation.isPending}
      />

      {/* Reverse Modal */}
      <Modal
        isOpen={showReverseModal}
        onClose={() => {
          setShowReverseModal(false);
          setReverseReason("");
          setReverseRemarks("");
          setSelectedTransaction(null);
        }}
        title="Reverse Inbound Transaction"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to reverse this transaction? This action
            cannot be undone.
          </p>
          {selectedTransaction && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <p>
                <strong>Transaction:</strong>{" "}
                {selectedTransaction.transaction_no}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {formatToCurrency(selectedTransaction.origin_amount)}{" "}
                {selectedTransaction.origin_currency?.currency_code}
              </p>
              <p>
                <strong>Sender:</strong>{" "}
                {selectedTransaction.customer?.full_name || "Unknown Sender"}
              </p>
              <p>
                <strong>Receiver:</strong>{" "}
                {selectedTransaction.beneficiary?.name || "Unknown Receiver"}
              </p>
            </div>
          )}
          <Input
            placeholder="Reason for reversal *"
            value={reverseReason}
            onChange={(e) => setReverseReason(e.target.value)}
            required
          />
          <Textarea
            placeholder="Additional remarks (optional)"
            value={reverseRemarks}
            onChange={(e) => setReverseRemarks(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowReverseModal(false);
                setReverseReason("");
                setReverseRemarks("");
                setSelectedTransaction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReverse}
              disabled={reverseMutation.isPending || !reverseReason.trim()}
            >
              {reverseMutation.isPending ? "Reversing..." : "Reverse"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason("");
          setSelectedTransaction(null);
        }}
        title="Cancel Transaction"
      >
        <div className="space-y-4">
          {selectedTransaction && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                Transaction Details
              </h3>
              <p>
                <strong>Transaction #:</strong>{" "}
                {selectedTransaction.transaction_no}
              </p>
              <p>
                <strong>Amount:</strong>{" "}
                {formatToCurrency(selectedTransaction.origin_amount)}{" "}
                {selectedTransaction.origin_currency?.currency_code}
              </p>
              <p>
                <strong>Sender:</strong>{" "}
                {selectedTransaction.customer?.full_name || "Unknown Sender"}
              </p>
              <p>
                <strong>Receiver:</strong>{" "}
                {selectedTransaction.beneficiary?.name || "Unknown Receiver"}
              </p>
            </div>
          )}
          <Input
            placeholder="Reason for cancellation *"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            required
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason("");
                setSelectedTransaction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancel}
              disabled={cancelMutation.isPending || !cancelReason.trim()}
            >
              {cancelMutation.isPending
                ? "Cancelling..."
                : "Cancel Transaction"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default InboundTransactions;
