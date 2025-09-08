import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/DataTable";
import { StatusBadge } from "./ui/StatusBadge";
import CorridorActionCell from "./CorridorActionCell";
import type { Corridor } from "../types/CorridorsTypes";

interface CorridorsTableProps {
  data: Corridor[];
  onEdit: (corridor: Corridor) => void;
  onToggleStatus: (corridor: Corridor, currentStatus: string) => void;
  onDelete: (corridor: Corridor) => void;
  isLoading?: boolean;
}

const CorridorsTable: React.FC<CorridorsTableProps> = ({
  data,
  onEdit,
  onToggleStatus,
  onDelete,
  isLoading = false,
}) => {
  const columns = useMemo<ColumnDef<Corridor>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            {row.original.description && (
              <div className="text-sm text-gray-500 truncate max-w-xs">
                {row.original.description}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "base_country",
        header: "Base Country",
        cell: ({ row }) => (
          <span className="text-sm text-gray-900">
            {row.original.base_country?.name || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "destination_country",
        header: "Destination Country",
        cell: ({ row }) => (
          <span className="text-sm text-gray-900">
            {row.original.destination_country?.name || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "base_currency",
        header: "Base Currency",
        cell: ({ row }) => (
          <span className="text-sm text-gray-900">
            {row.original.base_currency?.currency_code || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "organisation",
        header: "Organisation",
        cell: ({ row }) => (
          <span className="text-sm text-gray-900">
            {row.original.organisation?.name || "N/A"}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <span className="text-sm text-gray-900">
            {new Date(row.original.created_at).toLocaleDateString()}
          </span>
        ),
      },
      {
        accessorKey: "created_by_user",
        header: "Created By",
        cell: ({ row }) => (
          <span className="text-sm text-gray-900">
            {row.original.created_by_user
              ? `${row.original.created_by_user.first_name} ${row.original.created_by_user.last_name}`
              : "N/A"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <CorridorActionCell
            onEdit={() => onEdit(row.original)}
            onToggleStatus={() =>
              onToggleStatus(row.original, row.original.status)
            }
            onDelete={() => onDelete(row.original)}
            status={row.original.status}
          />
        ),
      },
    ],
    [onEdit, onToggleStatus, onDelete]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Search corridors..."
      pageSize={10}
      showPagination={true}
      showSearch={true}
      loading={isLoading}
      emptyMessage="No corridors found"
    />
  );
};

export default CorridorsTable;
