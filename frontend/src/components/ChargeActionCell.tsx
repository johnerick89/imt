import { FiEdit, FiTrash2, FiCheckCircle, FiXCircle } from "react-icons/fi";
import type { Charge } from "../types/ChargesTypes";
import { usePermissions } from "../hooks/usePermissions";
interface ChargeActionCellProps {
  onEdit: (charge: Charge) => void;
  onToggleStatus: (charge: Charge) => void;
  onDelete: (charge: Charge) => void;
}

export default function ChargeActionCell({
  onEdit,
  onToggleStatus,
  onDelete,
}: ChargeActionCellProps) {
  const { canEditCharges, canDeleteCharges } = usePermissions();
  const deletingChargesAllowed = false;
  const canReallyDelete = canDeleteCharges() && deletingChargesAllowed;
  console.log("canReallyDelete", canReallyDelete);
  return {
    id: "actions",
    header: "Actions",
    cell: ({ row }: { row: { original: Charge } }) => {
      const charge = row.original;
      const isActive = charge.status === "ACTIVE";

      return (
        <div className="flex items-center space-x-2">
          {canEditCharges() && (
            <button
              onClick={() => onEdit(charge)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit charge"
            >
              <FiEdit className="w-4 h-4" />
            </button>
          )}

          {canEditCharges() && (
            <button
              onClick={() => onToggleStatus(charge)}
              className={`p-2 rounded-lg transition-colors ${
                isActive
                  ? "text-red-600 hover:bg-red-50"
                  : "text-green-600 hover:bg-green-50"
              }`}
              title={isActive ? "Deactivate charge" : "Activate charge"}
            >
              {isActive ? (
                <FiXCircle className="w-4 h-4" />
              ) : (
                <FiCheckCircle className="w-4 h-4" />
              )}
            </button>
          )}

          {canReallyDelete && (
            <button
              onClick={() => onDelete(charge)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete charge"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      );
    },
  };
}
