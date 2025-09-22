import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/DataTable";
import { StatusBadge } from "./ui/StatusBadge";
import BeneficiaryActionCell from "./BeneficiaryActionCell";
import type { Beneficiary } from "../types/BeneficiariesTypes";

interface BeneficiariesTableProps {
  data: Beneficiary[];
  loading?: boolean;
  onEdit: (beneficiary: Beneficiary) => void;
  onDelete: (id: string, name: string) => void;
  onToggleStatus: (beneficiary: Beneficiary) => void;
  onView?: (beneficiary: Beneficiary) => void;
}

const BeneficiariesTable: React.FC<BeneficiariesTableProps> = ({
  data,
  loading = false,
  onEdit,
  onDelete,
  onToggleStatus,
  onView,
}) => {
  const columns: ColumnDef<Beneficiary>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">{row.original.name}</div>
          {row.original.email && (
            <div className="text-sm text-gray-500">{row.original.email}</div>
          )}
        </div>
      ),
    },
    // {
    //   accessorKey: "id_type",
    //   header: "ID Type",
    //   cell: ({ row }) => (
    //     <div>
    //       <div className="text-sm text-gray-900">{row.original.id_type}</div>
    //       <div className="text-sm text-gray-500">{row.original.id_number}</div>
    //     </div>
    //   ),
    // },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => row.original.phone || "N/A",
    },
    // {
    //   accessorKey: "bank_details",
    //   header: "Bank Details",
    //   cell: ({ row }) => (
    //     <div>
    //       {row.original.bank_name && (
    //         <div className="text-sm text-gray-900">
    //           {row.original.bank_name}
    //         </div>
    //       )}
    //       {row.original.bank_account_number && (
    //         <div className="text-xs text-gray-500">
    //           {row.original.bank_account_number}
    //         </div>
    //       )}
    //       {!row.original.bank_name && !row.original.bank_account_number && (
    //         <div className="text-sm text-gray-400">N/A</div>
    //       )}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "nationality",
      header: "Nationality",
      cell: ({ row }) => row.original.nationality?.name || "N/A",
    },
    {
      accessorKey: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.original.customer.full_name}
          </div>
          {row.original.customer.email && (
            <div className="text-sm text-gray-500">
              {row.original.customer.email}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge
          status={row.original.status ? "ACTIVE" : "INACTIVE"}
          type="status"
        />
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <BeneficiaryActionCell
          beneficiary={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      searchKey="name"
    />
  );
};

export default BeneficiariesTable;
