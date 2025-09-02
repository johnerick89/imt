import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ColumnDef } from "@tanstack/react-table";
import {
  useUsers,
  useUserStats,
  useToggleUserStatus,
  useDeleteUser,
} from "../hooks";
import { DataTable } from "../components/DataTable";
import { StatusBadge } from "../components/StatusBadge";
import { ActionCell } from "../components/ActionCell";
import { ConfirmModal } from "../components/ConfirmModal";
import { Modal } from "../components/Modal";
import { Input } from "../components/Input";
import { Select } from "../components/Select";
import UserForm from "../components/UserForm";
import type { User, UserFilters, UserStatus } from "../types/UsersTypes";

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: "",
    status: undefined,
    organisation_id: undefined,
    page: 1,
    limit: 10,
  });

  // Delete confirmation modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: "",
  });

  // Form modal state
  const [formModal, setFormModal] = useState<{
    isOpen: boolean;
    mode: "create" | "edit";
    userId?: string;
  }>({
    isOpen: false,
    mode: "create",
  });

  // React Query hooks
  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useUsers(filters);
  const { data: statsData, isLoading: statsLoading } = useUserStats();
  const toggleUserStatusMutation = useToggleUserStatus();
  const deleteUserMutation = useDeleteUser();

  // Extract data from queries
  const users = usersData?.data?.users || [];
  const stats = statsData?.data || null;
  const loading = usersLoading || statsLoading;

  // Handle error state
  if (usersError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Users
          </h2>
          <p className="text-red-600">
            {usersError instanceof Error
              ? usersError.message
              : "Failed to load users"}
          </p>
        </div>
      </div>
    );
  }

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await toggleUserStatusMutation.mutateAsync({
        userId,
        status: newStatus as "ACTIVE" | "INACTIVE" | "PENDING" | "BLOCKED",
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      setDeleteModal({ isOpen: false, userId: null, userName: "" });
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const openDeleteModal = (userId: string, userName: string) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: "" });
  };

  const openCreateModal = () => {
    setFormModal({ isOpen: true, mode: "create" });
  };

  const openEditModal = (userId: string) => {
    setFormModal({ isOpen: true, mode: "edit", userId });
  };

  const closeFormModal = () => {
    setFormModal({ isOpen: false, mode: "create" });
  };

  const handleFormSuccess = () => {
    closeFormModal();
    // The mutation will automatically invalidate and refetch the data
  };

  // Define columns for TanStack Table
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div>
            <div className="text-sm font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => <StatusBadge status={row.original.role} type="role" />,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} type="status" />
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.phone || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "organisation",
      header: "Organisation",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.organisation?.name || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.address || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "last_login",
      header: "Last Login",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.last_login
            ? new Date(row.original.last_login).toLocaleDateString()
            : "Never"}
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
          onView={() => navigate(`/users/${row.original.id}`)}
          onEdit={() => openEditModal(row.original.id)}
          onToggleStatus={() =>
            handleStatusToggle(row.original.id, row.original.status)
          }
          onDelete={() =>
            openDeleteModal(
              row.original.id,
              `${row.original.first_name} ${row.original.last_name}`
            )
          }
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
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600 mt-1">
              Manage user accounts and permissions
            </p>
          </div>
          <button onClick={openCreateModal} className="btn-primary">
            Add User
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-lg">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalUsers}
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
                  {stats.activeUsers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-lg">👑</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Administrators
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.administrators}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <span className="text-indigo-600 text-lg">🏢</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Branches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.branches}
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
              placeholder="Search users..."
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
              Role
            </label>
            <Select
              value={filters.role || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  role: e.target.value || undefined,
                  page: 1,
                }))
              }
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
              <option value="MANAGER">Manager</option>
              <option value="SYSTEM">System</option>
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
                  status: (e.target.value as UserStatus) || undefined,
                  page: 1,
                }))
              }
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="PENDING">Pending</option>
              <option value="BLOCKED">Blocked</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Organisation
            </label>
            <Select
              value={filters.organisation_id || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  organisation_id: e.target.value || undefined,
                  page: 1,
                }))
              }
            >
              <option value="">All Organisations</option>
              {/* TODO: Add organisation options */}
            </Select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search users..."
        loading={loading}
        emptyMessage="No users found"
        pageSize={filters.limit || 10}
        showPagination={false} // We'll handle pagination through the API
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() =>
          deleteModal.userId && handleDeleteUser(deleteModal.userId)
        }
        title="Delete User"
        message={`Are you sure you want to delete "${deleteModal.userName}"? This action cannot be undone.`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteUserMutation.isPending}
      />

      {/* User Form Modal */}
      <Modal
        isOpen={formModal.isOpen}
        onClose={closeFormModal}
        title={formModal.mode === "create" ? "Create User" : "Edit User"}
        size="xl"
      >
        <UserForm
          mode={formModal.mode}
          userId={formModal.userId}
          onSuccess={handleFormSuccess}
          onCancel={closeFormModal}
        />
      </Modal>
    </div>
  );
};

export default UsersPage;
