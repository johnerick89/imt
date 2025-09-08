import React, { useState } from "react";
import { FiPlus, FiFilter, FiRefreshCw } from "react-icons/fi";
import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import BankAccountForm from "../components/BankAccountForm";
import BankAccountsTable from "../components/BankAccountsTable";
import BalanceOperationModal from "../components/BalanceOperationModal";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useSession, useCurrencies, useOrganisations } from "../hooks";
import {
  useBankAccounts,
  useBankAccountStats,
  useCreateBankAccount,
  useUpdateBankAccount,
  useDeleteBankAccount,
  useTopupBankAccount,
  useWithdrawFromBankAccount,
} from "../hooks/useBankAccounts";
import { formatToCurrency } from "../utils/textUtils";
import type {
  BankAccount,
  BankAccountFilters,
  CreateBankAccountRequest,
  UpdateBankAccountRequest,
  TopupRequest,
  WithdrawalRequest,
} from "../types/BankAccountsTypes";

const BankAccountsPage: React.FC = () => {
  const { user } = useSession();

  // Filter state
  const [filters, setFilters] = useState<BankAccountFilters>({
    page: 1,
    limit: 10,
    search: "",
    currency_id: "",
    organisation_id: user?.organisation_id || "",
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] =
    useState<BankAccount | null>(null);

  // Data fetching
  const { data: bankAccountsData, isLoading: bankAccountsLoading } =
    useBankAccounts(filters);
  const { data: statsData } = useBankAccountStats(user?.organisation_id);
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: organisationsData } = useOrganisations({ limit: 1000 });

  const bankAccounts = bankAccountsData?.data?.bankAccounts || [];
  const stats = statsData?.data;
  const currencies = currenciesData?.data?.currencies || [];
  const organisations = organisationsData?.data?.organisations || [];

  // Mutations
  const createBankAccountMutation = useCreateBankAccount();
  const updateBankAccountMutation = useUpdateBankAccount();
  const deleteBankAccountMutation = useDeleteBankAccount();
  const topupBankAccountMutation = useTopupBankAccount();
  const withdrawFromBankAccountMutation = useWithdrawFromBankAccount();

  // Handlers
  const handleFilterChange = (
    field: keyof BankAccountFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === "page" ? (value as number) : 1,
    }));
  };

  const handleCreateBankAccount = async (
    data: CreateBankAccountRequest | UpdateBankAccountRequest
  ) => {
    try {
      await createBankAccountMutation.mutateAsync(
        data as CreateBankAccountRequest
      );
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating bank account:", error);
    }
  };

  const handleEditBankAccount = async (data: UpdateBankAccountRequest) => {
    if (!selectedBankAccount) return;

    try {
      await updateBankAccountMutation.mutateAsync({
        id: selectedBankAccount.id,
        data,
      });
      setShowEditModal(false);
      setSelectedBankAccount(null);
    } catch (error) {
      console.error("Error updating bank account:", error);
    }
  };

  const handleDeleteBankAccount = async () => {
    if (!selectedBankAccount) return;

    try {
      await deleteBankAccountMutation.mutateAsync(selectedBankAccount.id);
      setShowDeleteModal(false);
      setSelectedBankAccount(null);
    } catch (error) {
      console.error("Error deleting bank account:", error);
    }
  };

  const handleTopupBankAccount = async (data: TopupRequest) => {
    if (!selectedBankAccount) return;

    try {
      await topupBankAccountMutation.mutateAsync({
        id: selectedBankAccount.id,
        data,
      });
      setShowTopupModal(false);
      setSelectedBankAccount(null);
    } catch (error) {
      console.error("Error topping up bank account:", error);
    }
  };

  const handleWithdrawFromBankAccount = async (data: WithdrawalRequest) => {
    if (!selectedBankAccount) return;

    try {
      await withdrawFromBankAccountMutation.mutateAsync({
        id: selectedBankAccount.id,
        data,
      });
      setShowWithdrawModal(false);
      setSelectedBankAccount(null);
    } catch (error) {
      console.error("Error withdrawing from bank account:", error);
    }
  };

  const openEditModal = (bankAccount: BankAccount) => {
    setSelectedBankAccount(bankAccount);
    setShowEditModal(true);
  };

  const openDeleteModal = (bankAccount: BankAccount) => {
    setSelectedBankAccount(bankAccount);
    setShowDeleteModal(true);
  };

  const openTopupModal = (bankAccount: BankAccount) => {
    setSelectedBankAccount(bankAccount);
    setShowTopupModal(true);
  };

  const openWithdrawModal = (bankAccount: BankAccount) => {
    setSelectedBankAccount(bankAccount);
    setShowWithdrawModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bank Accounts</h1>
          <p className="text-gray-600">Manage bank accounts and balances</p>
        </div>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2"
        >
          <FiPlus className="h-4 w-4" />
          <span>Add Bank Account</span>
        </Button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiRefreshCw className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Accounts
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalBankAccounts}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiRefreshCw className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Balance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatToCurrency(stats.totalBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FiRefreshCw className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Locked Balance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatToCurrency(stats.totalLockedBalance)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiRefreshCw className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Available Balance
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatToCurrency(
                    stats.totalBalance - stats.totalLockedBalance
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search by name, account number, or bank"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <SearchableSelect
              value={filters.currency_id || ""}
              onChange={(value) => handleFilterChange("currency_id", value)}
              options={currencies.map((currency) => ({
                value: currency.id,
                label: `${currency.currency_code} - ${currency.currency_name}`,
              }))}
              placeholder="Filter by currency"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organisation
            </label>
            <SearchableSelect
              value={filters.organisation_id || ""}
              onChange={(value) => handleFilterChange("organisation_id", value)}
              options={organisations.map((org) => ({
                value: org.id,
                label: `${org.name} (${org.type})`,
              }))}
              placeholder="Filter by organisation"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 10,
                  search: "",
                  currency_id: "",
                  organisation_id: user?.organisation_id || "",
                })
              }
              variant="outline"
              className="w-full"
            >
              <FiFilter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow">
        <BankAccountsTable
          data={bankAccounts}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onTopup={openTopupModal}
          onWithdraw={openWithdrawModal}
          isLoading={bankAccountsLoading}
        />
      </div>

      {/* Pagination */}
      {bankAccountsData?.data?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to{" "}
            {Math.min(
              (filters.page || 1) * (filters.limit || 10),
              bankAccountsData.data.pagination.total
            )}{" "}
            of {bankAccountsData.data.pagination.total} results
          </p>
          <div className="flex space-x-2">
            <Button
              onClick={() =>
                handleFilterChange("page", (filters.page || 1) - 1)
              }
              disabled={filters.page === 1}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              onClick={() =>
                handleFilterChange("page", (filters.page || 1) + 1)
              }
              disabled={
                (filters.page || 1) >=
                bankAccountsData.data.pagination.totalPages
              }
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Bank Account"
        size="lg"
      >
        <BankAccountForm
          onSubmit={handleCreateBankAccount}
          isLoading={createBankAccountMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedBankAccount(null);
        }}
        title="Edit Bank Account"
        size="lg"
      >
        <BankAccountForm
          initialData={selectedBankAccount || undefined}
          onSubmit={handleEditBankAccount}
          isLoading={updateBankAccountMutation.isPending}
          isEdit={true}
        />
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedBankAccount(null);
        }}
        onConfirm={handleDeleteBankAccount}
        title="Delete Bank Account"
        message={`Are you sure you want to delete "${selectedBankAccount?.name}"? This action cannot be undone.`}
        isLoading={deleteBankAccountMutation.isPending}
      />

      {/* Topup Modal */}
      <BalanceOperationModal
        isOpen={showTopupModal}
        onClose={() => {
          setShowTopupModal(false);
          setSelectedBankAccount(null);
        }}
        onSubmit={(data) => handleTopupBankAccount(data as TopupRequest)}
        isLoading={topupBankAccountMutation.isPending}
        operationType="topup"
        title="Top Up Bank Account"
        sourceType="BANK_ACCOUNT"
      />

      {/* Withdraw Modal */}
      <BalanceOperationModal
        isOpen={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          setSelectedBankAccount(null);
        }}
        onSubmit={(data) =>
          handleWithdrawFromBankAccount(data as WithdrawalRequest)
        }
        isLoading={withdrawFromBankAccountMutation.isPending}
        operationType="withdrawal"
        title="Withdraw from Bank Account"
        destinationType="BANK_ACCOUNT"
      />
    </div>
  );
};

export default BankAccountsPage;
