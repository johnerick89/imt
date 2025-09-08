import React, { useState } from "react";
import { FiPlus, FiFilter, FiRefreshCw, FiSettings } from "react-icons/fi";
import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import GlAccountForm from "../components/GlAccountForm";
import GlAccountsTable from "../components/GlAccountsTable";
import GenerateAccountsModal from "../components/GenerateAccountsModal";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { useSession, useCurrencies } from "../hooks";
import {
  useGlAccounts,
  useGlAccountStats,
  useCreateGlAccount,
  useUpdateGlAccount,
  useDeleteGlAccount,
  useGenerateGlAccounts,
} from "../hooks/useGlAccounts";
import { formatToCurrency } from "../utils/textUtils";
import type {
  GlAccount,
  GlAccountFilters,
  CreateGlAccountRequest,
  UpdateGlAccountRequest,
  GenerateAccountsRequest,
} from "../types/GlAccountsTypes";

const GlAccountsPage: React.FC = () => {
  const { user } = useSession();

  // Filter state
  const [filters, setFilters] = useState<GlAccountFilters>({
    page: 1,
    limit: 10,
    search: "",
    type: undefined,
    currency_id: "",
    organisation_id: user?.organisation_id || "",
    is_closed: undefined,
    is_frozen: undefined,
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedGlAccount, setSelectedGlAccount] = useState<GlAccount | null>(
    null
  );

  // Data fetching
  const { data: glAccountsData, isLoading: glAccountsLoading } =
    useGlAccounts(filters);
  const { data: statsData } = useGlAccountStats(user?.organisation_id);
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  // const { data: organisationsData } = useOrganisations({ limit: 1000 });

  const glAccounts = glAccountsData?.data?.glAccounts || [];
  const stats = statsData?.data;
  const currencies = currenciesData?.data?.currencies || [];
  // const organisations = organisationsData?.data?.organisations || [];

  // Mutations
  const createGlAccountMutation = useCreateGlAccount();
  const updateGlAccountMutation = useUpdateGlAccount();
  const deleteGlAccountMutation = useDeleteGlAccount();
  const generateGlAccountsMutation = useGenerateGlAccounts();

  // Handlers
  const handleFilterChange = (
    field: keyof GlAccountFilters,
    value: string | number | boolean | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === "page" ? (value as number) : 1,
    }));
  };

  const handleCreateGlAccount = async (data: CreateGlAccountRequest) => {
    try {
      await createGlAccountMutation.mutateAsync(data);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating GL account:", error);
    }
  };

  const handleEditGlAccount = async (data: UpdateGlAccountRequest) => {
    if (!selectedGlAccount) return;

    try {
      await updateGlAccountMutation.mutateAsync({
        id: selectedGlAccount.id,
        data,
      });
      setShowEditModal(false);
      setSelectedGlAccount(null);
    } catch (error) {
      console.error("Error updating GL account:", error);
    }
  };

  const handleDeleteGlAccount = async () => {
    if (!selectedGlAccount) return;

    try {
      await deleteGlAccountMutation.mutateAsync(selectedGlAccount.id);
      setShowDeleteModal(false);
      setSelectedGlAccount(null);
    } catch (error) {
      console.error("Error deleting GL account:", error);
    }
  };

  const handleGenerateGlAccounts = async (data: GenerateAccountsRequest) => {
    try {
      await generateGlAccountsMutation.mutateAsync(data);
      setShowGenerateModal(false);
    } catch (error) {
      console.error("Error generating GL accounts:", error);
    }
  };

  const openEditModal = (glAccount: GlAccount) => {
    setSelectedGlAccount(glAccount);
    setShowEditModal(true);
  };

  const openDeleteModal = (glAccount: GlAccount) => {
    setSelectedGlAccount(glAccount);
    setShowDeleteModal(true);
  };

  const accountTypes = [
    { value: "", label: "All Types" },
    { value: "ASSET", label: "Asset" },
    { value: "LIABILITY", label: "Liability" },
    { value: "EQUITY", label: "Equity" },
    { value: "REVENUE", label: "Revenue" },
    { value: "EXPENSE", label: "Expense" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "closed", label: "Closed" },
    { value: "frozen", label: "Frozen" },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">GL Accounts</h1>
          <p className="text-gray-600">Manage general ledger accounts</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowGenerateModal(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <FiSettings className="h-4 w-4" />
            <span>Generate Accounts</span>
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <FiPlus className="h-4 w-4" />
            <span>Add GL Account</span>
          </Button>
        </div>
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
                  {stats.totalGlAccounts}
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Search by name or type"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <SearchableSelect
              value={filters.type || ""}
              onChange={(value) =>
                handleFilterChange("type", value || undefined)
              }
              options={accountTypes}
              placeholder="Filter by type"
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
              Status
            </label>
            <SearchableSelect
              value={
                filters.is_closed === true
                  ? "closed"
                  : filters.is_frozen === true
                  ? "frozen"
                  : "active"
              }
              onChange={(value) => {
                if (value === "closed") {
                  handleFilterChange("is_closed", true);
                  handleFilterChange("is_frozen", undefined);
                } else if (value === "frozen") {
                  handleFilterChange("is_frozen", true);
                  handleFilterChange("is_closed", undefined);
                } else {
                  handleFilterChange("is_closed", undefined);
                  handleFilterChange("is_frozen", undefined);
                }
              }}
              options={statusOptions}
              placeholder="Filter by status"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={() =>
                setFilters({
                  page: 1,
                  limit: 10,
                  search: "",
                  type: undefined,
                  currency_id: "",
                  organisation_id: user?.organisation_id || "",
                  is_closed: undefined,
                  is_frozen: undefined,
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
        <GlAccountsTable
          data={glAccounts}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          isLoading={glAccountsLoading}
        />
      </div>

      {/* Pagination */}
      {glAccountsData?.data?.pagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to{" "}
            {Math.min(
              (filters.page || 1) * (filters.limit || 10),
              glAccountsData.data.pagination.total
            )}{" "}
            of {glAccountsData.data.pagination.total} results
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
                (filters.page || 1) >= glAccountsData.data.pagination.totalPages
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
        title="Create GL Account"
        size="lg"
      >
        <GlAccountForm
          onSubmit={(data: CreateGlAccountRequest | UpdateGlAccountRequest) =>
            handleCreateGlAccount(data as CreateGlAccountRequest)
          }
          isLoading={createGlAccountMutation.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGlAccount(null);
        }}
        title="Edit GL Account"
        size="lg"
      >
        <GlAccountForm
          initialData={selectedGlAccount || undefined}
          onSubmit={handleEditGlAccount}
          isLoading={updateGlAccountMutation.isPending}
          isEdit={true}
        />
      </Modal>

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedGlAccount(null);
        }}
        onConfirm={handleDeleteGlAccount}
        title="Delete GL Account"
        message={`Are you sure you want to delete "${selectedGlAccount?.name}"? This action cannot be undone.`}
        isLoading={deleteGlAccountMutation.isPending}
      />

      {/* Generate Accounts Modal */}
      <GenerateAccountsModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        onSubmit={handleGenerateGlAccounts}
        isLoading={generateGlAccountsMutation.isPending}
      />
    </div>
  );
};

export default GlAccountsPage;
