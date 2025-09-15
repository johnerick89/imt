import React, { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  useInboundTransactions,
  useInboundTransactionStats,
  useApproveInboundTransaction,
  useReverseInboundTransaction,
} from "../hooks/useInboundTransactions";
import { useSession } from "../hooks";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { StatusBadge } from "../components/ui/StatusBadge";
import { formatToCurrency } from "../utils/textUtils";
import type {
  Transaction,
  InboundTransactionFilters,
} from "../types/TransactionsTypes";

const InboundTransactions: React.FC = () => {
  const { orgId } = useParams<{ orgId: string }>();
  const { user } = useSession();
  const financialOrganisationId = orgId || user?.organisation_id || "";
  const [filters, setFilters] = useState<InboundTransactionFilters>({
    page: 1,
    limit: 10,
  });
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [approveRemarks, setApproveRemarks] = useState("");
  const [reverseReason, setReverseReason] = useState("");
  const [reverseRemarks, setReverseRemarks] = useState("");

  const {
    data: transactionsData,
    isLoading,
    error,
    refetch,
  } = useInboundTransactions(financialOrganisationId, filters);

  const { data: statsData } = useInboundTransactionStats(
    financialOrganisationId
  );

  const approveMutation = useApproveInboundTransaction();
  const reverseMutation = useReverseInboundTransaction();

  const transactions = useMemo(
    () => transactionsData?.data?.transactions || [],
    [transactionsData]
  );
  const pagination = useMemo(
    () => transactionsData?.data?.pagination,
    [transactionsData]
  );
  const stats = statsData?.data;

  const handleApprove = async () => {
    if (!selectedTransaction) return;

    try {
      await approveMutation.mutateAsync({
        transactionId: selectedTransaction.id,
        data: { remarks: approveRemarks },
      });
      setShowApproveModal(false);
      setApproveRemarks("");
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

  const getSenderInfo = (transaction: Transaction) => {
    const sender = transaction.transaction_parties?.find(
      (party) => party.role === "SENDER"
    );
    return sender ? sender.name : "Unknown Sender";
  };

  const getReceiverInfo = (transaction: Transaction) => {
    const receiver = transaction.transaction_parties?.find(
      (party) => party.role === "RECEIVER"
    );
    return receiver ? receiver.name : "Unknown Receiver";
  };

  const canApprove = (transaction: Transaction) => {
    return ["PENDING", "PENDING_APPROVAL"].includes(transaction.status);
  };

  const canReverse = (transaction: Transaction) => {
    return transaction.status === "APPROVED";
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

  return (
    <>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Inbound Transactions
          </h1>
          <p className="text-gray-600">
            Manage inbound money transfer transactions for your organisation.
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
                  Total Transactions
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
                  Total Amount
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
                <p className="text-sm font-medium text-gray-600">Pending</p>
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
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Search transactions..."
            value={filters.search || ""}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value, page: 1 })
            }
          />
          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.status || ""}
            onChange={(e) =>
              setFilters({
                ...filters,
                status: e.target.value as typeof filters.status,
                page: 1,
              })
            }
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REVERSED">Reversed</option>
          </select>
          <Input
            type="date"
            placeholder="From Date"
            value={filters.date_from || ""}
            onChange={(e) =>
              setFilters({ ...filters, date_from: e.target.value, page: 1 })
            }
          />
          <Input
            type="date"
            placeholder="To Date"
            value={filters.date_to || ""}
            onChange={(e) =>
              setFilters({ ...filters, date_to: e.target.value, page: 1 })
            }
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction No
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sender
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receiver
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {transaction.transaction_no}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getSenderInfo(transaction)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getReceiverInfo(transaction)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatToCurrency(transaction.origin_amount)}{" "}
                    {transaction.origin_currency?.currency_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={transaction.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.created_at
                      ? new Date(transaction.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {canApprove(transaction) && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowApproveModal(true);
                        }}
                      >
                        Approve
                      </Button>
                    )}
                    {canReverse(transaction) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setShowReverseModal(true);
                        }}
                      >
                        Reverse
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() =>
                  setFilters({ ...filters, page: (filters.page || 1) - 1 })
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                disabled={filters.page === pagination.totalPages}
                onClick={() =>
                  setFilters({ ...filters, page: (filters.page || 1) + 1 })
                }
              >
                Next
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === 1}
                    onClick={() =>
                      setFilters({ ...filters, page: (filters.page || 1) - 1 })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={filters.page === pagination.totalPages}
                    onClick={() =>
                      setFilters({ ...filters, page: (filters.page || 1) + 1 })
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

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setApproveRemarks("");
          setSelectedTransaction(null);
        }}
        title="Approve Inbound Transaction"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to approve this transaction?
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
                <strong>Sender:</strong> {getSenderInfo(selectedTransaction)}
              </p>
              <p>
                <strong>Receiver:</strong>{" "}
                {getReceiverInfo(selectedTransaction)}
              </p>
            </div>
          )}
          <Textarea
            placeholder="Approval remarks (optional)"
            value={approveRemarks}
            onChange={(e) => setApproveRemarks(e.target.value)}
            rows={3}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveModal(false);
                setApproveRemarks("");
                setSelectedTransaction(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          </div>
        </div>
      </Modal>

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
                <strong>Sender:</strong> {getSenderInfo(selectedTransaction)}
              </p>
              <p>
                <strong>Receiver:</strong>{" "}
                {getReceiverInfo(selectedTransaction)}
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
    </>
  );
};

export default InboundTransactions;
