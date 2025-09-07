import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { StatusBadge } from "./StatusBadge";
import ChargeActionCell from "./ChargeActionCell";
import type { Charge } from "../types/ChargesTypes";

interface ChargesTableProps {
  data: Charge[];
  onEdit: (charge: Charge) => void;
  onToggleStatus: (charge: Charge) => void;
  onDelete: (charge: Charge) => void;
  isLoading?: boolean;
}

export default function ChargesTable({
  data,
  onEdit,
  onToggleStatus,
  onDelete,
  isLoading = false,
}: ChargesTableProps) {
  const columns: ColumnDef<Charge>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">
          {row.original.name}
        </span>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.type.replace("_", " ")}
        </span>
      ),
    },
    {
      accessorKey: "application_method",
      header: "Method",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.application_method}
        </span>
      ),
    },
    {
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.rate}
          {row.original.application_method === "PERCENTAGE" ? "%" : ""}
        </span>
      ),
    },
    {
      accessorKey: "direction",
      header: "Direction",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">{row.original.direction}</span>
      ),
    },
    {
      accessorKey: "currency",
      header: "Currency",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.currency?.currency_code || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "origin_organisation",
      header: "Origin Org",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.origin_organisation?.name || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "destination_organisation",
      header: "Destination Org",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.destination_organisation?.name || "N/A"}
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
    ChargeActionCell({
      onEdit,
      onToggleStatus,
      onDelete,
    }),
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      loading={isLoading}
    />
  );
}
