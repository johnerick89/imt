import React from "react";
import { DataTable } from "./ui/DataTable";
import type { Customer } from "../types/CustomersTypes";
import CustomerActionCell from "./CustomerActionCell";

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
        <div className="font-medium text-gray-900">
          {row.original.full_name}
        </div>
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
      accessorKey: "email",
      header: "Email",
      cell: ({ row }: { row: { original: Customer } }) => (
        <div className="text-gray-600">{row.original.email || "N/A"}</div>
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
        <div className="text-gray-900">{row.original.organisation.name}</div>
      ),
    },
    {
      accessorKey: "branch.name",
      header: "Branch",
      cell: ({ row }: { row: { original: Customer } }) => (
        <div className="text-gray-900">{row.original.branch.name}</div>
      ),
    },
    {
      accessorKey: "risk_rating",
      header: "Risk Rating",
      cell: ({ row }: { row: { original: Customer } }) => (
        <div
          className={`font-medium ${
            row.original.risk_rating >= 70
              ? "text-red-600"
              : row.original.risk_rating >= 40
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {row.original.risk_rating}
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
