import React, { useMemo } from "react";
import { DataTable } from "./DataTable";
import VaultActionCell from "./VaultActionCell";
import type { Vault } from "../types/VaultsTypes";
import type { ColumnDef } from "@tanstack/react-table";

interface VaultsTableProps {
  vaults: Vault[];
  loading: boolean;
  onView: (vault: Vault) => void;
  onEdit: (vault: Vault) => void;
  onDelete: (vault: Vault) => void;
}

const VaultsTable: React.FC<VaultsTableProps> = ({
  vaults,
  loading,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns = useMemo<ColumnDef<Vault>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div className="font-medium text-gray-900">{row.original.name}</div>
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
          />
        ),
      },
    ],
    [onView, onEdit, onDelete]
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
