import React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/DataTable";
import { StatusBadge } from "./ui/StatusBadge";
import { Button } from "./ui/Button";
import { Tooltip } from "./ui/Tooltip";
import { formatToCurrency } from "../utils/textUtils";
import { ReceiptService } from "../services/ReceiptService";
import type { Transaction } from "../types/TransactionsTypes";
import {
  FiEye,
  FiEdit3,
  FiCheckCircle,
  FiXCircle,
  FiRotateCcw,
  FiClock,
  FiDownload,
} from "react-icons/fi";
import { usePermissions } from "../hooks/usePermissions";
interface TransactionsTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onView?: (transaction: Transaction) => void;
  onCancel?: (transaction: Transaction) => void;
  onReverse?: (transaction: Transaction) => void;
  onApprove?: (transaction: Transaction) => void;
  onUpdate?: (transaction: Transaction) => void;
  onMarkAsReady?: (transaction: Transaction) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  isLoading = false,
  onView,
  onCancel,
  onReverse,
  onApprove,
  onUpdate,
  onMarkAsReady,
}) => {
  const handleDownloadReceipt = async (transaction: Transaction) => {
    try {
      await ReceiptService.downloadReceipt(transaction);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      // You might want to show a toast notification here
    }
  };
  const {
    canApproveTransactions,
    canReverseTransactions,
    canCancelTransactions,
    canEditTransactions,
  } = usePermissions();
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
      header: "Beneficiary",
      cell: ({ row }) => {
        const beneficiary = row.original.beneficiary;
        return (
          <div>
            <div className="font-medium text-gray-900">
              {beneficiary?.name || "N/A"}
            </div>
            <div className="text-sm text-gray-500">
              {beneficiary?.bank_name || ""}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "destination_organisation",
      header: "Receiving Organisation",
      cell: ({ row }) => {
        const org = row.original.destination_organisation;
        return (
          <div>
            <div className="font-medium text-gray-900">
              {org?.name || "N/A"}
            </div>
            <div className="text-sm text-gray-500">{org?.type || ""}</div>
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
        // Only show actions for outbound transactions
        const isOutbound = transaction.direction === "OUTBOUND";

        const canCancel =
          isOutbound &&
          ["PENDING", "PENDING_APPROVAL", "READY"].includes(
            transaction.status
          ) &&
          transaction.remittance_status === "PENDING" &&
          canCancelTransactions();
        const canReverse =
          isOutbound &&
          transaction.status === "APPROVED" &&
          transaction.remittance_status === "PENDING" &&
          canReverseTransactions();
        const canApprove =
          isOutbound &&
          transaction.status === "READY" &&
          transaction.remittance_status === "READY" &&
          canApproveTransactions();
        const canUpdate =
          isOutbound &&
          ["PENDING", "PENDING_APPROVAL"].includes(transaction.status) &&
          transaction.remittance_status === "PENDING" &&
          canEditTransactions();
        const canMarkAsReady =
          isOutbound &&
          ["PENDING", "PENDING_APPROVAL"].includes(transaction.status) &&
          transaction.remittance_status === "PENDING" &&
          canEditTransactions();

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
            <Tooltip content="Download receipt">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadReceipt(transaction)}
                className="p-2"
              >
                <FiDownload className="h-4 w-4" />
              </Button>
            </Tooltip>
            {canUpdate && (
              <Tooltip content="Edit transaction">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onUpdate?.(transaction)}
                  className="p-2 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                >
                  <FiEdit3 className="h-4 w-4" />
                </Button>
              </Tooltip>
            )}
            {canMarkAsReady && (
              <Tooltip content="Mark as ready for approval">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => onMarkAsReady?.(transaction)}
                  className="p-2 bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600"
                >
                  <FiClock className="h-4 w-4" />
                </Button>
              </Tooltip>
            )}
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

export default TransactionsTable;
