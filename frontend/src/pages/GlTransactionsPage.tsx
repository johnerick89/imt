import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import {
  useGlTransactions,
  useGlTransactionStats,
  useReverseGlTransaction,
} from "../hooks/useGlTransactions";
import { useCurrencies } from "../hooks/useCurrencies";
import { useVaults } from "../hooks/useVaults";
import { useTills } from "../hooks/useTills";
import { useCustomers } from "../hooks/useCustomers";
import GlTransactionsTable from "../components/GlTransactionsTable";
import GlTransactionDetailsModal from "../components/GlTransactionDetailsModal";
import ReverseGlTransactionModal from "../components/ReverseGlTransactionModal";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { Input } from "../components/ui/Input";
import { formatToCurrency } from "../utils/textUtils";
import type {
  GlTransaction,
  GlTransactionFilters,
} from "../types/GlTransactionsTypes";

const GlTransactionsPage: React.FC = () => {
  const { id: organisationId } = useParams<{ id: string }>();
  const { user } = useSession();
  const [selectedTransaction, setSelectedTransaction] =
    useState<GlTransaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isReverseModalOpen, setIsReverseModalOpen] = useState(false);
  const [transactionToReverse, setTransactionToReverse] =
    useState<GlTransaction | null>(null);

  // Use the current user's organisation if no organisationId in URL
  const effectiveOrganisationId = organisationId || user?.organisation_id;

  const [filters, setFilters] = useState<GlTransactionFilters>({
    page: 1,
    limit: 10,
    search: "",
    transaction_type: undefined,
    status: undefined,
    currency_id: undefined,
    vault_id: undefined,
    user_till_id: undefined,
    customer_id: undefined,
    transaction_id: undefined,
    date_from: undefined,
    date_to: undefined,
  });

  // Fetch data
  const { data: glTransactionsData, isLoading: isLoadingTransactions } =
    useGlTransactions(effectiveOrganisationId || "", filters);
  const { data: statsData, isLoading: isLoadingStats } = useGlTransactionStats(
    effectiveOrganisationId || ""
  );
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: vaultsData } = useVaults({
    organisation_id: effectiveOrganisationId || "",
  });
  const { data: tillsData } = useTills({
    organisation_id: effectiveOrganisationId || "",
  });
  const { data: customersData } = useCustomers({
    organisation_id: effectiveOrganisationId || "",
  });

  const reverseGlTransactionMutation = useReverseGlTransaction();

  // Handle filter changes
  const handleFilterChange = (
    key: keyof GlTransactionFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Handle view transaction details
  const handleViewTransaction = (transaction: GlTransaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  // Handle reverse transaction
  const handleReverseTransaction = (transaction: GlTransaction) => {
    setTransactionToReverse(transaction);
    setIsReverseModalOpen(true);
  };

  // Confirm reverse transaction
  const handleConfirmReverse = async (description?: string) => {
    if (!transactionToReverse || !effectiveOrganisationId) return;

    try {
      await reverseGlTransactionMutation.mutateAsync({
        organisationId: effectiveOrganisationId,
        transactionId: transactionToReverse.id,
        data: { description },
      });
      setIsReverseModalOpen(false);
      setTransactionToReverse(null);
    } catch (error) {
      console.error("Error reversing transaction:", error);
    }
  };

  // Close modals
  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleCloseReverseModal = () => {
    setIsReverseModalOpen(false);
    setTransactionToReverse(null);
  };

  if (!effectiveOrganisationId) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            GL Transactions
          </h1>
          <p className="text-gray-600">No organisation selected.</p>
        </div>
      </div>
    );
  }

  const stats = statsData?.data;
  const glTransactions = glTransactionsData?.data?.glTransactions || [];
  const pagination = glTransactionsData?.data?.pagination;

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          GL Transactions
        </h1>
        <p className="text-gray-600">
          View and manage General Ledger transactions for your organisation.
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="space-y-4 mb-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <svg
                    className="h-4 w-4 text-blue-600"
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
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">
                    Total Transactions
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.totalTransactions}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <svg
                    className="h-4 w-4 text-green-600"
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
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">
                    Currencies
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.byCurrency.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-1.5 bg-yellow-100 rounded-lg">
                  <svg
                    className="h-4 w-4 text-yellow-600"
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
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Pending</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.byStatus.find((s) => s.status === "PENDING")
                      ?.count || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="p-1.5 bg-red-100 rounded-lg">
                  <svg
                    className="h-4 w-4 text-red-600"
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
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Failed</p>
                  <p className="text-lg font-bold text-gray-900">
                    {stats.byStatus.find((s) => s.status === "FAILED")?.count ||
                      0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Currency & Type Breakdown - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Currency Breakdown */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Amounts by Currency
              </h3>
              <div className="space-y-2">
                {stats.byCurrency.map((currency) => (
                  <div
                    key={currency.currency_id}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">
                        {currency.currency_code}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({currency.count})
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {formatToCurrency(currency.total_amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transaction Type Breakdown */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Amounts by Type
              </h3>
              <div className="space-y-2">
                {stats.byType.map((type) => (
                  <div
                    key={type.type}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {type.type.toLowerCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({type.count})
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {formatToCurrency(type.total_amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search transactions..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Transaction Type
            </label>
            <SearchableSelect
              options={[
                { value: "VAULT_WITHDRAWAL", label: "Vault Withdrawal" },
                { value: "VAULT_DEPOSIT", label: "Vault Deposit" },
                { value: "TILL_OPEN", label: "Till Open" },
                { value: "TILL_CLOSE", label: "Till Close" },
                { value: "TILL_TOPUP", label: "Till Topup" },
                { value: "TILL_WITHDRAWAL", label: "Till Withdrawal" },
                {
                  value: "OUTBOUND_TRANSACTION",
                  label: "Outbound Transaction",
                },
                { value: "INBOUND_TRANSACTION", label: "Inbound Transaction" },
              ]}
              value={filters.transaction_type || ""}
              onChange={(value) =>
                handleFilterChange("transaction_type", value || undefined)
              }
              placeholder="Select type..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <SearchableSelect
              options={[
                { value: "PENDING", label: "Pending" },
                { value: "APPROVED", label: "Approved" },
                { value: "POSTED", label: "Posted" },
                { value: "FAILED", label: "Failed" },
              ]}
              value={filters.status || ""}
              onChange={(value) =>
                handleFilterChange("status", value || undefined)
              }
              placeholder="Select status..."
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
              value={filters.currency_id || ""}
              onChange={(value) =>
                handleFilterChange("currency_id", value || undefined)
              }
              placeholder="Select currency..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vault
            </label>
            <SearchableSelect
              options={
                vaultsData?.data?.vaults?.map((vault) => ({
                  value: vault.id,
                  label: vault.name,
                })) || []
              }
              value={filters.vault_id || ""}
              onChange={(value) =>
                handleFilterChange("vault_id", value || undefined)
              }
              placeholder="Select vault..."
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
              value={filters.user_till_id || ""}
              onChange={(value) =>
                handleFilterChange("user_till_id", value || undefined)
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
                transaction_type: undefined,
                status: undefined,
                currency_id: undefined,
                vault_id: undefined,
                user_till_id: undefined,
                customer_id: undefined,
                transaction_id: undefined,
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

      {/* GL Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <GlTransactionsTable
          data={glTransactions}
          onView={handleViewTransaction}
          onReverse={handleReverseTransaction}
          isLoading={isLoadingTransactions || isLoadingStats}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <GlTransactionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        transaction={selectedTransaction}
      />

      <ReverseGlTransactionModal
        isOpen={isReverseModalOpen}
        onClose={handleCloseReverseModal}
        onConfirm={handleConfirmReverse}
        transaction={transactionToReverse}
        isLoading={reverseGlTransactionMutation.isPending}
      />
    </div>
  );
};

export default GlTransactionsPage;
