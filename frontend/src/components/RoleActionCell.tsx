import React from "react";
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import type { Role } from "../types/RolesTypes";

interface RoleActionCellProps {
  role: Role;
  onView: (role: Role) => void;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

const RoleActionCell: React.FC<RoleActionCellProps> = ({
  role,
  onView,
  onEdit,
  onDelete,
}) => {
  const hasPermissions = role.permissions && role.permissions.length > 0;
  const canDelete = !hasPermissions;

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onView(role)}
        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors duration-200"
        title="View role"
      >
        <FiEye className="h-4 w-4" />
      </button>
      <button
        onClick={() => onEdit(role)}
        className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors duration-200"
        title="Edit role"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => canDelete && onDelete(role)}
        disabled={!canDelete}
        className={`p-1 rounded transition-colors duration-200 ${
          canDelete
            ? "text-red-600 hover:text-red-900 hover:bg-red-50 cursor-pointer"
            : "text-gray-400 cursor-not-allowed"
        }`}
        title={
          canDelete
            ? "Delete role"
            : "Cannot delete role with assigned permissions"
        }
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default RoleActionCell;
