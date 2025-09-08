import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import {
  useOrganisations,
  useOrganisationStats,
  useToggleOrganisationStatus,
  useDeleteOrganisation,
} from "../hooks";
import { DataTable } from "../components/ui/DataTable";
import { StatusBadge } from "../components/ui/StatusBadge";
import { ActionCell } from "../components/ui/ActionCell";
import { ConfirmModal } from "../components/ConfirmModal";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import OrganisationForm from "../components/OrganisationForm";
import type {
  Organisation,
  OrganisationFilters,
  OrganisationType,
  OrganisationStatus,
  IntegrationMode,
} from "../types/OrganisationsTypes";
import { toHumanFriendly } from "../utils/textUtils";
import type { Option } from "../types/Common";
import {
  OrganisationType as OrganisationTypeEnum,
  IntegrationMode as IntegrationModeEnum,
  OrganisationStatus as OrganisationStatusEnum,
} from "../types/OrganisationsTypes";

const OrganisationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<OrganisationFilters>({
    search: "",
    type: undefined,
    status: undefined,
    integration_mode: undefined,
    country_id: undefined,
    base_currency_id: undefined,
    page: 1,
    limit: 10,
  });

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    organisationId: string | null;
    organisationName: string;
  }>({
    isOpen: false,
    organisationId: null,
    organisationName: "",
  });

  // Form modal state
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    organisationId?: string;
  }>({
    isOpen: false,
    mode: "create",
  });

  // React Query hooks
  const {
    data: organisationsData,
    isLoading: organisationsLoading,
    error: organisationsError,
  } = useOrganisations(filters);
  const { data: statsData, isLoading: statsLoading } = useOrganisationStats();
  const toggleOrganisationStatusMutation = useToggleOrganisationStatus();
  const deleteOrganisationMutation = useDeleteOrganisation();

  // Extract data from queries
  const organisations = organisationsData?.data?.organisations || [];
  const stats = statsData?.data || null;
  const loading = organisationsLoading || statsLoading;

  // Handle error state
  if (organisationsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Organisations
          </h2>
          <p className="text-red-600">
            {organisationsError instanceof Error
              ? organisationsError.message
              : "Failed to load organisations"}
          </p>
        </div>
      </div>
    );
  }

  const handleStatusToggle = async (
    organisationId: string,
    currentStatus: OrganisationStatus
  ) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await toggleOrganisationStatusMutation.mutateAsync({
        id: organisationId,
        status: newStatus,
      });
    } catch (error) {
      console.error("Error toggling organisation status:", error);
    }
  };

  const handleDeleteOrganisation = async (organisationId: string) => {
    try {
      await deleteOrganisationMutation.mutateAsync(organisationId);
      setDeleteModal({
        isOpen: false,
        organisationId: null,
        organisationName: "",
      });
    } catch (error) {
      console.error("Error deleting organisation:", error);
    }
  };

  const openDeleteModal = (
    organisationId: string,
    organisationName: string
  ) => {
    setDeleteModal({
      isOpen: true,
      organisationId,
      organisationName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      organisationId: null,
      organisationName: "",
    });
  };

  const openCreateModal = () => {
    setFormModal({ isOpen: true, mode: "create" });
  };

  const openEditModal = (organisationId: string) => {
    setFormModal({ isOpen: true, mode: "edit", organisationId });
  };

  const closeFormModal = () => {
    setFormModal({ isOpen: false, mode: "create" });
  };

  const handleFormSuccess = () => {
    closeFormModal();
    // The mutation will automatically invalidate and refetch the data
  };

  const organisationTypeOptions: Option[] = Object.values(
    OrganisationTypeEnum
  ).map((type) => ({ value: type, label: toHumanFriendly(type) }));

  const integrationModeOptions: Option[] = Object.values(
    IntegrationModeEnum
  ).map((mode) => ({ value: mode, label: toHumanFriendly(mode) }));

  const organisationStatusOptions: Option[] = Object.values(
    OrganisationStatusEnum
  ).map((status) => ({ value: status, label: toHumanFriendly(status) }));

  // Define columns for TanStack Table
  const columns: ColumnDef<Organisation>[] = [
    {
      accessorKey: "name",
      header: "Organisation",
      cell: ({ row }) => {
        const org = row.original;
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">{org.name}</div>
            <div className="text-sm text-gray-500">
              {org.description || "No description"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <StatusBadge status={row.original.type} type="organisation-type" />
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status as OrganisationStatus}
          type="status"
        />
      ),
    },
    {
      accessorKey: "integration_mode",
      header: "Integration",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.integration_mode as IntegrationMode}
        </span>
      ),
    },
    {
      accessorKey: "contact_person",
      header: "Contact Person",
      cell: ({ row }) => (
        <div>
          <div className="text-sm text-gray-900">
            {row.original.contact_person || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.contact_email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "contact_phone",
      header: "Contact",
      cell: ({ row }) => (
        <div>
          <div className="text-sm text-gray-900">
            {row.original.contact_phone || "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.contact_city && row.original.contact_state
              ? `${row.original.contact_city}, ${row.original.contact_state}`
              : "N/A"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "base_currency",
      header: "Currency",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.base_currency?.currency_code || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.country?.name || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {new Date(row.original.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ActionCell
          onView={() => navigate(`/organisations/${row.original.id}`)}
          onEdit={() => openEditModal(row.original.id)}
          onToggleStatus={() =>
            handleStatusToggle(row.original.id, row.original.status)
          }
          onDelete={() => openDeleteModal(row.original.id, row.original.name)}
          status={row.original.status}
        />
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Organisations</h1>
            <p className="text-gray-600 mt-1">
              Manage partner organisations, agencies, and customers
            </p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            Add Organisation
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-lg">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-lg">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.active}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-lg">🤝</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Partners</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.partners}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-lg">🏪</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Agencies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.agencies}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <Input
              type="text"
              placeholder="Search organisations..."
              value={filters.search || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  search: e.target.value,
                  page: 1,
                }))
              }
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <Select
              value={filters.type || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  type: (e.target.value as OrganisationType) || undefined,
                  page: 1,
                }))
              }
            >
              <option value="">All Organisations</option>
              {organisationTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={filters.status || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  status: (e.target.value as OrganisationStatus) || undefined,
                  page: 1,
                }))
              }
            >
              <option value="">All Statuses</option>
              {organisationStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Integration Mode
            </label>
            <select
              value={filters.integration_mode || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  integration_mode:
                    (e.target.value as IntegrationMode) || undefined,
                  page: 1,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Modes</option>
              {integrationModeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              <option value="EXTERNAL">External</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organisations Table */}
      <DataTable
        columns={columns}
        data={organisations}
        searchKey="name"
        searchPlaceholder="Search organisations..."
        loading={loading}
        emptyMessage="No organisations found"
        pageSize={filters.limit || 10}
        showPagination={false} // We'll handle pagination through the API
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() =>
          deleteModal.organisationId &&
          handleDeleteOrganisation(deleteModal.organisationId)
        }
        title="Delete Organisation"
        message={`Are you sure you want to delete "${deleteModal.organisationName}"? This action cannot be undone.`}
        confirmText="Delete Organisation"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteOrganisationMutation.isPending}
      />

      {/* Organisation Form Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={closeFormModal}
        title={
          formModal.mode === "create"
            ? "Create Organisation"
            : "Edit Organisation"
        }
        size="xl"
      >
        <OrganisationForm
          mode={formModal.mode}
          organisationId={formModal.organisationId}
          onSuccess={handleFormSuccess}
          onCancel={closeFormModal}
        />
      </Modal>
    </div>
  );
};

export default OrganisationsPage;
