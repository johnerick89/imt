import React from "react";
import { DataTable } from "./ui/DataTable";
import type { Customer } from "../types/CustomersTypes";
import CustomerActionCell from "./CustomerActionCell";
import { StatusBadge } from "./ui/StatusBadge";

interface CustomersTableProps {
  customers: Customer[];
  isLoading?: boolean;
  searchKey?: string;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomersTable: React.FC<CustomersTableProps> = ({
  customers,
  isLoading = false,
  searchKey = "full_name",
  onView,
  onEdit,
  onDelete,
}) => {
  console.log("customers", customers);
  const columns = [
    {
      accessorKey: "full_name",
      header: "Full Name",
      cell: ({ row }: { row: { original: Customer } }) => (
        <button
          onClick={() => onView(row.original)}
          className="text-left w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col items-left gap-2">
            <div className="font-medium text-blue-600 hover:text-blue-800">
              {row.original.full_name}
            </div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        </button>
      ),
    },
    {
      accessorKey: "customer_type",
      header: "Type",
      cell: ({ row }: { row: { original: Customer } }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {row.original.customer_type}
        </span>
      ),
    },
    {
      accessorKey: "phone_number",
      header: "Phone",
      cell: ({ row }: { row: { original: Customer } }) => (
        <div className="text-gray-600">
          {row.original.phone_number || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "organisation.name",
      header: "Organisation",
      cell: ({ row }: { row: { original: Customer } }) => (
        <div className="text-gray-900">{row.original?.organisation?.name}</div>
      ),
    },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: { row: { original: Customer } }) => (
        <StatusBadge
          status={row.original.status ? "ACTIVE" : "INACTIVE"}
          type="status"
        />
      ),
    },
    {
      accessorKey: "nationality",
      header: "Nationality",
      cell: ({ row }: { row: { original: Customer } }) => (
        <div className="text-gray-600">
          {row.original.nationality?.name || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "residence_country",
      header: "Residence Country",
      cell: ({ row }: { row: { original: Customer } }) => (
        <div className="text-gray-600">
          {row.original.residence_country?.name || "N/A"}
        </div>
      ),
    },

    {
      accessorKey: "registration_date",
      header: "Registration Date",
      cell: ({ row }: { row: { original: Customer } }) => (
        <div className="text-gray-600">
          {new Date(row.original.registration_date).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: Customer } }) => (
        <CustomerActionCell
          customer={row.original}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ),
      enableSorting: false,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={customers}
      searchKey={searchKey}
      loading={isLoading}
    />
  );
};

export default CustomersTable;
