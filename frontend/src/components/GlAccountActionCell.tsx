import React from "react";
import { FiEdit, FiTrash2, FiEye, FiLock, FiUnlock } from "react-icons/fi";
import type { GlAccount } from "../types/GlAccountsTypes";
import { usePermissions } from "../hooks/usePermissions";
interface GlAccountActionCellProps {
  glAccount: GlAccount;
  onView?: (glAccount: GlAccount) => void;
  onEdit?: (glAccount: GlAccount) => void;
  onDelete?: (glAccount: GlAccount) => void;
  onFreeze?: (glAccount: GlAccount) => void;
  onUnfreeze?: (glAccount: GlAccount) => void;
}

const GlAccountActionCell: React.FC<GlAccountActionCellProps> = ({
  glAccount,
  onView,
  onEdit,
  onDelete,
  onFreeze,
  onUnfreeze,
}) => {
  const { canEditGlAccounts, canDeleteGlAccounts } = usePermissions();
  const canEdit =
    !glAccount.closed_at && !glAccount.frozen_at && canEditGlAccounts();
  const canDelete =
    !glAccount.closed_at && !glAccount.frozen_at && canDeleteGlAccounts();
  const canFreeze =
    !glAccount.closed_at && !glAccount.frozen_at && canEditGlAccounts();
  const canUnfreeze =
    glAccount.frozen_at && !glAccount.closed_at && canEditGlAccounts();

  return (
    <div className="flex items-center space-x-2">
      {onView && (
        <button
          onClick={() => onView(glAccount)}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="View details"
        >
          <FiEye className="h-4 w-4" />
        </button>
      )}

      {onEdit && canEdit && (
        <button
          onClick={() => onEdit(glAccount)}
          className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
          title="Edit GL account"
        >
          <FiEdit className="h-4 w-4" />
        </button>
      )}

      {onFreeze && canFreeze && (
        <button
          onClick={() => onFreeze(glAccount)}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title="Freeze account"
        >
          <FiLock className="h-4 w-4" />
        </button>
      )}

      {onUnfreeze && canUnfreeze && (
        <button
          onClick={() => onUnfreeze(glAccount)}
          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Unfreeze account"
        >
          <FiUnlock className="h-4 w-4" />
        </button>
      )}

      {onDelete && canDelete && (
        <button
          onClick={() => onDelete(glAccount)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete GL account"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default GlAccountActionCell;
