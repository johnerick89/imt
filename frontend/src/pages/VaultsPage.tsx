import React, { useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  useVaults,
  useVaultStats,
  useCreateVault,
  useUpdateVault,
  useDeleteVault,
} from "../hooks/useVaults";
import VaultsTable from "../components/VaultsTable";
import VaultForm from "../components/VaultForm";
import { Modal } from "../components/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import type {
  Vault,
  CreateVaultRequest,
  UpdateVaultRequest,
} from "../types/VaultsTypes";
import { useSession } from "../hooks";

const VaultsPage: React.FC = () => {
  const { user: currentUser } = useSession();
  const organisationId = currentUser?.organisation_id;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [vaultToDelete, setVaultToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // API hooks
  const { data: vaultsData, isLoading } = useVaults({
    page,
    limit,
    search: searchTerm,
    organisation_id: organisationId,
  });

  const { data: statsData } = useVaultStats({
    organisation_id: organisationId,
  });

  const createVaultMutation = useCreateVault();
  const updateVaultMutation = useUpdateVault();
  const deleteVaultMutation = useDeleteVault();

  // Handlers
  const handleCreateVault = (data: CreateVaultRequest) => {
    createVaultMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateModal(false);
      },
    });
  };

  const handleEditVault = (data: CreateVaultRequest | UpdateVaultRequest) => {
    if (!selectedVault) return;
    updateVaultMutation.mutate(
      { id: selectedVault.id, data: data as UpdateVaultRequest },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setSelectedVault(null);
        },
      }
    );
  };

  const handleDeleteVault = () => {
    if (!vaultToDelete) return;
    deleteVaultMutation.mutate(vaultToDelete.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setVaultToDelete(null);
      },
    });
  };

  const handleViewVault = (vault: Vault) => {
    navigate(`/vaults/${vault.id}`);
  };

  const handleEditClick = (vault: Vault) => {
    setSelectedVault(vault);
    setShowEditModal(true);
  };

  const handleDeleteClick = (vault: Vault) => {
    setVaultToDelete({ id: vault.id, name: vault.name });
    setShowDeleteModal(true);
  };

  const vaults = vaultsData?.data?.vaults || [];
  const pagination = vaultsData?.data?.pagination;
  const stats = statsData?.data;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vaults</h1>
          <p className="text-gray-600 mt-1">Manage system vaults and storage</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Create Vault
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <div className="w-6 h-6 bg-blue-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Vaults
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalVaults}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <div className="w-6 h-6 bg-green-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Recent Vaults
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.recentVaults}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <div className="w-6 h-6 bg-purple-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Organisations
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(stats.vaultsByOrganisation).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <div className="w-6 h-6 bg-yellow-600 rounded"></div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Currencies</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.keys(stats.vaultsByCurrency).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search vaults..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Vaults Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <VaultsTable
          vaults={vaults}
          loading={isLoading}
          onView={handleViewVault}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-700">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Vault Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Vault"
      >
        <VaultForm
          onSubmit={(data) => handleCreateVault(data as CreateVaultRequest)}
          isLoading={createVaultMutation.isPending}
        />
      </Modal>

      {/* Edit Vault Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedVault(null);
        }}
        title="Edit Vault"
      >
        {selectedVault && (
          <VaultForm
            initialData={selectedVault}
            onSubmit={handleEditVault}
            isLoading={updateVaultMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setVaultToDelete(null);
        }}
        onConfirm={handleDeleteVault}
        title="Delete Vault"
        message={`Are you sure you want to delete the vault "${vaultToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteVaultMutation.isPending}
      />
    </div>
  );
};

export default VaultsPage;
