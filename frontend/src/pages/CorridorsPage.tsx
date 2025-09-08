import React, { useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { Input } from "../components/ui/Input";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import CorridorsTable from "../components/CorridorsTable";
import CorridorForm from "../components/CorridorForm";
import {
  useCorridors,
  useCorridorStats,
  useCreateCorridor,
  useUpdateCorridor,
  useDeleteCorridor,
  useSession,
  useCountries,
  useCurrencies,
} from "../hooks";
import type {
  Corridor,
  CreateCorridorRequest,
  UpdateCorridorRequest,
  CorridorFilters,
} from "../types/CorridorsTypes";

const CorridorsPage: React.FC = () => {
  const { user: currentUser } = useSession();

  // Filter state
  const [filters, setFilters] = useState<CorridorFilters>({
    page: 1,
    limit: 10,
    search: "",
    status: undefined,
    base_country_id: "",
    destination_country_id: "",
    base_currency_id: "",
    organisation_id: currentUser?.organisation_id || "",
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCorridor, setSelectedCorridor] = useState<Corridor | null>(
    null
  );

  // Data fetching
  const { data: corridorsData, isLoading } = useCorridors(filters);
  const { data: statsData } = useCorridorStats();
  const { data: countriesData } = useCountries({ limit: 1000 });
  const { data: currenciesData } = useCurrencies({ limit: 1000 });

  // Mutations
  const createCorridorMutation = useCreateCorridor();
  const updateCorridorMutation = useUpdateCorridor();
  const deleteCorridorMutation = useDeleteCorridor();

  const corridors = corridorsData?.data?.corridors || [];
  const pagination = corridorsData?.data?.pagination;
  const stats = statsData?.data;
  const countries = countriesData?.data?.countries || [];
  const currencies = currenciesData?.data?.currencies || [];

  // Filter options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
    { value: "PENDING", label: "Pending" },
    { value: "BLOCKED", label: "Blocked" },
  ];

  const countryOptions = [
    { value: "", label: "All Countries" },
    ...countries.map((country) => ({
      value: country.id,
      label: country.name,
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
    field: keyof CorridorFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === "page" ? (value as number) : 1, // Reset to page 1 when changing filters
    }));
  };

  const handleCreateCorridor = async (data: CreateCorridorRequest) => {
    try {
      const result = await createCorridorMutation.mutateAsync(data);
      if (result.success) {
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create corridor:", error);
    }
  };

  const handleEditCorridor = async (data: UpdateCorridorRequest) => {
    if (!selectedCorridor) return;

    try {
      const result = await updateCorridorMutation.mutateAsync({
        id: selectedCorridor.id,
        corridorData: data,
      });
      if (result.success) {
        setShowEditModal(false);
        setSelectedCorridor(null);
      }
    } catch (error) {
      console.error("Failed to update corridor:", error);
    }
  };

  const handleDeleteCorridor = async () => {
    if (!selectedCorridor) return;

    try {
      const result = await deleteCorridorMutation.mutateAsync(
        selectedCorridor.id
      );
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedCorridor(null);
      }
    } catch (error) {
      console.error("Failed to delete corridor:", error);
    }
  };

  const handleToggleStatus = async (
    corridor: Corridor,
    currentStatus: string
  ) => {
    if (!corridor) return;

    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateCorridorMutation.mutateAsync({
        id: corridor.id,
        corridorData: {
          status: newStatus as "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED",
        },
      });
    } catch (error) {
      console.error("Failed to toggle corridor status:", error);
    }
  };

  const openCreateModal = () => setShowCreateModal(true);
  const openEditModal = (corridor: Corridor) => {
    setSelectedCorridor(corridor);
    setShowEditModal(true);
  };
  const openDeleteModal = (corridor: Corridor) => {
    setSelectedCorridor(corridor);
    setShowDeleteModal(true);
  };

  // Loading state
  const isAnyMutationLoading =
    createCorridorMutation.isPending ||
    updateCorridorMutation.isPending ||
    deleteCorridorMutation.isPending;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Corridors</h1>
          <p className="text-gray-600">Manage payment corridors</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          Create Corridor
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Corridors</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {stats.active}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {stats.inactive}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pending}
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
              placeholder="Search corridors..."
              value={filters.search || ""}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              className="pl-10"
            />
          </div>
          <SearchableSelect
            value={filters.status || ""}
            onChange={(value) => handleFilterChange("status", value)}
            options={statusOptions}
            placeholder="Filter by status"
          />
          <SearchableSelect
            value={filters.base_country_id || ""}
            onChange={(value) => handleFilterChange("base_country_id", value)}
            options={countryOptions}
            placeholder="Filter by origin country"
          />
          <SearchableSelect
            value={filters.destination_country_id || ""}
            onChange={(value) =>
              handleFilterChange("destination_country_id", value)
            }
            options={countryOptions}
            placeholder="Filter by destination country"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SearchableSelect
            value={filters.base_currency_id || ""}
            onChange={(value) => handleFilterChange("base_currency_id", value)}
            options={currencyOptions}
            placeholder="Filter by origin currency"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <CorridorsTable
          data={corridors}
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
        title="Create Corridor"
        size="lg"
      >
        <CorridorForm
          onSubmit={(data: CreateCorridorRequest | UpdateCorridorRequest) =>
            handleCreateCorridor(data as CreateCorridorRequest)
          }
          isLoading={isAnyMutationLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCorridor(null);
        }}
        title="Edit Corridor"
        size="lg"
      >
        {selectedCorridor && (
          <CorridorForm
            initialData={selectedCorridor}
            onSubmit={handleEditCorridor}
            isLoading={isAnyMutationLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCorridor(null);
        }}
        onConfirm={handleDeleteCorridor}
        title="Delete Corridor"
        message={`Are you sure you want to delete the corridor "${selectedCorridor?.name}"? This action cannot be undone.`}
        isLoading={isAnyMutationLoading}
      />
    </div>
  );
};

export default CorridorsPage;
