import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/DataTable";
import { StatusBadge } from "./ui/StatusBadge";
import { formatToCurrency } from "../utils/textUtils";
import type { GlTransaction } from "../types/GlTransactionsTypes";

interface GlTransactionsTableProps {
  data: GlTransaction[];
  onView?: (transaction: GlTransaction) => void;
  onReverse?: (transaction: GlTransaction) => void;
  isLoading?: boolean;
}

const GlTransactionsTable: React.FC<GlTransactionsTableProps> = ({
  data,
  onView,
  onReverse,
  isLoading = false,
}) => {
  const columns = useMemo<ColumnDef<GlTransaction>[]>(
    () => [
      {
        accessorKey: "transaction_type",
        header: "Transaction Type",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">
              {row.original.transaction_type.replace(/_/g, " ")}
            </div>
            <div className="text-sm text-gray-500">
              {row.original.description}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <StatusBadge status={row.original.status} type="status" />
        ),
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            <div className="font-medium">
              {formatToCurrency(row.original.amount) +
                " " +
                (row.original.currency?.currency_code || "N/A")}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "entity",
        header: "Entity",
        cell: ({ row }) => {
          const transaction = row.original;
          if (transaction.vault) {
            return (
              <div>
                <div className="font-medium text-gray-900">Vault</div>
                <div className="text-sm text-gray-500">
                  {transaction.vault.name}
                </div>
              </div>
            );
          }
          if (transaction.user_till) {
            return (
              <div>
                <div className="font-medium text-gray-900">Till</div>
                <div className="text-sm text-gray-500">
                  {transaction.user_till.till.name} -{" "}
                  {transaction.user_till.user.first_name}{" "}
                  {transaction.user_till.user.last_name}
                </div>
              </div>
            );
          }
          if (transaction.customer) {
            return (
              <div>
                <div className="font-medium text-gray-900">Customer</div>
                <div className="text-sm text-gray-500">
                  {transaction.customer.first_name}{" "}
                  {transaction.customer.last_name}
                </div>
              </div>
            );
          }
          if (transaction.transaction) {
            return (
              <div>
                <div className="font-medium text-gray-900">Transaction</div>
                <div className="text-sm text-gray-500">
                  {transaction.transaction.reference}
                </div>
              </div>
            );
          }
          return <span className="text-gray-400">-</span>;
        },
      },
      {
        accessorKey: "gl_entries",
        header: "GL Entries",
        cell: ({ row }) => {
          const entries = row.original.gl_entries || [];
          const drTotal = entries
            .filter((e) => e.dr_cr === "DR")
            .reduce((sum, e) => sum + e.amount, 0);
          const crTotal = entries
            .filter((e) => e.dr_cr === "CR")
            .reduce((sum, e) => sum + e.amount, 0);

          return (
            <div className="text-sm text-gray-900">
              <div>DR: {formatToCurrency(drTotal)}</div>
              <div>CR: {formatToCurrency(crTotal)}</div>
              <div className="text-xs text-gray-500">
                {entries.length} entries
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "created_by_user",
        header: "Created By",
        cell: ({ row }) => {
          const user = row.original.created_by_user;
          return user ? (
            <div className="text-sm text-gray-900">
              {user.first_name} {user.last_name}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {new Date(row.original.created_at).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex items-center space-x-2">
            {onView && (
              <button
                onClick={() => onView(row.original)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View details"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            )}
            {onReverse &&
              row.original.status === "POSTED" &&
              !row.original.transaction_type.includes("REVERSAL") && (
                <button
                  onClick={() => onReverse(row.original)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Reverse transaction"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              )}
          </div>
        ),
      },
    ],
    [onView, onReverse]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={isLoading}
      emptyMessage="No GL transactions found"
    />
  );
};

export default GlTransactionsTable;
