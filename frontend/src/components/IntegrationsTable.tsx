import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/DataTable";
import { StatusBadge } from "./ui/StatusBadge";
import IntegrationActionCell from "./IntegrationActionCell";
import type { Integration } from "../types/IntegrationsTypes";

interface IntegrationsTableProps {
  data: Integration[];
  onEdit: (integration: Integration) => void;
  onToggleStatus: (id: string, currentStatus: string) => void;
  onDelete: (id: string, name: string) => void;
  isLoading?: boolean;
}

const IntegrationsTable: React.FC<IntegrationsTableProps> = ({
  data,
  onEdit,
  onToggleStatus,
  onDelete,
  isLoading = false,
}) => {
  const columns = useMemo<ColumnDef<Integration>[]>(
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
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {row.original.type}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: "endpoint_url",
        header: "Endpoint",
        cell: ({ row }) => (
          <span className="text-sm text-gray-900">
            {row.original.endpoint_url || "N/A"}
          </span>
        ),
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
          <IntegrationActionCell
            onEdit={() => onEdit(row.original)}
            onToggleStatus={() =>
              onToggleStatus(row.original.id, row.original.status)
            }
            onDelete={() => onDelete(row.original.id, row.original.name)}
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
      searchPlaceholder="Search integrations..."
      pageSize={10}
      showPagination={true}
      showSearch={true}
      loading={isLoading}
      emptyMessage="No integrations found"
    />
  );
};

export default IntegrationsTable;
