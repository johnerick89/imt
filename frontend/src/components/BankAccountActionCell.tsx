import React from "react";
import { FiEdit, FiTrash2, FiEye, FiPlus, FiMinus } from "react-icons/fi";
import type { BankAccount } from "../types/BankAccountsTypes";
import { usePermissions } from "../hooks/usePermissions";
interface BankAccountActionCellProps {
  bankAccount: BankAccount;
  onView?: (bankAccount: BankAccount) => void;
  onEdit?: (bankAccount: BankAccount) => void;
  onDelete?: (bankAccount: BankAccount) => void;
  onTopup?: (bankAccount: BankAccount) => void;
  onWithdraw?: (bankAccount: BankAccount) => void;
}

const BankAccountActionCell: React.FC<BankAccountActionCellProps> = ({
  bankAccount,
  onView,
  onEdit,
  onDelete,
  onTopup,
  onWithdraw,
}) => {
  const { canEditBankAccounts, canDeleteBankAccounts } = usePermissions();
  const canEdit = canEditBankAccounts(); // Add any business logic here
  const canDelete = canDeleteBankAccounts(); // Add any business logic here
  const canTopup = canEditBankAccounts(); // Add any business logic here
  const canWithdraw = bankAccount.balance > 0 && canEditBankAccounts(); // Can only withdraw if there's balance

  return (
    <div className="flex items-center space-x-2">
      {onView && (
        <button
          onClick={() => onView(bankAccount)}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="View details"
        >
          <FiEye className="h-4 w-4" />
        </button>
      )}

      {onEdit && canEdit && (
        <button
          onClick={() => onEdit(bankAccount)}
          className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
          title="Edit bank account"
        >
          <FiEdit className="h-4 w-4" />
        </button>
      )}

      {onTopup && canTopup && (
        <button
          onClick={() => onTopup(bankAccount)}
          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Top up balance"
        >
          <FiPlus className="h-4 w-4" />
        </button>
      )}

      {onWithdraw && canWithdraw && (
        <button
          onClick={() => onWithdraw(bankAccount)}
          className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          title="Withdraw from balance"
        >
          <FiMinus className="h-4 w-4" />
        </button>
      )}

      {onDelete && canDelete && (
        <button
          onClick={() => onDelete(bankAccount)}
          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete bank account"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default BankAccountActionCell;
