import React, { useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { Input } from "../components/ui/Input";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import ChargesTable from "../components/ChargesTable";
import ChargeForm from "../components/ChargeForm";
import {
  useCharges,
  useChargeStats,
  useCreateCharge,
  useUpdateCharge,
  useDeleteCharge,
  useSession,
  useCurrencies,
} from "../hooks";
import type {
  Charge,
  CreateChargeRequest,
  UpdateChargeRequest,
  ChargeFilters,
  ChargeType,
} from "../types/ChargesTypes";

const ChargesPage: React.FC = () => {
  const { user: currentUser } = useSession();

  // Filter state
  const [filters, setFilters] = useState<ChargeFilters>({
    page: 1,
    limit: 10,
    search: "",
    type: "" as ChargeType,
    status: undefined,
    currency_id: "",
    origin_organisation_id: currentUser?.organisation_id || "",
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCharge, setSelectedCharge] = useState<Charge | null>(null);

  // Data fetching
  const { data: chargesData, isLoading } = useCharges(filters);
  const { data: statsData } = useChargeStats();
  const { data: currenciesData } = useCurrencies({ limit: 1000 });

  // Mutations
  const createChargeMutation = useCreateCharge();
  const updateChargeMutation = useUpdateCharge();
  const deleteChargeMutation = useDeleteCharge();

  const charges = chargesData?.data?.charges || [];
  const pagination = chargesData?.data?.pagination;
  const stats = statsData?.data;
  const currencies = currenciesData?.data?.currencies || [];

  // Filter options
  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "PERCENTAGE", label: "Percentage" },
    { value: "FIXED", label: "Fixed" },
    { value: "TIERED", label: "Tiered" },
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "PENDING", label: "Pending" },
    { value: "BLOCKED", label: "Blocked" },
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
    field: keyof ChargeFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === "page" ? (value as number) : 1, // Reset to page 1 when changing filters
    }));
  };

  const handleCreateCharge = async (data: CreateChargeRequest) => {
    try {
      const result = await createChargeMutation.mutateAsync(data);
      if (result.success) {
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create charge:", error);
    }
  };

  const handleEditCharge = async (data: UpdateChargeRequest) => {
    if (!selectedCharge) return;

    try {
      const result = await updateChargeMutation.mutateAsync({
        id: selectedCharge.id,
        data,
      });
      if (result.success) {
        setShowEditModal(false);
        setSelectedCharge(null);
      }
    } catch (error) {
      console.error("Failed to update charge:", error);
    }
  };

  const handleDeleteCharge = async () => {
    if (!selectedCharge) return;

    try {
      const result = await deleteChargeMutation.mutateAsync(selectedCharge.id);
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedCharge(null);
      }
    } catch (error) {
      console.error("Failed to delete charge:", error);
    }
  };

  const handleToggleStatus = async (charge: Charge) => {
    if (!charge) return;

    const newStatus = charge.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateChargeMutation.mutateAsync({
        id: charge.id,
        data: {
          status: newStatus as "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED",
        },
      });
    } catch (error) {
      console.error("Failed to toggle charge status:", error);
    }
  };

  const openCreateModal = () => setShowCreateModal(true);
  const openEditModal = (charge: Charge) => {
    setSelectedCharge(charge);
    setShowEditModal(true);
  };
  const openDeleteModal = (charge: Charge) => {
    setSelectedCharge(charge);
    setShowDeleteModal(true);
  };

  // Loading state
  const isAnyMutationLoading =
    createChargeMutation.isPending ||
    updateChargeMutation.isPending ||
    deleteChargeMutation.isPending;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Charges</h1>
          <p className="text-gray-600">Manage transaction charges and fees</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          Create Charge
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalCharges}
            </div>
            <div className="text-sm text-gray-600">Total Charges</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {stats.activeCharges}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {stats.inactiveCharges}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingCharges}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search charges..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
          <SearchableSelect
            value={filters.type || ""}
            onChange={(value) => handleFilterChange("type", value)}
            options={typeOptions}
            placeholder="Filter by type"
          />
          <SearchableSelect
            value={filters.status || ""}
            onChange={(value) => handleFilterChange("status", value)}
            options={statusOptions}
            placeholder="Filter by status"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <SearchableSelect
            value={filters.currency_id || ""}
            onChange={(value) => handleFilterChange("currency_id", value)}
            options={currencyOptions}
            placeholder="Filter by currency"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ChargesTable
          data={charges}
          isLoading={isLoading}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onToggleStatus={handleToggleStatus}
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
        title="Create Charge"
        size="lg"
      >
        <ChargeForm
          onSubmit={(data: CreateChargeRequest | UpdateChargeRequest) =>
            handleCreateCharge(data as CreateChargeRequest)
          }
          isLoading={isAnyMutationLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCharge(null);
        }}
        title="Edit Charge"
        size="lg"
      >
        {selectedCharge && (
          <ChargeForm
            initialData={selectedCharge}
            onSubmit={handleEditCharge}
            isLoading={isAnyMutationLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCharge(null);
        }}
        onConfirm={handleDeleteCharge}
        title="Delete Charge"
        message={`Are you sure you want to delete the charge "${selectedCharge?.name}"? This action cannot be undone.`}
        isLoading={isAnyMutationLoading}
      />
    </div>
  );
};

export default ChargesPage;
