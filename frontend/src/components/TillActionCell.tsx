import React from "react";
import {
  FiEye,
  FiEdit2,
  FiTrash2,
  FiPlay,
  FiSquare,
  FiShield,
  FiXCircle,
  FiPlus,
  FiMinus,
} from "react-icons/fi";
import { TillStatus } from "../types/TillsTypes";
import type { Till } from "../types/TillsTypes";

interface TillActionCellProps {
  till: Till;
  onView: (till: Till) => void;
  onEdit: (till: Till) => void;
  onDelete: (till: Till) => void;
  onOpen: (till: Till) => void;
  onClose: (till: Till) => void;
  onBlock: (till: Till) => void;
  onDeactivate: (till: Till) => void;
  onTopup: (till: Till) => void;
  onWithdraw: (till: Till) => void;
}

const TillActionCell: React.FC<TillActionCellProps> = ({
  till,
  onView,
  onEdit,
  onDelete,
  onOpen,
  onClose,
  onBlock,
  onDeactivate,
  onTopup,
  onWithdraw,
}) => {
  // Check if till can be opened (assigned to user)
  const canOpen =
    till.status !== TillStatus.BLOCKED &&
    till.status !== TillStatus.PENDING &&
    !till.current_teller_user_id &&
    !till.opened_at;

  // Check if till can be closed (is currently open)
  const canClose = till.current_teller_user_id && till.opened_at;

  // Check if till can be blocked (not already blocked)
  const canBlock = till.status !== TillStatus.BLOCKED;

  // Check if till can be deactivated (not already inactive)
  const canDeactivate = till.status !== TillStatus.INACTIVE;

  return (
    <div className="flex items-center gap-2">
      {/* View */}
      <button
        onClick={() => onView(till)}
        className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors duration-200"
        title="View till details"
      >
        <FiEye className="h-4 w-4" />
      </button>

      {/* Edit */}
      <button
        onClick={() => onEdit(till)}
        className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors duration-200"
        title="Edit till"
      >
        <FiEdit2 className="h-4 w-4" />
      </button>

      {/* Till Operations */}
      {canOpen && (
        <button
          onClick={() => onOpen(till)}
          className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors duration-200"
          title="Open till (assign to current user)"
        >
          <FiPlay className="h-4 w-4" />
        </button>
      )}

      {canClose && (
        <button
          onClick={() => onClose(till)}
          className="p-1 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded transition-colors duration-200"
          title="Close till"
        >
          <FiSquare className="h-4 w-4" />
        </button>
      )}

      {canBlock && (
        <button
          onClick={() => onBlock(till)}
          className="p-1 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded transition-colors duration-200"
          title="Block till"
        >
          <FiShield className="h-4 w-4" />
        </button>
      )}

      {canDeactivate && (
        <button
          onClick={() => onDeactivate(till)}
          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors duration-200"
          title="Deactivate till"
        >
          <FiXCircle className="h-4 w-4" />
        </button>
      )}

      {/* Topup */}
      <button
        onClick={() => onTopup(till)}
        className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors duration-200"
        title="Topup till"
      >
        <FiPlus className="h-4 w-4" />
      </button>

      {/* Withdraw */}
      <button
        onClick={() => onWithdraw(till)}
        className="p-1 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded transition-colors duration-200"
        title="Withdraw from till"
      >
        <FiMinus className="h-4 w-4" />
      </button>

      {/* Delete */}
      <button
        onClick={() => onDelete(till)}
        className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors duration-200"
        title="Delete till"
      >
        <FiTrash2 className="h-4 w-4" />
      </button>
    </div>
  );
};

export default TillActionCell;
