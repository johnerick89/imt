import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { StatusBadge } from "./StatusBadge";
import TillActionCell from "./TillActionCell";
import type { Till } from "../types/TillsTypes";

interface TillsTableProps {
  data: Till[];
  isLoading?: boolean;
  onView: (till: Till) => void;
  onEdit: (till: Till) => void;
  onDelete: (till: Till) => void;
  onOpen: (till: Till) => void;
  onClose: (till: Till) => void;
  onBlock: (till: Till) => void;
  onDeactivate: (till: Till) => void;
}

const TillsTable: React.FC<TillsTableProps> = ({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onOpen,
  onClose,
  onBlock,
  onDeactivate,
}) => {
  const columns = useMemo<ColumnDef<Till>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Till Name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            {row.original.description && (
              <div className="text-sm text-gray-500">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const status = row.original.status;

          return <StatusBadge status={status} type="status" />;
        },
      },
      {
        accessorKey: "location",
        header: "Location",
        cell: ({ row }) => row.original.location || "-",
      },
      {
        accessorKey: "vault",
        header: "Vault",
        cell: ({ row }) => row.original.vault?.name || "-",
      },
      {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => {
          const currency = row.original.currency;
          return currency
            ? `${currency.currency_code} - ${currency.currency_name}`
            : "-";
        },
      },
      {
        accessorKey: "organisation",
        header: "Organisation",
        cell: ({ row }) => row.original.organisation?.name || "-",
      },
      {
        accessorKey: "current_teller_user",
        header: "Current Teller",
        cell: ({ row }) => {
          const user = row.original.current_teller_user;
          return user ? `${user.first_name} ${user.last_name}` : "-";
        },
      },
      {
        accessorKey: "opened_at",
        header: "Opened At",
        cell: ({ row }) => {
          const openedAt = row.original.opened_at;
          return openedAt ? new Date(openedAt).toLocaleDateString() : "-";
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString(),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <TillActionCell
            till={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onOpen={onOpen}
            onClose={onClose}
            onBlock={onBlock}
            onDeactivate={onDeactivate}
          />
        ),
      },
    ],
    [onView, onEdit, onDelete, onOpen, onClose, onBlock, onDeactivate]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={isLoading}
      emptyMessage="No tills found"
    />
  );
};

export default TillsTable;
