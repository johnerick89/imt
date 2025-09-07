import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { StatusBadge } from "./StatusBadge";
import UserTillActionCell from "./UserTillActionCell";
import type { UserTill } from "../types/TillsTypes";
import { formatToCurrency } from "../utils/textUtils";

interface UserTillsTableProps {
  data: UserTill[];
  isLoading?: boolean;
  onView: (userTill: UserTill) => void;
  onEdit: (userTill: UserTill) => void;
  onDelete: (userTill: UserTill) => void;
  onClose: (userTill: UserTill) => void;
  onBlock: (userTill: UserTill) => void;
}

const UserTillsTable: React.FC<UserTillsTableProps> = ({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onClose,
  onBlock,
}) => {
  const columns = useMemo<ColumnDef<UserTill>[]>(
    () => [
      {
        accessorKey: "user",
        header: "User",
        cell: ({ row }) => {
          const user = row.original.user;
          return user ? `${user.first_name} ${user.last_name}` : "-";
        },
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
        accessorKey: "date",
        header: "Date",
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
      },
      {
        accessorKey: "opening_balance",
        header: "Opening Balance",
        cell: ({ row }) => {
          const balance = row.original.opening_balance;
          return balance !== null && balance !== undefined
            ? formatToCurrency(balance)
            : "-";
        },
      },
      {
        accessorKey: "closing_balance",
        header: "Closing Balance",
        cell: ({ row }) => {
          const balance = row.original.closing_balance;
          return balance !== null && balance !== undefined
            ? formatToCurrency(balance)
            : "-";
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) =>
          row.original.created_at
            ? new Date(row.original.created_at).toLocaleDateString()
            : "-",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <UserTillActionCell
            userTill={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onClose={onClose}
            onBlock={onBlock}
          />
        ),
      },
    ],
    [onView, onEdit, onDelete, onClose, onBlock]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={isLoading}
      emptyMessage="No user tills found"
    />
  );
};

export default UserTillsTable;
