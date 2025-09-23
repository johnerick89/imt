import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/DataTable";
import { StatusBadge } from "./ui/StatusBadge";
import { Button } from "./ui/Button";
import { Tooltip } from "./ui/Tooltip";
import { formatToCurrency } from "../utils/textUtils";
import { FiEye, FiCheckCircle, FiRotateCcw, FiXCircle } from "react-icons/fi";
import type { Transaction } from "../types/TransactionsTypes";

interface InboundTransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onView?: (transaction: Transaction) => void;
  onApprove?: (transaction: Transaction) => void;
  onReverse?: (transaction: Transaction) => void;
  onCancel?: (transaction: Transaction) => void;
}

export const InboundTransactionsTable: React.FC<
  InboundTransactionsTableProps
> = ({
  transactions,
  isLoading = false,
  onView,
  onApprove,
  onReverse,
  onCancel,
}) => {
  const getCounterPartyEmail = (metadata: Record<string, unknown>) => {
    return metadata.email as string;
  };

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "transaction_no",
      header: "Transaction #",
      cell: ({ row }) => (
        <button
          onClick={() => onView?.(row.original)}
          className="text-left w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <div className="font-medium text-gray-900">
            {row.original.transaction_no || "N/A"}
          </div>
        </button>
      ),
    },
    {
      accessorKey: "customer",
      header: "Sender",
      cell: ({ row }) => {
        const customer = row.original.sender_trasaction_party;
        return (
          <div>
            <div className="font-medium text-gray-900">
              {customer ? `${customer.name}` : "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              {getCounterPartyEmail(customer?.metadata || {})}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "beneficiary",
      header: " Receiver",
      cell: ({ row }) => {
        const beneficiary = row.original.receiver_trasaction_party;
        return (
          <div>
            <div className="font-medium text-gray-900">
              {beneficiary ? `${beneficiary.name}` : "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              {getCounterPartyEmail(beneficiary?.metadata || {})}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "origin_organisation",
      header: "Origin Organisation",
      cell: ({ row }) => {
        const org = row.original.origin_organisation;
        return (
          <div>
            <div className="font-medium text-gray-900">
              {org?.name || "N/A"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "origin_amount",
      header: "Amount to Transfer (Origin Currency)",
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
      accessorKey: "total_charges",
      header: "Total Charges",
      cell: ({ row }) => {
        const charges = row.original.transaction_charges || [];

        return (
          <div className="text-right">
            <div className="font-medium text-gray-900">
              {formatToCurrency(row.original.total_all_charges || 0)}
            </div>
            <div className="text-sm text-gray-500">
              {charges.length} charge{charges.length !== 1 ? "s" : ""}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "amount_payable",
      header: "Amount Payable",
      cell: ({ row }) => (
        <div className="text-right">
          <div className="font-medium text-gray-900">
            {formatToCurrency(row.original.amount_payable || 0)}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.origin_currency?.currency_code || ""}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "dest_amount",
      header: "Amount to Transfer (Destination Currency)",
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="space-y-1">
          <StatusBadge
            status={row.original.status}
            type={"status"}
            title="Transaction Status"
          />
        </div>
      ),
    },
    {
      accessorKey: "remittance_status",
      header: "Remittance Status",
      cell: ({ row }) => (
        <div className="space-y-1">
          <StatusBadge
            status={row.original.remittance_status}
            type={"status"}
            title="Remittance Status"
          />
        </div>
      ),
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
        const canApprove = transaction.status === "PENDING_APPROVAL";
        const canReverse = transaction.status === "APPROVED";
        const canCancel = ["PENDING", "PENDING_APPROVAL"].includes(
          transaction.status
        );

        return (
          <div className="flex items-center space-x-1">
            <Tooltip content="View transaction details">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView?.(transaction)}
                className="p-2"
              >
                <FiEye className="h-4 w-4" />
              </Button>
            </Tooltip>
            {canApprove && (
              <Tooltip content="Approve transaction">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onApprove?.(transaction)}
                  className="p-2 bg-green-600 hover:bg-green-700 text-white border-green-600"
                >
                  <FiCheckCircle className="h-4 w-4" />
                </Button>
              </Tooltip>
            )}
            {canCancel && (
              <Tooltip content="Cancel transaction">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onCancel?.(transaction)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  <FiXCircle className="h-4 w-4" />
                </Button>
              </Tooltip>
            )}
            {canReverse && (
              <Tooltip content="Reverse transaction">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onReverse?.(transaction)}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  <FiRotateCcw className="h-4 w-4" />
                </Button>
              </Tooltip>
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
