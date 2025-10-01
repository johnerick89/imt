import React from "react";
import { FiEdit, FiTrash2, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { usePermissions } from "../hooks/usePermissions";

interface IntegrationActionCellProps {
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  status: string;
}

const IntegrationActionCell: React.FC<IntegrationActionCellProps> = ({
  onEdit,
  onToggleStatus,
  onDelete,
  status,
}) => {
  const isActive = status === "ACTIVE";
  const { canEditIntegrations, canDeleteIntegrations } = usePermissions();

  return (
    <div className="flex items-center space-x-2">
      {canEditIntegrations() && (
        <button
          onClick={onEdit}
          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit"
        >
          <FiEdit className="w-4 h-4" />
        </button>
      )}

      {canEditIntegrations() && (
        <button
          onClick={onToggleStatus}
          className={`p-2 rounded-lg transition-colors ${
            isActive
              ? "text-red-600 hover:text-red-800 hover:bg-red-50"
              : "text-green-600 hover:text-green-800 hover:bg-green-50"
          }`}
          title={isActive ? "Deactivate" : "Activate"}
        >
          {isActive ? (
            <FiXCircle className="w-4 h-4" />
          ) : (
            <FiCheckCircle className="w-4 h-4" />
          )}
        </button>
      )}

      {canDeleteIntegrations() && (
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default IntegrationActionCell;
