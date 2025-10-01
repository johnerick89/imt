import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiPlus, FiSearch } from "react-icons/fi";
import { Input } from "../components/ui/Input";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import TillsTable from "../components/TillsTable";
import TillForm from "../components/TillForm";
import TillTopupForm from "../components/TillTopupForm";
import {
  useTills,
  useTillStats,
  useCreateTill,
  useUpdateTill,
  useDeleteTill,
  useOpenTill,
  useCloseTill,
  useBlockTill,
  useDeactivateTill,
  useSession,
  useVaults,
  useCurrencies,
} from "../hooks";
import { useTopupTill, useWithdrawTill } from "../hooks/useBalanceOperations";
import { TillStatus } from "../types/TillsTypes";
import type {
  Till,
  CreateTillRequest,
  UpdateTillRequest,
  TillFilters,
} from "../types/TillsTypes";
import type { TillTopupRequest } from "../types/BalanceOperationsTypes";
import { usePermissions } from "../hooks/usePermissions";

const TillsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useSession();
  const organisationId = currentUser?.organisation_id;
  const { canCreateTills } = usePermissions();
  // Filter state
  const [filters, setFilters] = useState<TillFilters>({
    page: 1,
    limit: 10,
    search: "",
    status: "" as TillStatus,
    vault_id: "",
    currency_id: "",
    organisation_id: organisationId || "",
  });

  console.log("filters", filters);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTopupModal, setShowTopupModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedTill, setSelectedTill] = useState<Till | null>(null);

  // Data fetching
  const { data: tillsData, isLoading } = useTills(filters);
  const { data: statsData } = useTillStats({ organisation_id: organisationId });
  const { data: vaultsData } = useVaults({
    limit: 100,
    organisation_id: organisationId || "",
  });
  const { data: currenciesData } = useCurrencies({ limit: 1000 });

  // Mutations
  const createTillMutation = useCreateTill();
  const updateTillMutation = useUpdateTill();
  const deleteTillMutation = useDeleteTill();
  const openTillMutation = useOpenTill();
  const closeTillMutation = useCloseTill();
  const blockTillMutation = useBlockTill();
  const deactivateTillMutation = useDeactivateTill();
  const topupTillMutation = useTopupTill();
  const withdrawTillMutation = useWithdrawTill();

  const tills = tillsData?.data?.tills || [];
  const pagination = tillsData?.data?.pagination;
  const stats = statsData?.data;
  const vaults = vaultsData?.data?.vaults || [];
  const currencies = currenciesData?.data?.currencies || [];

  // Filter options
  const statusOptions = [
    { value: "" as TillStatus, label: "All Statuses" },
    { value: TillStatus.ACTIVE, label: "Active" },
    { value: TillStatus.INACTIVE, label: "Inactive" },
    { value: TillStatus.PENDING, label: "Pending" },
    { value: TillStatus.BLOCKED, label: "Blocked" },
  ];

  const vaultOptions = [
    { value: "", label: "All Vaults" },
    ...vaults.map((vault) => ({
      value: vault.id,
      label: vault.name,
    })),
  ];

  const currencyOptions = [
    { value: "", label: "All Currencies" },
    ...currencies.map((currency) => ({
      value: currency.id,
      label: `${currency.currency_code} - ${currency.currency_name}`,
    })),
  ];

  // Handlers
  const handleFilterChange = (
    field: keyof TillFilters,
    value: string | number | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value || undefined,
      page: field === "page" ? (value as number) : 1, // Reset to page 1 when changing filters
    }));
  };

  const handleCreateTill = async (data: CreateTillRequest) => {
    try {
      const result = await createTillMutation.mutateAsync(data);
      if (result.success) {
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create till:", error);
    }
  };

  const handleEditTill = async (data: UpdateTillRequest) => {
    if (!selectedTill) return;

    try {
      const result = await updateTillMutation.mutateAsync({
        id: selectedTill.id,
        data,
      });
      if (result.success) {
        setShowEditModal(false);
        setSelectedTill(null);
      }
    } catch (error) {
      console.error("Failed to update till:", error);
    }
  };

  const handleDeleteTill = async () => {
    if (!selectedTill) return;

    try {
      const result = await deleteTillMutation.mutateAsync(selectedTill.id);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedTill(null);
      }
    } catch (error) {
      console.error("Failed to delete till:", error);
    }
  };

  const handleOpenTill = async (till: Till) => {
    try {
      const result = await openTillMutation.mutateAsync(till.id);
      if (result.success) {
        console.log("Till opened successfully");
      }
    } catch (error) {
      console.error("Failed to open till:", error);
    }
  };

  const handleCloseTill = async (till: Till) => {
    try {
      const result = await closeTillMutation.mutateAsync(till.id);
      if (result.success) {
        console.log("Till closed successfully");
      }
    } catch (error) {
      console.error("Failed to close till:", error);
    }
  };

  const handleBlockTill = async (till: Till) => {
    try {
      const result = await blockTillMutation.mutateAsync(till.id);
      if (result.success) {
        console.log("Till blocked successfully");
      }
    } catch (error) {
      console.error("Failed to block till:", error);
    }
  };

  const handleDeactivateTill = async (till: Till) => {
    try {
      const result = await deactivateTillMutation.mutateAsync(till.id);
      if (result.success) {
        console.log("Till deactivated successfully");
      }
    } catch (error) {
      console.error("Failed to deactivate till:", error);
    }
  };

  // Balance operation handlers
  const handleTopupTill = async (data: TillTopupRequest) => {
    if (!selectedTill) return;
    try {
      await topupTillMutation.mutateAsync({
        tillId: selectedTill.id,
        data,
      });
      // If we reach here, the mutation was successful
      setShowTopupModal(false);
      setSelectedTill(null);
    } catch (error) {
      // Error handling is done in the hook with toast notifications
      // Don't close modal on error so user can retry
      console.error("Failed to topup till:", error);
    }
  };

  const handleWithdrawTill = async (data: TillTopupRequest) => {
    if (!selectedTill) return;
    try {
      await withdrawTillMutation.mutateAsync({
        tillId: selectedTill.id,
        data,
      });
      // If we reach here, the mutation was successful
      setShowWithdrawModal(false);
      setSelectedTill(null);
    } catch (error) {
      // Error handling is done in the hook with toast notifications
      // Don't close modal on error so user can retry
      console.error("Failed to withdraw from till:", error);
    }
  };

  const openCreateModal = () => setShowCreateModal(true);
  const openEditModal = (till: Till) => {
    setSelectedTill(till);
    setShowEditModal(true);
  };
  const openDeleteModal = (till: Till) => {
    setSelectedTill(till);
    setShowDeleteModal(true);
  };

  const handleViewTill = (till: Till) => {
    navigate(`/tills/${till.id}`);
  };

  // Loading state
  const isAnyMutationLoading =
    createTillMutation.isPending ||
    updateTillMutation.isPending ||
    deleteTillMutation.isPending ||
    openTillMutation.isPending ||
    closeTillMutation.isPending ||
    blockTillMutation.isPending ||
    deactivateTillMutation.isPending;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tills</h1>
          <p className="text-gray-600">Manage till operations</p>
        </div>
        {canCreateTills() && (
          <button
            onClick={openCreateModal}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
          >
            <FiPlus className="h-4 w-4" />
            Create Till
          </button>
        )}
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalTills}
            </div>
            <div className="text-sm text-gray-600">Total Tills</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {stats.activeTills}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {stats.inactiveTills}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {stats.blockedTills}
            </div>
            <div className="text-sm text-gray-600">Blocked</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search...
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search tills..."
                value={filters.search || ""}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <SearchableSelect
              value={filters.status || ""}
              onChange={(value) => handleFilterChange("status", value)}
              options={statusOptions}
              placeholder="Filter by status"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vault
            </label>
            <SearchableSelect
              value={filters.vault_id || ""}
              onChange={(value) => handleFilterChange("vault_id", value)}
              options={vaultOptions}
              placeholder="Filter by vault"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency
            </label>
            <SearchableSelect
              value={filters.currency_id || ""}
              onChange={(value) => handleFilterChange("currency_id", value)}
              options={currencyOptions}
              placeholder="Filter by currency"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <TillsTable
          data={tills}
          isLoading={isLoading}
          onView={handleViewTill}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onOpen={handleOpenTill}
          onClose={handleCloseTill}
          onBlock={handleBlockTill}
          onDeactivate={handleDeactivateTill}
          onTopup={(till) => {
            setSelectedTill(till);
            setShowTopupModal(true);
          }}
          onWithdraw={(till) => {
            setSelectedTill(till);
            setShowWithdrawModal(true);
          }}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleFilterChange("page", pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handleFilterChange("page", pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Till"
        size="lg"
      >
        <TillForm
          onSubmit={(data) => handleCreateTill(data as CreateTillRequest)}
          isLoading={isAnyMutationLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTill(null);
        }}
        title="Edit Till"
        size="lg"
      >
        {selectedTill && (
          <TillForm
            initialData={selectedTill}
            onSubmit={handleEditTill}
            isLoading={isAnyMutationLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTill(null);
        }}
        onConfirm={handleDeleteTill}
        title="Delete Till"
        message={`Are you sure you want to delete "${selectedTill?.name}"? This action cannot be undone.`}
        isLoading={isAnyMutationLoading}
      />

      {/* Topup Modal */}
      <Modal
        isOpen={showTopupModal}
        onClose={() => setShowTopupModal(false)}
        title="Topup Till"
        size="md"
      >
        <TillTopupForm
          onSubmit={handleTopupTill}
          isLoading={topupTillMutation.isPending}
          operation="topup"
          tillCurrencyId={selectedTill?.currency_id || undefined}
        />
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        title="Withdraw from Till"
        size="md"
      >
        <TillTopupForm
          onSubmit={handleWithdrawTill}
          isLoading={withdrawTillMutation.isPending}
          operation="withdraw"
          tillCurrencyId={selectedTill?.currency_id || undefined}
        />
      </Modal>
    </div>
  );
};

export default TillsPage;
