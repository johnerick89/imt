import React from "react";
import { FiEdit2, FiTrash2, FiEye } from "react-icons/fi";
import type { Vault } from "../types/VaultsTypes";

interface VaultActionCellProps {
  vault: Vault;
  onView: (vault: Vault) => void;
  onEdit: (vault: Vault) => void;
  onDelete: (vault: Vault) => void;
}

const VaultActionCell: React.FC<VaultActionCellProps> = ({
  vault,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={() => onView(vault)}
        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors duration-200"
        title="View vault"
      >
        <FiEye className="h-4 w-4" />
      </button>
      <button
        onClick={() => onEdit(vault)}
        className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors duration-200"
        title="Edit vault"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>
      <button
        onClick={() => onDelete(vault)}
        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors duration-200"
        title="Delete vault"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default VaultActionCell;
