import React from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiEye } from "react-icons/fi";
import {
  ExchangeRateStatus,
  ExchangeRateOperatorStatus,
} from "../types/ExchangeRatesTypes";
import type { ExchangeRate } from "../types/ExchangeRatesTypes";
import { usePermissions } from "../hooks/usePermissions";
interface ExchangeRateActionCellProps {
  exchangeRate: ExchangeRate;
  onView: (exchangeRate: ExchangeRate) => void;
  onEdit: (exchangeRate: ExchangeRate) => void;
  onDelete: (exchangeRate: ExchangeRate) => void;
  onApprove: (exchangeRate: ExchangeRate) => void;
  onReject: (exchangeRate: ExchangeRate) => void;
}

const ExchangeRateActionCell: React.FC<ExchangeRateActionCellProps> = ({
  exchangeRate,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) => {
  const { canEditExchangeRates, canDeleteExchangeRates } = usePermissions();
  // Check if exchange rate can be approved/rejected
  const canApprove =
    canEditExchangeRates() &&
    (exchangeRate.status === ExchangeRateStatus.PENDING_APPROVAL ||
      exchangeRate.operator_status ===
        ExchangeRateOperatorStatus.PENDING_APPROVAL);

  const canEdit =
    exchangeRate.status !== ExchangeRateStatus.APPROVED &&
    exchangeRate.status !== ExchangeRateStatus.ACTIVE &&
    canEditExchangeRates();

  const canDelete =
    exchangeRate.status !== ExchangeRateStatus.APPROVED &&
    exchangeRate.status !== ExchangeRateStatus.ACTIVE &&
    canDeleteExchangeRates();

  return (
    <div className="flex items-center gap-2">
      {/* View */}
      {canEdit && (
        <button
          onClick={() => onView(exchangeRate)}
          className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded transition-colors duration-200"
          title="View exchange rate"
        >
          <FiEye className="h-4 w-4" />
        </button>
      )}

      {/* Edit */}
      {canEdit && (
        <button
          onClick={() => onEdit(exchangeRate)}
          className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors duration-200"
          title="Edit exchange rate"
        >
          <FiEdit2 className="h-4 w-4" />
        </button>
      )}

      {/* Approve */}
      {canApprove && (
        <button
          onClick={() => onApprove(exchangeRate)}
          className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded transition-colors duration-200"
          title="Approve exchange rate"
        >
          <FiCheck className="h-4 w-4" />
        </button>
      )}

      {/* Reject */}
      {canApprove && (
        <button
          onClick={() => onReject(exchangeRate)}
          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors duration-200"
          title="Reject exchange rate"
        >
          <FiX className="h-4 w-4" />
        </button>
      )}

      {/* Delete */}
      {canDelete && (
        <button
          onClick={() => onDelete(exchangeRate)}
          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors duration-200"
          title="Delete exchange rate"
        >
          <FiTrash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default ExchangeRateActionCell;
