import React, { useMemo } from "react";
import { DataTable } from "./ui/DataTable";
import VaultActionCell from "./VaultActionCell";
import type { Vault } from "../types/VaultsTypes";
import type { ColumnDef } from "@tanstack/react-table";
import { formatToCurrency } from "../utils/textUtils";

interface VaultsTableProps {
  vaults: Vault[];
  loading: boolean;
  onView: (vault: Vault) => void;
  onEdit: (vault: Vault) => void;
  onDelete: (vault: Vault) => void;
  onTopup?: (vault: Vault) => void;
  onWithdraw?: (vault: Vault) => void;
}

const VaultsTable: React.FC<VaultsTableProps> = ({
  vaults,
  loading,
  onView,
  onEdit,
  onDelete,
  onTopup,
  onWithdraw,
}) => {
  const columns = useMemo<ColumnDef<Vault>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <button
            onClick={() => onView(row.original)}
            className="text-left w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="font-medium text-blue-600 hover:text-blue-800">
              {row.original.name}
            </div>
          </button>
        ),
      },
      {
        accessorKey: "organisation",
        header: "Organisation",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {row.original.organisation?.name || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {row.original.currency
              ? `${row.original.currency.currency_code} - ${row.original.currency.currency_name}`
              : "No currency"}
          </div>
        ),
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {row.original.balance && row.original.balance > 0
              ? formatToCurrency(row.original.balance) +
                " " +
                row.original.currency?.currency_code
              : "-"}
          </div>
        ),
      },
      {
        accessorKey: "locked_balance",
        header: "Locked Balance",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {row.original.locked_balance && row.original.locked_balance > 0
              ? formatToCurrency(row.original.locked_balance) +
                " " +
                row.original.currency?.currency_code
              : "-"}
          </div>
        ),
      },
      {
        accessorKey: "created_by_user",
        header: "Created By",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {row.original.created_by_user?.first_name &&
            row.original.created_by_user?.last_name
              ? row.original.created_by_user?.first_name +
                " " +
                row.original.created_by_user?.last_name
              : "-"}
          </div>
        ),
      },
      {
        accessorKey: "created_at",
        header: "Created At",
        cell: ({ row }) => (
          <div className="text-sm text-gray-600">
            {new Date(row.original.created_at).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <VaultActionCell
            vault={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onTopup={onTopup}
            onWithdraw={onWithdraw}
          />
        ),
      },
    ],
    [onView, onEdit, onDelete, onTopup, onWithdraw]
  );

  return (
    <DataTable
      data={vaults}
      columns={columns}
      loading={loading}
      emptyMessage="No vaults found"
    />
  );
};

export default VaultsTable;
