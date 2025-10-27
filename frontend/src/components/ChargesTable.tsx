import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/DataTable";
import { StatusBadge } from "./ui/StatusBadge";
import ChargeActionCell from "./ChargeActionCell";
import type { Charge } from "../types/ChargesTypes";

interface ChargesTableProps {
  data: Charge[];
  onEdit: (charge: Charge) => void;
  onToggleStatus: (charge: Charge) => void;
  onDelete: (charge: Charge) => void;
  isLoading?: boolean;
  standard?: boolean;
}

export default function ChargesTable({
  data,
  onEdit,
  onToggleStatus,
  onDelete,
  isLoading = false,
  standard = false,
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
      accessorKey: "rate",
      header: "Rate",
      cell: ({ row }) => (
        <div className="flex flex-col items-left space-x-2">
          <span className="text-sm text-gray-900">
            {row.original.application_method}
          </span>
          <span className="text-sm text-gray-900 text-left font-bold">
            {row.original.rate}
            {row.original.application_method === "PERCENTAGE" ? "%" : ""}
          </span>
        </div>
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
    ...(!standard
      ? [
          {
            accessorKey: "origin_organisation",
            header: "Origin Org",
            cell: ({ row }: { row: { original: Charge } }) => (
              <span className="text-sm text-gray-900">
                {row.original.origin_organisation?.name || "N/A"}
              </span>
            ),
          },
        ]
      : []),
    ...(!standard
      ? [
          {
            accessorKey: "destination_organisation",
            header: "Destination Org",
            cell: ({ row }: { row: { original: Charge } }) => (
              <span className="text-sm text-gray-900">
                {row.original.destination_organisation?.name || "N/A"}
              </span>
            ),
          },
        ]
      : []),
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },
    {
      accessorKey: "minimum_amount",
      header: "Minimum Amount",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">{row.original.min_amount}</span>
      ),
    },
    {
      accessorKey: "maximum_amount",
      header: "Maximum Amount",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">{row.original.max_amount}</span>
      ),
    },
    {
      accessorKey: "internal_share_percentage",
      header: "Internal Share %",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.internal_share_percentage}
        </span>
      ),
    },
    {
      accessorKey: "origin_share_percentage",
      header: "Origin Share %",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.origin_share_percentage}
        </span>
      ),
    },
    {
      accessorKey: "destination_share_percentage",
      header: "Destination Share %",
      cell: ({ row }) => (
        <span className="text-sm text-gray-900">
          {row.original.destination_share_percentage}
        </span>
      ),
    },
    ChargeActionCell({
      standard,
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
