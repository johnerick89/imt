import React, { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  useUser,
  useCurrentUser,
  useToggleUserStatus,
  useDeleteUser,
  useUserAuditHistory,
} from "../hooks";
import { StatusBadge } from "../components/ui/StatusBadge";
import { DataTable } from "../components/ui/DataTable";
import { ConfirmModal } from "../components/ConfirmModal";
import type { ColumnDef } from "@tanstack/react-table";
import type { UserActivity } from "../types/UserActivityTypes";
import { useSession } from "../hooks";

const UserProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, isInitialized } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

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
    if (!user) return;

    try {
      const newStatus = user.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await toggleUserStatusMutation.mutateAsync({
        userId: user.id,
        status: newStatus,
      });
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    try {
      await deleteUserMutation.mutateAsync(user.id);
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
          {!isMyProfile && (
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/users/${user.id}/edit`)}
                className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center"
              >
                <span className="mr-2">✏️</span>
                Edit User
              </button>
              <button
                onClick={handleStatusToggle}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  user.status === "ACTIVE"
                    ? "text-red-600 bg-red-50 border border-red-200 hover:bg-red-100"
                    : "text-green-600 bg-green-50 border border-green-200 hover:bg-green-100"
                }`}
              >
                <span className="mr-2">
                  {user.status === "ACTIVE" ? "❌" : "✅"}
                </span>
                {user.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={openDeleteModal}
                className="px-4 py-2 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 flex items-center"
              >
                <span className="mr-2">🗑️</span>
                Delete User
              </button>
            </div>
          )}
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
            <div className="ml-6">
              <h2 className="text-2xl font-bold text-white">
                {user.first_name} {user.last_name}
              </h2>
              <p className="text-blue-100">{user.email}</p>
              <div className="flex items-center mt-2 space-x-4">
                <StatusBadge status={user.role || ""} type="role" />
                <StatusBadge status={user.status || ""} type="status" />
              </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Avatar
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {user.avatar
                      ? "Custom avatar uploaded"
                      : "No avatar uploaded"}
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
                    User ID
                  </label>
                  <p className="mt-1 text-sm text-gray-900 font-mono">
                    {user.id}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Role
                  </label>
                  <StatusBadge status={user.role || ""} type="role" />
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
                    {user.organisation?.name || "No organisation assigned"} //
                    TODO: Fix this
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
              <button className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 flex items-center">
                <span className="mr-2">🔑</span>
                Reset Password
              </button>
              <button className="px-4 py-2 text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 flex items-center">
                <span className="mr-2">📧</span>
                Send Welcome Email
              </button>
              <button className="px-4 py-2 text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 flex items-center">
                <span className="mr-2">📊</span>
                View Activity Log
              </button>
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteUser}
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
