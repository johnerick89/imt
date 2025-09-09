import React from "react";
import { FiSquare, FiShield } from "react-icons/fi";
import { UserTillStatus } from "../types/TillsTypes";
import type { UserTill } from "../types/TillsTypes";

interface UserTillActionCellProps {
  userTill: UserTill;
  onClose: (userTill: UserTill) => void;
  onBlock: (userTill: UserTill) => void;
}

const UserTillActionCell: React.FC<UserTillActionCellProps> = ({
  userTill,
  onClose,
  onBlock,
}) => {
  // Check if user till can be closed (is currently active)
  const canClose = userTill.status === UserTillStatus.OPEN;

  // Check if user till can be blocked (not already blocked or closed)
  const canBlock =
    userTill.status !== UserTillStatus.BLOCKED &&
    userTill.status !== UserTillStatus.CLOSED;

  return (
    <div className="flex items-center gap-2">
      {/* View */}

      {/* Close User Till */}
      {canClose && (
        <button
          onClick={() => onClose(userTill)}
          className="p-1 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded transition-colors duration-200"
          title="Close user till"
        >
          <FiSquare className="h-4 w-4" />
        </button>
      )}

      {/* Block User Till */}
      {canBlock && (
        <button
          onClick={() => onBlock(userTill)}
          className="p-1 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded transition-colors duration-200"
          title="Block user till"
        >
          <FiShield className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default UserTillActionCell;
