import React, { useState } from "react";
import {
  usePermissions,
  useCreateRolePermission,
  useDeleteRolePermission,
} from "../hooks/useRoles";
import type { Role, Permission } from "../types/RolesTypes";

interface PermissionManagerProps {
  role: Role;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({ role }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: permissionsData, isLoading } = usePermissions({ limit: 100 });
  const createRolePermissionMutation = useCreateRolePermission();
  const deleteRolePermissionMutation = useDeleteRolePermission();

  const allPermissions = permissionsData?.data?.permissions || [];
  const rolePermissionIds = new Set(role.permissions?.map((p) => p.id) || []);

  const filteredPermissions = allPermissions.filter(
    (permission) =>
      permission.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (permission.description &&
        permission.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handlePermissionToggle = async (
    permission: Permission,
    isChecked: boolean
  ) => {
    if (isChecked) {
      // Add permission to role
      createRolePermissionMutation.mutate({
        role_id: role.id,
        permission_id: permission.id,
      });
    } else {
      // Remove permission from role
      // Find the role permission ID by matching role and permission
      const rolePermission = role.permissions?.find(
        (p) => p.id === permission.id
      );
      if (rolePermission) {
        // Since we don't have the role_permission ID, we need to call the delete endpoint
        // with a way to identify the specific role-permission relationship
        // For now, we'll use the permission ID and let the backend handle it
        deleteRolePermissionMutation.mutate({
          roleId: role.id,
          permissionId: permission.id,
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Role Permissions
          </h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-3 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        {filteredPermissions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No permissions found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPermissions.map((permission) => {
              const isChecked = rolePermissionIds.has(permission.id);
              return (
                <div
                  key={permission.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id={`permission-${permission.id}`}
                      checked={isChecked}
                      onChange={(e) =>
                        handlePermissionToggle(permission, e.target.checked)
                      }
                      disabled={
                        createRolePermissionMutation.isPending ||
                        deleteRolePermissionMutation.isPending
                      }
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`permission-${permission.id}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium text-gray-900">
                        {permission.name}
                      </div>
                      {permission.description && (
                        <div className="text-sm text-gray-500">
                          {permission.description}
                        </div>
                      )}
                    </label>
                  </div>
                  <div className="text-xs text-gray-400">
                    {isChecked ? "Granted" : "Not granted"}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {(createRolePermissionMutation.isPending ||
        deleteRolePermissionMutation.isPending) && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">
              Updating permissions...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionManager;
