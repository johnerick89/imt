import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiUsers, FiShield } from "react-icons/fi";
import { useRole } from "../hooks/useRoles";
import PermissionManager from "../components/PermissionManager";

const RoleProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: roleData, isLoading, error } = useRole(id || "");

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !roleData?.success) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading role
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {roleData?.message || "Failed to load role information"}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const role = roleData.data;

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate("/roles")}
            className="mr-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Role Profile</h1>
            <p className="text-gray-600 mt-1">
              View and manage role details and permissions
            </p>
          </div>
        </div>
      </div>

      {/* Role Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">
                  {getInitials(role.name)}
                </span>
              </div>
            </div>
            <div className="ml-6">
              <h2 className="text-3xl font-bold text-white">{role.name}</h2>
              <div className="flex items-center mt-2">
                <FiShield className="h-4 w-4 text-blue-100 mr-2" />
                <span className="text-blue-100 text-sm">
                  {role.permissions?.length || 0} permissions assigned
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Role Information
                </h3>
                <div className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900 font-medium">
                      {role.name}
                    </dd>
                  </div>

                  {role.description && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">
                        Description
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {role.description}
                      </dd>
                    </div>
                  )}

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Created Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {formatDate(role.created_at)}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Created By
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {role.created_by_user
                        ? `${role.created_by_user.first_name} ${role.created_by_user.last_name}`
                        : "System"}
                    </dd>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistics */}
            <div className="p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Statistics
                </h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiShield className="h-8 w-8 text-blue-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-blue-600">
                          Permissions
                        </p>
                        <p className="text-2xl font-bold text-blue-900">
                          {role.permissions?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <FiUsers className="h-8 w-8 text-green-600" />
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-600">
                          Users with this role
                        </p>
                        <p className="text-2xl font-bold text-green-900">0</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Management */}
      <PermissionManager role={role} />
    </div>
  );
};

export default RoleProfilePage;
