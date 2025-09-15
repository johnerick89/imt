import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/DataTable";
import { StatusBadge } from "./ui/StatusBadge";
import { Button } from "./ui/Button";
import { formatToCurrency } from "../utils/textUtils";
import type { Transaction } from "../types/TransactionsTypes";

interface InboundTransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onView?: (transaction: Transaction) => void;
  onApprove?: (transaction: Transaction) => void;
  onReverse?: (transaction: Transaction) => void;
}

export const InboundTransactionsTable: React.FC<
  InboundTransactionsTableProps
> = ({ transactions, isLoading = false, onView, onApprove, onReverse }) => {
  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "transaction_no",
      header: "Transaction #",
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">
          {row.original.transaction_no || "N/A"}
        </div>
      ),
    },
    {
      accessorKey: "customer",
      header: "Customer (Sender)",
      cell: ({ row }) => {
        const customer = row.original.customer;
        return (
          <div>
            <div className="font-medium text-gray-900">
              {customer ? `${customer.full_name}` : "N/A"}
            </div>
            <div className="text-sm text-gray-500">{customer?.email || ""}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "beneficiary",
      header: "Beneficiary (Receiver)",
      cell: ({ row }) => {
        const beneficiary = row.original.beneficiary;
        return (
          <div>
            <div className="font-medium text-gray-900">
              {beneficiary ? `${beneficiary.name}` : "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              {beneficiary?.email || ""}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "origin_amount",
      header: "Origin Amount",
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium text-gray-900">
            {formatToCurrency(row.original.origin_amount)}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.origin_currency?.currency_code || ""}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "dest_amount",
      header: "Destination Amount",
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium text-gray-900">
            {formatToCurrency(row.original.dest_amount)}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.dest_currency?.currency_code || ""}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total_charges",
      header: "Total Charges",
      cell: ({ row }) => {
        const charges = row.original.transaction_charges || [];
        const totalCharges = charges.reduce(
          (sum, charge) => sum + charge.amount,
          0
        );
        return (
          <div className="text-right">
            <div className="font-medium text-gray-900">
              {formatToCurrency(totalCharges)}
            </div>
            <div className="text-sm text-gray-500">
              {charges.length} charge{charges.length !== 1 ? "s" : ""}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="space-y-1">
          <StatusBadge
            status={row.original.status}
            type={"status"}
            title="Transaction Status"
          />
          <StatusBadge
            status={row.original.remittance_status}
            type={"status"}
            title="Remittance Status"
          />
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => (
        <div className="text-sm text-gray-500">
          {row.original.created_at
            ? new Date(row.original.created_at).toLocaleDateString()
            : "N/A"}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const transaction = row.original;
        const canApprove =
          transaction.status === "PENDING_APPROVAL" &&
          transaction.remittance_status === "PENDING";
        const canReverse =
          transaction.status === "APPROVED" &&
          transaction.remittance_status === "PENDING";

        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(transaction)}
            >
              View
            </Button>
            {canApprove && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onApprove?.(transaction)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Approve
              </Button>
            )}
            {canReverse && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onReverse?.(transaction)}
              >
                Reverse
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={transactions}
      loading={isLoading}
      searchKey="transaction_no"
    />
  );
};

export default InboundTransactionsTable;
