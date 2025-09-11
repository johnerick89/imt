import React from "react";
import { FiEdit, FiTrash2, FiEye, FiUserCheck, FiUserX } from "react-icons/fi";
import type { Beneficiary } from "../types/BeneficiariesTypes";

interface BeneficiaryActionCellProps {
  beneficiary: Beneficiary;
  onView?: (beneficiary: Beneficiary) => void;
  onEdit: (beneficiary: Beneficiary) => void;
  onDelete: (id: string, name: string) => void;
  onToggleStatus: (beneficiary: Beneficiary) => void;
}

const BeneficiaryActionCell: React.FC<BeneficiaryActionCellProps> = ({
  beneficiary,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <div className="flex items-center space-x-2">
      {onView && (
        <button
          onClick={() => onView(beneficiary)}
          className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
          title="View beneficiary"
        >
          <FiEye className="w-4 h-4" />
        </button>
      )}

      <button
        onClick={() => onEdit(beneficiary)}
        className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
        title="Edit beneficiary"
      >
        <FiEdit className="w-4 h-4" />
      </button>

      <button
        onClick={() => onToggleStatus(beneficiary)}
        className={`p-1 rounded ${
          beneficiary.status === "ACTIVE"
            ? "text-gray-600 hover:text-orange-600 hover:bg-orange-50"
            : "text-gray-600 hover:text-green-600 hover:bg-green-50"
        }`}
        title={
          beneficiary.status === "ACTIVE"
            ? "Deactivate beneficiary"
            : "Activate beneficiary"
        }
      >
        {beneficiary.status === "ACTIVE" ? (
          <FiUserX className="w-4 h-4" />
        ) : (
          <FiUserCheck className="w-4 h-4" />
        )}
      </button>

      <button
        onClick={() => onDelete(beneficiary.id, beneficiary.name)}
        className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
        title="Delete beneficiary"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default BeneficiaryActionCell;
