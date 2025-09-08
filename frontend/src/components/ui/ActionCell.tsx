import React from "react";
import {
  FiEye,
  FiEdit3,
  FiToggleLeft,
  FiToggleRight,
  FiTrash2,
} from "react-icons/fi";

interface ActionCellProps {
  onView?: () => void;
  onEdit?: () => void;
  onToggleStatus?: () => void;
  onDelete?: () => void;
  status?: string;
  showView?: boolean;
  showEdit?: boolean;
  showToggleStatus?: boolean;
  showDelete?: boolean;
}

export const ActionCell: React.FC<ActionCellProps> = ({
  onView,
  onEdit,
  onToggleStatus,
  onDelete,
  status,
  showView = true,
  showEdit = true,
  showToggleStatus = true,
  showDelete = true,
}) => {
  const getToggleStatusIcon = (currentStatus: string) => {
    switch (currentStatus) {
      case "ACTIVE":
        return <FiToggleLeft className="w-4 h-4" />;
      case "INACTIVE":
      case "PENDING":
      case "BLOCKED":
        return <FiToggleRight className="w-4 h-4" />;
      default:
        return <FiToggleLeft className="w-4 h-4" />;
    }
  };

  const getToggleStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case "ACTIVE":
        return "text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50";
      case "INACTIVE":
      case "PENDING":
      case "BLOCKED":
        return "text-green-600 hover:text-green-900 hover:bg-green-50";
      default:
        return "text-blue-600 hover:text-blue-900 hover:bg-blue-50";
    }
  };

  const getToggleStatusTitle = (currentStatus: string) => {
    switch (currentStatus) {
      case "ACTIVE":
        return "Deactivate";
      case "INACTIVE":
        return "Activate";
      case "PENDING":
        return "Activate";
      case "BLOCKED":
        return "Unblock";
      default:
        return "Toggle Status";
    }
  };

  return (
    <div className="flex justify-end space-x-1">
      {showView && onView && (
        <button
          onClick={onView}
          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-md transition-colors duration-200"
          title="View Details"
        >
          <FiEye className="w-4 h-4" />
        </button>
      )}
      {showEdit && onEdit && (
        <button
          onClick={onEdit}
          className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 rounded-md transition-colors duration-200"
          title="Edit"
        >
          <FiEdit3 className="w-4 h-4" />
        </button>
      )}
      {showToggleStatus && onToggleStatus && status && (
        <button
          onClick={onToggleStatus}
          className={`p-2 rounded-md transition-colors duration-200 ${getToggleStatusColor(
            status
          )}`}
          title={getToggleStatusTitle(status)}
        >
          {getToggleStatusIcon(status)}
        </button>
      )}
      {showDelete && onDelete && (
        <button
          onClick={onDelete}
          className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-md transition-colors duration-200"
          title="Delete"
        >
          <FiTrash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
