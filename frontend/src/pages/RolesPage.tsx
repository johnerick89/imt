import React, { useState } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import {
  useRoles,
  useRoleStats,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
} from "../hooks/useRoles";
import RolesTable from "../components/RolesTable";
import RoleForm from "../components/RoleForm";
import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import type {
  Role,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "../types/RolesTypes";

const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // API hooks
  const { data: rolesData, isLoading } = useRoles({
    page,
    limit,
    search: searchTerm,
  });

  const { data: statsData } = useRoleStats();

  const createRoleMutation = useCreateRole();
  const updateRoleMutation = useUpdateRole();
  const deleteRoleMutation = useDeleteRole();

  // Handlers
  const handleCreateRole = (data: CreateRoleRequest) => {
    createRoleMutation.mutate(data, {
      onSuccess: () => {
        setShowCreateModal(false);
      },
    });
  };

  const handleEditRole = (data: CreateRoleRequest | UpdateRoleRequest) => {
    if (!selectedRole) return;
    updateRoleMutation.mutate(
      { id: selectedRole.id, data: data as UpdateRoleRequest },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setSelectedRole(null);
        },
      }
    );
  };

  const handleDeleteRole = () => {
    if (!roleToDelete) return;
    deleteRoleMutation.mutate(roleToDelete.id, {
      onSuccess: () => {
        setShowDeleteModal(false);
        setRoleToDelete(null);
      },
    });
  };

  const handleViewRole = (role: Role) => {
    navigate(`/roles/${role.id}`);
  };

  const handleEditClick = (role: Role) => {
    setSelectedRole(role);
    setShowEditModal(true);
  };

  const handleDeleteClick = (role: Role) => {
    setRoleToDelete({ id: role.id, name: role.name });
    setShowDeleteModal(true);
  };

  const roles = rolesData?.data?.roles || [];
  const pagination = rolesData?.data?.pagination;
  const stats = statsData?.data;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
          <p className="text-gray-600 mt-1">
            Manage system roles and permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          <FiPlus className="mr-2 h-4 w-4" />
          Create Role
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
                <p className="text-sm font-medium text-gray-600">Total Roles</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRoles}
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
                  With Permissions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rolesWithPermissions}
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
                <p className="text-sm font-medium text-gray-600">
                  Without Permissions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.rolesWithoutPermissions}
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
                  Total Permissions
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalPermissions}
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
              placeholder="Search roles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Roles Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <RolesTable
          roles={roles}
          loading={isLoading}
          onView={handleViewRole}
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

      {/* Create Role Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Role"
      >
        <RoleForm
          onSubmit={(data) => handleCreateRole(data as CreateRoleRequest)}
          isLoading={createRoleMutation.isPending}
        />
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRole(null);
        }}
        title="Edit Role"
      >
        {selectedRole && (
          <RoleForm
            initialData={selectedRole}
            onSubmit={handleEditRole}
            isLoading={updateRoleMutation.isPending}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setRoleToDelete(null);
        }}
        onConfirm={handleDeleteRole}
        title="Delete Role"
        message={`Are you sure you want to delete the role "${roleToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteRoleMutation.isPending}
      />
    </div>
  );
};

export default RolesPage;
