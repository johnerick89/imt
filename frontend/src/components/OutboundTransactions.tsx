import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import { useSession } from "../hooks/useSession";
import {
  useTransactions,
  useCustomerOutboundTransactions,
  useTransactionStats,
  useCreateOutboundTransaction,
  useCancelTransaction,
  useReverseTransaction,
  useApproveTransaction,
  useMarkAsReady,
  useUpdateOutboundTransaction,
} from "../hooks/useTransactions";
import { useCurrencies } from "../hooks/useCurrencies";
import { useOrganisation, useOrganisations } from "../hooks/useOrganisations";
import { useCorridors } from "../hooks/useCorridors";
import { useTills } from "../hooks/useTills";
import { useCustomers } from "../hooks/useCustomers";
import TransactionsTable from "../components/TransactionsTable";
import TransactionForm from "../components/CreateTransactionForm";
import TransactionDetailsModal from "../components/TransactionDetailsModal";
import ApproveTransactionModal from "../components/ApproveTransactionModal";
import MarkAsReadyModal from "../components/MarkAsReadyModal";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { formatToCurrency } from "../utils/textUtils";
import type {
  Transaction,
  TransactionFilters,
  CreateOutboundTransactionRequest,
  UpdateTransactionRequest,
  MarkAsReadyRequest,
  Status,
  RemittanceStatus,
} from "../types/TransactionsTypes";
import { siteCommonStrings } from "../config";
import { usePermissions } from "../hooks/usePermissions";

const OutboundTransactions: React.FC = () => {
  const { id: organisationId } = useParams<{ id: string }>();
  const { user } = useSession();
  const commonStrings = siteCommonStrings;
  const outboundLabel = commonStrings?.outbound;
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isMarkAsReadyModalOpen, setIsMarkAsReadyModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { canCreateTransactions } = usePermissions();
  const [isCustomerOrganisation, setIsCustomerOrganisation] = useState(false);
  // Use the current user's organisation if no organisationId in URL
  const effectiveOrganisationId = organisationId || user?.organisation_id;
  const { data: userOrganisationData } = useOrganisation(
    user?.organisation_id || effectiveOrganisationId || ""
  );
  console.log(
    "userOrganisationData",
    userOrganisationData,
    "effectiveOrganisationId",
    effectiveOrganisationId,
    "user",
    user
  );

  useEffect(() => {
    if (userOrganisationData) {
      const userOrganisation = userOrganisationData?.data;
      setIsCustomerOrganisation(userOrganisation?.type === "CUSTOMER");
    }
  }, [userOrganisationData]);

  // Filters state
  const [baseFilters, setBaseFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
    search: "",
    direction: "OUTBOUND", // Default to outbound transactions
  });

  // Computed filters that properly handle origin_organisation_id
  const filters = useMemo(() => {
    if (!isCustomerOrganisation && effectiveOrganisationId) {
      return {
        ...baseFilters,
        origin_organisation_id: effectiveOrganisationId,
      };
    }
    // For customer organisations, create a new object without origin_organisation_id
    const restFilters = { ...baseFilters };
    delete restFilters.origin_organisation_id;
    return restFilters;
  }, [baseFilters, isCustomerOrganisation, effectiveOrganisationId]);

  console.log(
    "filters",
    filters,
    "effectiveOrganisationId",
    effectiveOrganisationId,
    "isCustomerOrganisation",
    isCustomerOrganisation
  );

  // Fetch data - call both hooks but use the appropriate one
  const {
    data: customerTransactionsData,
    isLoading: isLoadingCustomerTransactions,
  } = useCustomerOutboundTransactions(filters);
  const {
    data: agencyTransactionsData,
    isLoading: isLoadingAgencyTransactions,
  } = useTransactions(effectiveOrganisationId || "", filters);

  console.log(
    "customerTransactionsData",
    customerTransactionsData,
    "agencyTransactionsData",
    agencyTransactionsData
  );

  // Use the appropriate data based on organization type
  const transactionsData = isCustomerOrganisation
    ? customerTransactionsData
    : agencyTransactionsData;
  console.log(
    "isCustomerOrganisation",
    isCustomerOrganisation,
    "transactionsData",
    transactionsData
  );
  const isLoadingTransactions = isCustomerOrganisation
    ? isLoadingCustomerTransactions
    : isLoadingAgencyTransactions;
  const { data: statsData, isLoading: isLoadingStats } = useTransactionStats(
    effectiveOrganisationId || ""
  );
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: corridorsData } = useCorridors({
    organisation_id: effectiveOrganisationId || "",
  });
  const { data: tillsData } = useTills({
    organisation_id: effectiveOrganisationId || "",
  });
  const { data: customersData } = useCustomers({
    organisation_id: effectiveOrganisationId || "",
  });
  const { data: organisationsData } = useOrganisations({
    limit: 100,
  });
  const destinationOrganisations =
    organisationsData?.data?.organisations.filter(
      (organisation) => organisation.id !== effectiveOrganisationId
    ) || [];

  // Mutations
  const createTransactionMutation = useCreateOutboundTransaction();
  const cancelTransactionMutation = useCancelTransaction();
  const reverseTransactionMutation = useReverseTransaction();
  const approveTransactionMutation = useApproveTransaction();
  const markAsReadyMutation = useMarkAsReady();
  const updateTransactionMutation = useUpdateOutboundTransaction();

  // Handle filter changes
  const handleFilterChange = (
    key: keyof TransactionFilters,
    value: string | undefined
  ) => {
    setBaseFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setBaseFilters((prev) => ({ ...prev, page }));
  };

  // Handle create transaction
  const handleCreateTransaction = async (
    data: CreateOutboundTransactionRequest | UpdateTransactionRequest
  ) => {
    try {
      await createTransactionMutation.mutateAsync({
        organisationId: effectiveOrganisationId || "",
        data: data as CreateOutboundTransactionRequest,
      });
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Error creating transaction:", error);
    }
  };

  // Handle view transaction
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  // Handle cancel transaction
  const handleCancelTransaction = async (transaction: Transaction) => {
    if (window.confirm("Are you sure you want to cancel this transaction?")) {
      try {
        await cancelTransactionMutation.mutateAsync({
          transactionId: transaction.id,
          data: { reason: "Cancelled by user" },
        });
        setIsDetailsModalOpen(false);
      } catch (error) {
        console.error("Error cancelling transaction:", error);
      }
    }
  };

  // Handle reverse transaction
  const handleReverseTransaction = async (transaction: Transaction) => {
    const reason = window.prompt(
      "Please provide a reason for reversing this transaction:"
    );
    if (reason) {
      try {
        await reverseTransactionMutation.mutateAsync({
          transactionId: transaction.id,
          data: { reason, remarks: "Reversed by user" },
        });
        setIsDetailsModalOpen(false);
      } catch (error) {
        console.error("Error reversing transaction:", error);
      }
    }
  };

  // Handle approve transaction
  const handleApproveTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsApproveModalOpen(true);
  };

  const handleApproveConfirm = async (remarks: string) => {
    if (!selectedTransaction) return;

    try {
      await approveTransactionMutation.mutateAsync({
        transactionId: selectedTransaction.id,
        data: { remarks: remarks || undefined },
      });
      setIsApproveModalOpen(false);
      setSelectedTransaction(null);
    } catch (error) {
      console.error("Error approving transaction:", error);
    }
  };

  // Handle update transaction
  const handleUpdateTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditModalOpen(true);
  };

  // Handle mark as ready
  const handleMarkAsReady = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsMarkAsReadyModalOpen(true);
  };

  // Handle mark as ready submission
  const handleMarkAsReadySubmit = async (data: MarkAsReadyRequest) => {
    if (selectedTransaction) {
      try {
        await markAsReadyMutation.mutateAsync({
          transactionId: selectedTransaction.id,
          data,
        });
        setIsMarkAsReadyModalOpen(false);
        setSelectedTransaction(null);
      } catch (error) {
        console.error("Error marking transaction as ready:", error);
      }
    }
  };

  // Handle update transaction submission
  const handleUpdateTransactionSubmit = async (
    data: UpdateTransactionRequest
  ) => {
    if (selectedTransaction) {
      try {
        await updateTransactionMutation.mutateAsync({
          transactionId: selectedTransaction.id,
          data,
        });
        setIsEditModalOpen(false);
        setSelectedTransaction(null);
      } catch (error) {
        console.error("Error updating transaction:", error);
      }
    }
  };

  if (!effectiveOrganisationId) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {outboundLabel} Transactions
          </h1>
          <p className="text-gray-600">No organisation selected.</p>
        </div>
      </div>
    );
  }

  const transactions = transactionsData?.data?.transactions || [];
  const pagination = transactionsData?.data?.pagination;
  const stats = statsData?.data;

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {outboundLabel} Transactions
            </h1>
            <p className="text-gray-600">
              Manage {outboundLabel?.toLocaleLowerCase()} money transfer
              transactions for your organisation.
            </p>
          </div>
          {canCreateTransactions() && !isCustomerOrganisation && (
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              className="min-w-24 gap-2 min-h-18"
            >
              <FaPlus className="w-4 h-4" />
              New Transaction
            </Button>
          )}
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total {outboundLabel} Transactions
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
                    Total {outboundLabel} Amount
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
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.byStatus.find((s) => s.status === "PENDING")
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.byStatus.find((s) => s.status === "FAILED")?.count ||
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
                  { value: "COMPLETED", label: "Completed" },
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
                Partner/Agency
              </label>
              <SearchableSelect
                options={
                  destinationOrganisations?.map((organisation) => ({
                    value: organisation.id,
                    label: organisation.name,
                  })) || []
                }
                value={filters.destination_organisation_id || ""}
                onChange={(value) =>
                  handleFilterChange(
                    "destination_organisation_id",
                    value || undefined
                  )
                }
                placeholder="Select partner/agency..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Corridor
              </label>
              <SearchableSelect
                options={
                  corridorsData?.data?.corridors?.map((corridor) => ({
                    value: corridor.id,
                    label: corridor.name,
                  })) || []
                }
                value={filters.corridor_id || ""}
                onChange={(value) =>
                  handleFilterChange("corridor_id", value || undefined)
                }
                placeholder="Select corridor..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Till
              </label>
              <SearchableSelect
                options={
                  tillsData?.data?.tills?.map((till) => ({
                    value: till.id,
                    label: till.name,
                  })) || []
                }
                value={filters.till_id || ""}
                onChange={(value) =>
                  handleFilterChange("till_id", value || undefined)
                }
                placeholder="Select till..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <SearchableSelect
                options={
                  customersData?.data?.customers?.map((customer) => ({
                    value: customer.id,
                    label: `${customer.first_name} ${customer.last_name}`,
                  })) || []
                }
                value={filters.customer_id || ""}
                onChange={(value) =>
                  handleFilterChange("customer_id", value || undefined)
                }
                placeholder="Select customer..."
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
                setBaseFilters({
                  page: 1,
                  limit: 10,
                  search: "",
                  direction: "OUTBOUND",
                  status: undefined,
                  remittance_status: undefined,
                  corridor_id: undefined,
                  till_id: undefined,
                  customer_id: undefined,
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
        <TransactionsTable
          transactions={transactions}
          onView={handleViewTransaction}
          onCancel={handleCancelTransaction}
          onReverse={handleReverseTransaction}
          onApprove={handleApproveTransaction}
          onUpdate={handleUpdateTransaction}
          onMarkAsReady={handleMarkAsReady}
          isLoading={isLoadingTransactions || isLoadingStats}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </Button>
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TransactionForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateTransaction}
        isLoading={createTransactionMutation.isPending}
        organisationId={effectiveOrganisationId}
        mode="create"
      />

      <TransactionForm
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTransaction(null);
        }}
        onSubmit={handleUpdateTransactionSubmit}
        isLoading={updateTransactionMutation.isPending}
        organisationId={effectiveOrganisationId}
        mode="edit"
        transaction={selectedTransaction}
      />

      <MarkAsReadyModal
        isOpen={isMarkAsReadyModalOpen}
        onClose={() => {
          setIsMarkAsReadyModalOpen(false);
          setSelectedTransaction(null);
        }}
        onConfirm={handleMarkAsReadySubmit}
        transaction={selectedTransaction}
        isLoading={markAsReadyMutation.isPending}
      />

      <TransactionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        transaction={selectedTransaction}
        onCancel={handleCancelTransaction}
        onReverse={handleReverseTransaction}
        onApprove={handleApproveTransaction}
        onUpdate={handleUpdateTransaction}
        onMarkAsReady={handleMarkAsReady}
        isLoading={
          cancelTransactionMutation.isPending ||
          reverseTransactionMutation.isPending ||
          approveTransactionMutation.isPending ||
          markAsReadyMutation.isPending ||
          updateTransactionMutation.isPending
        }
      />

      <ApproveTransactionModal
        isOpen={isApproveModalOpen}
        onClose={() => {
          setIsApproveModalOpen(false);
          setSelectedTransaction(null);
        }}
        onApprove={handleApproveConfirm}
        transaction={selectedTransaction}
        isLoading={approveTransactionMutation.isPending}
      />
    </>
  );
};

export default OutboundTransactions;
