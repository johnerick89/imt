import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useUser,
  useCurrentUser,
  useToggleUserStatus,
  useDeleteUser,
  useUserAuditHistory,
  useUpdatePassword,
  useResetPassword,
} from "../hooks";
import { StatusBadge } from "../components/ui/StatusBadge";
import { DataTable } from "../components/ui/DataTable";
import { ConfirmModal } from "../components/ConfirmModal";
import { Modal } from "../components/ui/Modal";
import { Button } from "../components/ui/Button";
import UserForm from "../components/UserForm";
import UpdatePasswordModal from "../components/UpdatePasswordModal";
import ResetPasswordModal from "../components/ResetPasswordModal";
import { usePermissions } from "../hooks/usePermissions";
import { FiEdit, FiTrash2, FiLock, FiKey } from "react-icons/fi";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserActivity } from "../types/UserActivityTypes";
import type {
  UpdatePasswordRequest,
  ResetPasswordRequest,
} from "../types/UsersTypes";
import { useSession } from "../hooks";

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isInitialized } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  // Permission checks
  const { canEditUsers, canDeleteUsers } = usePermissions();

  // Determine if this is "My Profile" or "View User"
  const isMyProfile = location.pathname === "/my-account";

  // React Query hooks - only call useCurrentUser when it's "My Profile"
  const {
    data: currentUserData,
    isLoading: currentUserLoading,
    error: currentUserError,
  } = useCurrentUser();

  // Only call useUser when we have a valid userId and it's not "My Profile"
  const userId = id || currentUser?.id;
  const {
    data: viewUserData,
    isLoading: viewUserLoading,
    error: viewUserError,
  } = useUser(userId || "");

  // Debug logging to help identify the issue
  console.log("UserProfilePage Debug:", {
    isMyProfile,
    id,
    currentUserId: currentUser?.id,
    userId,
    currentUserLoading,
    viewUserLoading,
    currentUserError,
    viewUserError,
    sessionUser: currentUser,
  });

  // Handle authentication errors gracefully
  if (currentUserError && isMyProfile) {
    console.error("Failed to fetch current user profile:", currentUserError);
    // Show user-friendly error message instead of logging out
  }

  if (viewUserError && !isMyProfile) {
    console.error("Failed to fetch user profile:", viewUserError);
    // Show user-friendly error message instead of logging out
  }

  // Check if we have authentication errors that should be handled
  const hasAuthError =
    (currentUserError && isMyProfile) || (viewUserError && !isMyProfile);
  const authErrorMessage = currentUserError?.message || viewUserError?.message;

  // Select the appropriate data based on whether it's my profile or view user
  const userData = isMyProfile ? currentUserData : viewUserData;
  const isLoading = isMyProfile ? currentUserLoading : viewUserLoading;
  const userError = isMyProfile ? currentUserError : viewUserError;
  const toggleUserStatusMutation = useToggleUserStatus();
  const deleteUserMutation = useDeleteUser();
  const updatePasswordMutation = useUpdatePassword();
  const resetPasswordMutation = useResetPassword();

  // User activities
  const activityFilters = {
    page: 1,
    limit: 10,
  };

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

  // Edit modal state
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    userId: string | null;
  }>({
    isOpen: false,
    userId: null,
  });

  // Status toggle modal state
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    currentStatus: string;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    currentStatus: "",
    userName: "",
  });

  // Update password modal state (for current user)
  const [updatePasswordModal, setUpdatePasswordModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: "",
  });

  // Reset password modal state (for other users)
  const [resetPasswordModal, setResetPasswordModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: "",
  });

  const { data: activitiesData, isLoading: activitiesLoading } =
    useUserAuditHistory(userId || "", activityFilters);

  // Don't render anything until session is initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Extract data from queries
  const user = userData?.data || null;
  const activities = activitiesData?.data?.auditLogs || [];
  const error = userError
    ? userError instanceof Error
      ? userError.message
      : "Failed to fetch user details"
    : null;

  const handleStatusToggle = async () => {
    if (!statusModal.userId) return;

    try {
      const newStatus =
        statusModal.currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await toggleUserStatusMutation.mutateAsync({
        userId: statusModal.userId,
        status: newStatus as "ACTIVE" | "INACTIVE",
      });
      setStatusModal({
        isOpen: false,
        userId: null,
        currentStatus: "",
        userName: "",
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      setDeleteModal({ isOpen: false, userId: null, userName: "" });
      navigate("/users");
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const openDeleteModal = () => {
    if (!user) return;
    setDeleteModal({
      isOpen: true,
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, userId: null, userName: "" });
  };

  const openStatusModal = () => {
    if (!user) return;
    setStatusModal({
      isOpen: true,
      userId: user.id,
      currentStatus: user.status,
      userName: `${user.first_name} ${user.last_name}`,
    });
  };

  const closeStatusModal = () => {
    setStatusModal({
      isOpen: false,
      userId: null,
      currentStatus: "",
      userName: "",
    });
  };

  // Edit handlers
  const openEditModal = () => {
    if (!user) return;
    setEditModal({ isOpen: true, userId: user.id });
  };

  const closeEditModal = () => {
    setEditModal({ isOpen: false, userId: null });
  };

  const handleEditSuccess = () => {
    closeEditModal();
    // The mutation will automatically invalidate and refetch the data
  };

  // Password handlers
  const handleUpdatePassword = async (data: UpdatePasswordRequest) => {
    if (!user) return;
    try {
      await updatePasswordMutation.mutateAsync({
        userId: user.id,
        userData: data,
      });
      setUpdatePasswordModal({ isOpen: false, userId: null, userName: "" });
    } catch (error) {
      console.error("Error updating password:", error);
    }
  };

  const handleResetPassword = async (data: ResetPasswordRequest) => {
    if (!resetPasswordModal.userId) return;
    try {
      await resetPasswordMutation.mutateAsync({
        userId: resetPasswordModal.userId,
        userData: data,
      });
      setResetPasswordModal({ isOpen: false, userId: null, userName: "" });
    } catch (error) {
      console.error("Error resetting password:", error);
    }
  };

  const openUpdatePasswordModal = () => {
    if (!user) return;
    setUpdatePasswordModal({
      isOpen: true,
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
    });
  };

  const openResetPasswordModal = () => {
    if (!user) return;
    setResetPasswordModal({
      isOpen: true,
      userId: user.id,
      userName: `${user.first_name} ${user.last_name}`,
    });
  };

  const closeUpdatePasswordModal = () => {
    setUpdatePasswordModal({ isOpen: false, userId: null, userName: "" });
  };

  const closeResetPasswordModal = () => {
    setResetPasswordModal({ isOpen: false, userId: null, userName: "" });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  // Define columns for activities table
  const activityColumns: ColumnDef<UserActivity>[] = [
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.action}
        </span>
      ),
    },
    {
      accessorKey: "entity_type",
      header: "Entity Type",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.entity_type}
        </span>
      ),
    },
    {
      accessorKey: "entity_id",
      header: "Entity ID",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 font-mono">
          {row.original.entity_id.substring(0, 8)}...
        </span>
      ),
    },
    {
      accessorKey: "ip_address",
      header: "IP Address",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.ip_address || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date & Time",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {formatDate(row.original.created_at)}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">
              {hasAuthError ? authErrorMessage : error || "User not found"}
            </p>
            {hasAuthError && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  There was an issue with your authentication. Please try
                  refreshing the page or contact support if the problem
                  persists.
                </p>
              </div>
            )}
            <button
              onClick={() => navigate(isMyProfile ? "/dashboard" : "/users")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isMyProfile ? "Back to Dashboard" : "Back to Users"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(isMyProfile ? "/dashboard" : "/users")}
              className="mr-4 p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isMyProfile ? "My Profile" : "User Profile"}
              </h1>
              <p className="text-gray-600 mt-1">
                {isMyProfile
                  ? "View and manage your profile"
                  : "View and manage user details"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                {user.avatar ? (
                  <img
                    className="h-20 w-20 rounded-full object-cover"
                    src={user.avatar}
                    alt="Avatar"
                  />
                ) : (
                  <span className="text-white text-2xl font-bold">
                    {getInitials(user.first_name || "", user.last_name || "")}
                  </span>
                )}
              </div>
            </div>
            <div className="ml-6 flex-1">
              <h2 className="text-2xl font-bold text-white">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-blue-100">{user.email}</p>
              <div className="flex items-center mt-2 space-x-4">
                <StatusBadge status={user.role || ""} type="role" />
                <StatusBadge status={user.status || ""} type="status" />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-start space-x-3">
              {/* Edit Button - Always available if user has permission */}
              {canEditUsers() && (
                <Button
                  onClick={openEditModal}
                  variant="outline"
                  className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
                >
                  <FiEdit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}

              {/* Change Password Button - Only for current user */}
              {(isMyProfile || user.id === currentUser?.id) && (
                <Button
                  onClick={openUpdatePasswordModal}
                  variant="outline"
                  className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
                >
                  <FiKey className="h-4 w-4 mr-2" />
                  Change Password
                </Button>
              )}

              {/* Status Toggle Button - Only if not current user and has permission */}
              {!isMyProfile &&
                user.id !== currentUser?.id &&
                canEditUsers() && (
                  <Button
                    onClick={openStatusModal}
                    variant="outline"
                    className="bg-white bg-opacity-20 border-white border-opacity-30 text-white hover:bg-opacity-30"
                  >
                    <FiLock className="h-4 w-4 mr-2" />
                    {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
                  </Button>
                )}

              {/* Delete Button - Only if not current user and has permission */}
              {!isMyProfile &&
                user.id !== currentUser?.id &&
                canDeleteUsers() && (
                  <Button
                    onClick={openDeleteModal}
                    variant="outline"
                    className="bg-red-500 bg-opacity-80 border-red-400 text-white hover:bg-red-600"
                  >
                    <FiTrash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Personal Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Full Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.first_name} {user.last_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Email Address
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{user.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Phone Number
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.phone || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.address || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Account Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Role
                  </label>
                  <StatusBadge
                    status={user.user_role?.name || ""}
                    type="role"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <StatusBadge status={user.status || ""} type="status" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Organisation
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.organisation?.name || "No organisation assigned"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Information */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Activity Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Last Login
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.last_login
                    ? formatDate(user.last_login || "")
                    : "Never logged in"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Account Created
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(user.created_at || "")}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">
                  Last Updated
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(user.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              {/* Reset Password - Only if not current user and has permission */}
              {!isMyProfile &&
                user.id !== currentUser?.id &&
                canEditUsers() && (
                  <button
                    onClick={openResetPasswordModal}
                    className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center"
                  >
                    <FiKey className="h-4 w-4 mr-2" />
                    Reset Password
                  </button>
                )}

              {/* <button className="px-4 py-2 text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 flex items-center">
                <span className="mr-2">📧</span>
                Send Welcome Email
              </button> */}
              {/* <button className="px-4 py-2 text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 flex items-center">
                <span className="mr-2">📊</span>
                View Activity Log
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* User Activities Section */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Activity Log
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Track all user activities and system interactions
            </p>
          </div>
          <div className="p-6">
            <DataTable
              columns={activityColumns}
              data={activities}
              loading={activitiesLoading}
              emptyMessage="No activity logs found"
              pageSize={activityFilters.limit || 10}
              showPagination={false}
              showSearch={false}
            />
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={closeEditModal}
        title="Edit User"
        size="lg"
      >
        <UserForm
          mode="edit"
          userId={editModal.userId || undefined}
          onSuccess={handleEditSuccess}
        />
      </Modal>

      {/* Status Toggle Confirmation Modal */}
      <ConfirmModal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        onConfirm={handleStatusToggle}
        title={`${
          statusModal.currentStatus === "ACTIVE" ? "Deactivate" : "Activate"
        } User`}
        message={`Are you sure you want to ${
          statusModal.currentStatus === "ACTIVE" ? "deactivate" : "activate"
        } "${statusModal.userName}"?`}
        confirmText={
          statusModal.currentStatus === "ACTIVE" ? "Deactivate" : "Activate"
        }
        cancelText="Cancel"
        variant={statusModal.currentStatus === "ACTIVE" ? "warning" : "info"}
        isLoading={toggleUserStatusMutation.isPending}
      />

      {/* Update Password Modal (for current user) */}
      <UpdatePasswordModal
        isOpen={updatePasswordModal.isOpen}
        onClose={closeUpdatePasswordModal}
        onSubmit={handleUpdatePassword}
        isLoading={updatePasswordMutation.isPending}
        userName={updatePasswordModal.userName}
      />

      {/* Reset Password Modal (for other users) */}
      <ResetPasswordModal
        isOpen={resetPasswordModal.isOpen}
        onClose={closeResetPasswordModal}
        onSubmit={handleResetPassword}
        isLoading={resetPasswordMutation.isPending}
        userName={resetPasswordModal.userName}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => handleDeleteUser(deleteModal.userId!)}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteModal.userName}"? This action cannot be undone.`}
        confirmText="Delete User"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
};

export default UserProfilePage;
