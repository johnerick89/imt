import React, { useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import ExchangeRatesTable from "../components/ExchangeRatesTable";
import ExchangeRateForm from "../components/ExchangeRateForm";
import {
  useExchangeRates,
  useExchangeRateStats,
  useCreateExchangeRate,
  useUpdateExchangeRate,
  useDeleteExchangeRate,
  useApproveExchangeRate,
  useSession,
  useCurrencies,
  useCountries,
} from "../hooks";
import {
  ExchangeRateStatus,
  ExchangeRateOperatorStatus,
} from "../types/ExchangeRatesTypes";
import type {
  ExchangeRate,
  CreateExchangeRateRequest,
  UpdateExchangeRateRequest,
  ExchangeRateFilters,
} from "../types/ExchangeRatesTypes";

const ExchangeRates: React.FC = () => {
  const { user: currentUser } = useSession();
  const navigate = useNavigate();

  // Filter state
  const [filters, setFilters] = useState<ExchangeRateFilters>({
    page: 1,
    limit: 10,
    search: "",
    status: undefined,
    operator_status: undefined,
    from_currency_id: "",
    to_currency_id: "",
    origin_country_id: "",
    destination_country_id: "",
    organisation_id: currentUser?.organisation_id || "",
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedExchangeRate, setSelectedExchangeRate] =
    useState<ExchangeRate | null>(null);

  // Data fetching
  const { data: exchangeRatesData, isLoading } = useExchangeRates(filters);
  const { data: statsData } = useExchangeRateStats();
  const { data: currenciesData } = useCurrencies({ limit: 1000 });
  const { data: countriesData } = useCountries({ limit: 1000 });

  // Mutations
  const createExchangeRateMutation = useCreateExchangeRate();
  const updateExchangeRateMutation = useUpdateExchangeRate();
  const deleteExchangeRateMutation = useDeleteExchangeRate();
  const approveExchangeRateMutation = useApproveExchangeRate();

  const exchangeRates = exchangeRatesData?.data?.exchangeRates || [];
  const pagination = exchangeRatesData?.data?.pagination;
  const stats = statsData?.data;
  const currencies = currenciesData?.data?.currencies || [];
  const countries = countriesData?.data?.countries || [];

  // Filter options
  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: ExchangeRateStatus.PENDING_APPROVAL, label: "Pending Approval" },
    { value: ExchangeRateStatus.APPROVED, label: "Approved" },
    { value: ExchangeRateStatus.ACTIVE, label: "Active" },
    { value: ExchangeRateStatus.INACTIVE, label: "Inactive" },
    { value: ExchangeRateStatus.REJECTED, label: "Rejected" },
  ];

  const operatorStatusOptions = [
    { value: "", label: "All Operator Statuses" },
    {
      value: ExchangeRateOperatorStatus.PENDING_APPROVAL,
      label: "Pending Approval",
    },
    { value: ExchangeRateOperatorStatus.APPROVED, label: "Approved" },
    { value: ExchangeRateOperatorStatus.REJECTED, label: "Rejected" },
  ];

  const currencyOptions = [
    { value: "", label: "All Currencies" },
    ...currencies.map((currency) => ({
      value: currency.id,
      label: `${currency.currency_code} - ${currency.currency_name}`,
    })),
  ];

  const countryOptions = [
    { value: "", label: "All Countries" },
    ...countries.map((country) => ({
      value: country.id,
      label: country.name,
    })),
  ];

  // Handlers
  const handleFilterChange = (
    field: keyof ExchangeRateFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === "page" ? (value as number) : 1, // Reset to page 1 when changing filters
    }));
  };

  const handleCreateExchangeRate = async (
    data: CreateExchangeRateRequest | UpdateExchangeRateRequest
  ) => {
    try {
      const result = await createExchangeRateMutation.mutateAsync(
        data as CreateExchangeRateRequest
      );
      if (result.success) {
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create exchange rate:", error);
    }
  };

  const handleEditExchangeRate = async (data: UpdateExchangeRateRequest) => {
    if (!selectedExchangeRate) return;

    try {
      const result = await updateExchangeRateMutation.mutateAsync({
        id: selectedExchangeRate.id,
        data,
      });
      if (result.success) {
        setShowEditModal(false);
        setSelectedExchangeRate(null);
      }
    } catch (error) {
      console.error("Failed to update exchange rate:", error);
    }
  };

  const handleDeleteExchangeRate = async () => {
    if (!selectedExchangeRate) return;

    try {
      const result = await deleteExchangeRateMutation.mutateAsync(
        selectedExchangeRate.id
      );
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedExchangeRate(null);
      }
    } catch (error) {
      console.error("Failed to delete exchange rate:", error);
    }
  };

  const handleApproveExchangeRate = async () => {
    if (!selectedExchangeRate) return;

    try {
      const result = await approveExchangeRateMutation.mutateAsync({
        id: selectedExchangeRate.id,
        data: {
          status: ExchangeRateStatus.APPROVED,
          operator_status: ExchangeRateOperatorStatus.APPROVED,
        },
      });
      if (result.success) {
        setShowApproveModal(false);
        setSelectedExchangeRate(null);
      }
    } catch (error) {
      console.error("Failed to approve exchange rate:", error);
    }
  };

  const handleRejectExchangeRate = async () => {
    if (!selectedExchangeRate) return;

    try {
      const result = await approveExchangeRateMutation.mutateAsync({
        id: selectedExchangeRate.id,
        data: {
          status: ExchangeRateStatus.REJECTED,
          operator_status: ExchangeRateOperatorStatus.REJECTED,
        },
      });
      if (result.success) {
        setShowRejectModal(false);
        setSelectedExchangeRate(null);
      }
    } catch (error) {
      console.error("Failed to reject exchange rate:", error);
    }
  };

  const openCreateModal = () => setShowCreateModal(true);
  const openViewModal = (exchangeRate: ExchangeRate) => {
    navigate(`/exchange-rates/${exchangeRate.id}`);
  };
  const openEditModal = (exchangeRate: ExchangeRate) => {
    setSelectedExchangeRate(exchangeRate);
    setShowEditModal(true);
  };
  const openDeleteModal = (exchangeRate: ExchangeRate) => {
    setSelectedExchangeRate(exchangeRate);
    setShowDeleteModal(true);
  };
  const openApproveModal = (exchangeRate: ExchangeRate) => {
    setSelectedExchangeRate(exchangeRate);
    setShowApproveModal(true);
  };
  const openRejectModal = (exchangeRate: ExchangeRate) => {
    setSelectedExchangeRate(exchangeRate);
    setShowRejectModal(true);
  };

  // Loading state
  const isAnyMutationLoading =
    createExchangeRateMutation.isPending ||
    updateExchangeRateMutation.isPending ||
    deleteExchangeRateMutation.isPending ||
    approveExchangeRateMutation.isPending;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exchange Rates</h1>
          <p className="text-gray-600">Manage currency exchange rates</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          Create Exchange Rate
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalExchangeRates}
            </div>
            <div className="text-sm text-gray-600">Total Exchange Rates</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-green-600">
              {stats.activeExchangeRates}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-red-600">
              {stats.inactiveExchangeRates}
            </div>
            <div className="text-sm text-gray-600">Inactive</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-orange-600">
              {stats.pendingApprovalExchangeRates}
            </div>
            <div className="text-sm text-gray-600">Pending Approval</div>
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
              placeholder="Search exchange rates..."
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
            value={filters.operator_status || ""}
            onChange={(value) => handleFilterChange("operator_status", value)}
            options={operatorStatusOptions}
            placeholder="Filter by operator status"
          />
          <SearchableSelect
            value={filters.from_currency_id || ""}
            onChange={(value) => handleFilterChange("from_currency_id", value)}
            options={currencyOptions}
            placeholder="Filter by from currency"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SearchableSelect
            value={filters.to_currency_id || ""}
            onChange={(value) => handleFilterChange("to_currency_id", value)}
            options={currencyOptions}
            placeholder="Filter by to currency"
          />
          <SearchableSelect
            value={filters.origin_country_id || ""}
            onChange={(value) => handleFilterChange("origin_country_id", value)}
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ExchangeRatesTable
          data={exchangeRates}
          isLoading={isLoading}
          onView={openViewModal}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          onApprove={openApproveModal}
          onReject={openRejectModal}
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
        title="Create Exchange Rate"
        size="xl"
      >
        <ExchangeRateForm
          onSubmit={handleCreateExchangeRate}
          isLoading={isAnyMutationLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedExchangeRate(null);
        }}
        title="Edit Exchange Rate"
        size="xl"
      >
        {selectedExchangeRate && (
          <ExchangeRateForm
            initialData={selectedExchangeRate}
            onSubmit={handleEditExchangeRate}
            isLoading={isAnyMutationLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedExchangeRate(null);
        }}
        onConfirm={handleDeleteExchangeRate}
        title="Delete Exchange Rate"
        message={`Are you sure you want to delete this exchange rate? This action cannot be undone.`}
        isLoading={isAnyMutationLoading}
      />

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedExchangeRate(null);
        }}
        onConfirm={handleApproveExchangeRate}
        title="Approve Exchange Rate"
        message={`Are you sure you want to approve this exchange rate? This will activate the rate and mark any existing rates for the same currency pair as inactive.`}
        isLoading={isAnyMutationLoading}
        confirmText="Approve"
      />

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedExchangeRate(null);
        }}
        onConfirm={handleRejectExchangeRate}
        title="Reject Exchange Rate"
        message={`Are you sure you want to reject this exchange rate? This action cannot be undone.`}
        isLoading={isAnyMutationLoading}
        confirmText="Reject"
      />
    </>
  );
};

export default ExchangeRates;
