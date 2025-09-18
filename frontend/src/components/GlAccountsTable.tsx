import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/DataTable";
import { StatusBadge } from "./ui/StatusBadge";
import GlAccountActionCell from "./GlAccountActionCell";
import { formatToCurrency } from "../utils/textUtils";
import type { GlAccount } from "../types/GlAccountsTypes";

interface GlAccountsTableProps {
  data: GlAccount[];
  onView?: (glAccount: GlAccount) => void;
  onFreeze?: (glAccount: GlAccount) => void;
  onUnfreeze?: (glAccount: GlAccount) => void;
  isLoading?: boolean;
}

const GlAccountsTable: React.FC<GlAccountsTableProps> = ({
  data,
  onView,
  onFreeze,
  onUnfreeze,
  isLoading = false,
}) => {
  const columns = useMemo<ColumnDef<GlAccount>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Account Details",
        cell: ({ row }) => (
          <button
            onClick={() => onView?.(row.original)}
            className="text-left w-full p-2 rounded-lg hover:bg-gray-50 transition-colors"
            title="View details"
          >
            <div className="font-medium text-gray-900">{row.original.name}</div>
            <div className="text-sm text-gray-500">{row.original.type}</div>
          </button>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => {
          const type = row.original.type;

          return <StatusBadge status={type} type={"gl-account-type"} />;
        },
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            <div className="font-medium">
              {formatToCurrency(row.original.balance || 0) +
                " " +
                (row.original.currency?.currency_code || "N/A")}
            </div>
            {row.original.locked_balance && row.original.locked_balance > 0 && (
              <div className="text-xs text-gray-500">
                Locked:{" "}
                {formatToCurrency(row.original.locked_balance) +
                  " " +
                  (row.original.currency?.currency_code || "N/A")}
              </div>
            )}
          </div>
        ),
      },
      {
        accessorKey: "currency",
        header: "Currency",
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            {row.original.currency?.currency_code || "N/A"}
          </div>
        ),
      },
      {
        accessorKey: "organisation",
        header: "Organisation",
        cell: ({ row }) => {
          const org = row.original.organisation;
          return org ? (
            <div>
              <div className="font-medium text-gray-900">{org.name}</div>
              <div className="text-sm text-gray-500">{org.type}</div>
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          );
        },
      },
      {
        accessorKey: "bank_account",
        header: "Bank Account",
        cell: ({ row }) => {
          const bankAccount = row.original.bank_account;
          return bankAccount ? (
            <div>
              <div className="font-medium text-gray-900">
                {bankAccount.name}
              </div>
              <div className="text-sm text-gray-500">
                {bankAccount.account_number}
              </div>
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          if (row.original.closed_at) {
            return (
              <StatusBadge
                status="CLOSED"
                type="status"
                title={row.original.close_reason || "Account closed"}
              />
            );
          }
          if (row.original.frozen_at) {
            return (
              <StatusBadge
                type="status"
                status="INACTIVE"
                title={row.original.frozen_reason || "Account frozen"}
              />
            );
          }
          return <StatusBadge status="ACTIVE" type="status" />;
        },
      },
      {
        accessorKey: "opened_by_user",
        header: "Opened By",
        cell: ({ row }) => {
          const user = row.original.opened_by_user;
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
          <GlAccountActionCell
            glAccount={row.original}
            onView={onView}
            onFreeze={onFreeze}
            onUnfreeze={onUnfreeze}
          />
        ),
      },
    ],
    [onView, onFreeze, onUnfreeze]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={isLoading}
      emptyMessage="No GL accounts found"
    />
  );
};

export default GlAccountsTable;
