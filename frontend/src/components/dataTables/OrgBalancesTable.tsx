import React, { useState } from "react";
import { FiPlus, FiEdit, FiMinus, FiEye } from "react-icons/fi";
import { Button } from "../ui/Button";
import { DataTable } from "../ui/DataTable";
import { formatToCurrency } from "../../utils/textUtils";
import type { OrgBalance } from "../../types/BalanceOperationsTypes";
import type { ColumnDef, Row } from "@tanstack/react-table";
import { usePermissions } from "../../hooks/usePermissions";
import EditFloatLimitModal from "../modals/EditFloatLimitModal";
import BalanceHistoryModal from "../modals/BalanceHistoryModal";

interface OrgBalancesTableProps {
  data: OrgBalance[];
  loading: boolean;
  onPrefund: (orgId: string) => void;
  onReduceFloat?: (orgId: string) => void;
  onEditLimit?: (balance: OrgBalance) => void;
  mainFloat: boolean;
}

const OrgBalancesTable: React.FC<OrgBalancesTableProps> = ({
  data,
  loading,
  onPrefund,
  onReduceFloat,
  onEditLimit,
  mainFloat,
}) => {
  const { canCreateOrgBalances } = usePermissions();
  const [selectedBalance, setSelectedBalance] = useState<OrgBalance | null>(
    null
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedHistoryBalance, setSelectedHistoryBalance] =
    useState<OrgBalance | null>(null);

  const handleEditLimit = (balance: OrgBalance) => {
    setSelectedBalance(balance);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedBalance(null);
  };

  const handleUpdateLimit = (updatedBalance: OrgBalance) => {
    if (onEditLimit) {
      onEditLimit(updatedBalance);
    }
    handleCloseEditModal();
  };

  const handleViewHistory = (balance: OrgBalance) => {
    setSelectedHistoryBalance(balance);
    setShowHistoryModal(true);
  };

  const handleCloseHistoryModal = () => {
    setShowHistoryModal(false);
    setSelectedHistoryBalance(null);
  };

  console.log("onReduceFloat", onReduceFloat);

  // Table columns
  const columns: ColumnDef<OrgBalance>[] = [
    ...(!mainFloat
      ? [
          {
            accessorKey: "base_org",
            header: "Base Organisation",
            cell: ({ row }: { row: Row<OrgBalance> }) => (
              <div>
                <div className="font-medium text-gray-900">
                  {row.original.base_org.name}
                </div>
                <div className="text-sm text-gray-500">
                  {row.original.base_org.type}
                </div>
              </div>
            ),
          },
        ]
      : []),
    ...(!mainFloat
      ? [
          {
            accessorKey: "dest_org",
            header: "Agency/Partner",
            cell: ({ row }: { row: Row<OrgBalance> }) => (
              <div>
                <div className="font-medium text-gray-900">
                  {row.original.dest_org.name}
                </div>
                <div className="text-sm text-gray-500">
                  {row.original.dest_org.type}
                </div>
              </div>
            ),
          },
        ]
      : []),
    {
      accessorKey: "currency",
      header: "Currency",
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          {row.original.currency.currency_code}
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance",
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          {formatToCurrency(row.original.balance || 0)}
        </div>
      ),
    },
    {
      accessorKey: "locked_balance",
      header: "Locked Balance",
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          {formatToCurrency(row.original.locked_balance || 0)}
        </div>
      ),
    },
    {
      accessorKey: "limit",
      header: "Limit",
      cell: ({ row }) => (
        <div className="text-sm text-gray-900">
          {formatToCurrency(row.original.limit || 0)}
        </div>
      ),
    },
    ...(!mainFloat
      ? [
          {
            accessorKey: "created_at",
            header: "Created",
            cell: ({ row }: { row: Row<OrgBalance> }) => (
              <div className="text-sm text-gray-900">
                {new Date(row.original.created_at).toLocaleDateString()}
              </div>
            ),
          },
        ]
      : []),
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => handleViewHistory(row.original)}
            size="sm"
            variant="outline"
            className="text-gray-600 hover:text-gray-700"
          >
            <FiEye className="h-4 w-4 mr-1" />
            View
          </Button>
          {canCreateOrgBalances() && !mainFloat && (
            <Button
              onClick={() => onPrefund(row.original.dest_org_id)}
              size="sm"
              variant="outline"
              className="text-green-600 hover:text-green-700"
            >
              <FiPlus className="h-4 w-4 mr-1" />
              Topup Float
            </Button>
          )}
          {canCreateOrgBalances() && onReduceFloat && (
            <Button
              onClick={() => onReduceFloat(row.original.dest_org_id)}
              size="sm"
              variant="outline"
              className="text-red-600 hover:text-red-700"
            >
              <FiMinus className="h-4 w-4 mr-1" />
              Reduce Float
            </Button>
          )}
          {canCreateOrgBalances() && !mainFloat && (
            <Button
              onClick={() => handleEditLimit(row.original)}
              size="sm"
              variant="outline"
              className="text-blue-600 hover:text-blue-700"
            >
              <FiEdit className="h-4 w-4 mr-1" />
              Edit Limit
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          emptyMessage="No organisation balances found"
        />
      </div>

      {selectedBalance && (
        <EditFloatLimitModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          onSubmit={handleUpdateLimit}
          balance={selectedBalance}
        />
      )}

      <BalanceHistoryModal
        isOpen={showHistoryModal}
        onClose={handleCloseHistoryModal}
        balance={selectedHistoryBalance}
      />
    </>
  );
};

export default OrgBalancesTable;
