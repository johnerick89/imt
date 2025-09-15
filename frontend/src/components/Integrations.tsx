import React, { useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { Input } from "../components/ui/Input";
import { SearchableSelect } from "../components/ui/SearchableSelect";
import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import IntegrationsTable from "../components/IntegrationsTable";
import IntegrationForm from "../components/IntegrationForm";
import {
  useIntegrations,
  useIntegrationStats,
  useCreateIntegration,
  useUpdateIntegration,
  useDeleteIntegration,
  useSession,
  useOrganisations,
} from "../hooks";
import { IntegrationStatus } from "../types/IntegrationsTypes";
import type {
  Integration,
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  IntegrationFilters,
  IntegrationStatsFilters,
} from "../types/IntegrationsTypes";

const Integrations: React.FC = () => {
  const { user: currentUser } = useSession();

  // Filter state
  const [filters, setFilters] = useState<IntegrationFilters>({
    page: 1,
    limit: 10,
    search: "",
    type: undefined,
    status: undefined,
    organisation_id: "",
    origin_organisation_id: currentUser?.organisation_id || "",
  });

  const statsFilters: IntegrationStatsFilters = {
    origin_organisation_id: currentUser?.organisation_id || "",
  };

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] =
    useState<Integration | null>(null);

  // Data fetching
  const { data: integrationsData, isLoading } = useIntegrations(filters);
  const { data: statsData } = useIntegrationStats(statsFilters);
  const { data: organisationsData } = useOrganisations({ limit: 100 });

  // Mutations
  const createIntegrationMutation = useCreateIntegration();
  const updateIntegrationMutation = useUpdateIntegration();
  const deleteIntegrationMutation = useDeleteIntegration();

  const integrations = integrationsData?.data?.integrations || [];
  const pagination = integrationsData?.data?.pagination;
  const stats = statsData?.data;
  const organisations = organisationsData?.data?.organisations || [];

  // Filter options
  const typeOptions = [
    { value: "", label: "All Types" },
    { value: "API", label: "API" },
    { value: "WEBHOOK", label: "Webhook" },
    { value: "EMAIL", label: "Email" },
    { value: "SMS", label: "SMS" },
  ];

  const statusOptions = [
    { value: "", label: "All Statuses" },
    { value: IntegrationStatus.ACTIVE, label: "Active" },
    { value: IntegrationStatus.INACTIVE, label: "Inactive" },
    { value: IntegrationStatus.PENDING, label: "Pending" },
    { value: IntegrationStatus.BLOCKED, label: "Blocked" },
  ];

  const organisationOptions = [
    { value: "", label: "All Organisations" },
    ...organisations
      .filter((org) => org.id !== currentUser?.organisation_id)
      .map((organisation) => ({
        value: organisation.id,
        label: organisation.name,
      })),
  ];

  // Handlers
  const handleFilterChange = (
    field: keyof IntegrationFilters,
    value: string | number
  ) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === "page" ? (value as number) : 1, // Reset to page 1 when changing filters
    }));
  };

  const handleCreateIntegration = async (data: CreateIntegrationRequest) => {
    try {
      const result = await createIntegrationMutation.mutateAsync(data);
      if (result.success) {
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error("Failed to create integration:", error);
    }
  };

  const handleFormSubmit = async (
    data: CreateIntegrationRequest | UpdateIntegrationRequest
  ) => {
    if ("id" in data) {
      // This is an update request
      await handleEditIntegration(data as UpdateIntegrationRequest);
    } else {
      // This is a create request
      await handleCreateIntegration(data as CreateIntegrationRequest);
    }
  };

  const handleEditIntegration = async (data: UpdateIntegrationRequest) => {
    if (!selectedIntegration) return;

    try {
      const result = await updateIntegrationMutation.mutateAsync({
        id: selectedIntegration.id,
        integrationData: data,
      });
      if (result.success) {
        setShowEditModal(false);
        setSelectedIntegration(null);
      }
    } catch (error) {
      console.error("Failed to update integration:", error);
    }
  };

  const handleDeleteIntegration = async () => {
    if (!selectedIntegration) return;

    try {
      const result = await deleteIntegrationMutation.mutateAsync(
        selectedIntegration.id
      );
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedIntegration(null);
      }
    } catch (error) {
      console.error("Failed to delete integration:", error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (!integration) return;

    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await updateIntegrationMutation.mutateAsync({
        id,
        integrationData: { status: newStatus as IntegrationStatus },
      });
    } catch (error) {
      console.error("Failed to toggle integration status:", error);
    }
  };

  const openCreateModal = () => setShowCreateModal(true);
  const openEditModal = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowEditModal(true);
  };
  const openDeleteModal = (integration: Integration) => {
    setSelectedIntegration(integration);
    setShowDeleteModal(true);
  };

  const handleDelete = (id: string) => {
    const integration = integrations.find((i) => i.id === id);
    if (integration) {
      openDeleteModal(integration);
    }
  };

  // Loading state
  const isAnyMutationLoading =
    createIntegrationMutation.isPending ||
    updateIntegrationMutation.isPending ||
    deleteIntegrationMutation.isPending;

  return (
    <>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600">Manage partner/agency integrations</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
        >
          <FiPlus className="h-4 w-4" />
          Create Integration
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {stats.total}
            </div>
            <div className="text-sm text-gray-600">Total Integrations</div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search integrations..."
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
          <SearchableSelect
            value={filters.organisation_id || ""}
            onChange={(value) => handleFilterChange("organisation_id", value)}
            options={organisationOptions}
            placeholder="Filter by organisation"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <IntegrationsTable
          data={integrations}
          isLoading={isLoading}
          onEdit={openEditModal}
          onDelete={handleDelete}
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
        title="Create Integration"
        size="lg"
      >
        <IntegrationForm
          onSubmit={handleFormSubmit}
          isLoading={isAnyMutationLoading}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedIntegration(null);
        }}
        title="Edit Integration"
        size="lg"
      >
        {selectedIntegration && (
          <IntegrationForm
            initialData={selectedIntegration}
            onSubmit={handleEditIntegration}
            isLoading={isAnyMutationLoading}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedIntegration(null);
        }}
        onConfirm={handleDeleteIntegration}
        title="Delete Integration"
        message={`Are you sure you want to delete the integration "${selectedIntegration?.name}"? This action cannot be undone.`}
        isLoading={isAnyMutationLoading}
      />
    </>
  );
};

export default Integrations;
