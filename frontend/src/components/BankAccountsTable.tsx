import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/DataTable";
import BankAccountActionCell from "./BankAccountActionCell";
import { formatToCurrency } from "../utils/textUtils";
import type { BankAccount } from "../types/BankAccountsTypes";

interface BankAccountsTableProps {
  data: BankAccount[];
  onView?: (bankAccount: BankAccount) => void;
  onEdit?: (bankAccount: BankAccount) => void;
  onDelete?: (bankAccount: BankAccount) => void;
  onTopup?: (bankAccount: BankAccount) => void;
  onWithdraw?: (bankAccount: BankAccount) => void;
  isLoading?: boolean;
}

const BankAccountsTable: React.FC<BankAccountsTableProps> = ({
  data,
  onView,
  onEdit,
  onDelete,
  onTopup,
  onWithdraw,
  isLoading = false,
}) => {
  const columns = useMemo<ColumnDef<BankAccount>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Account Details",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">{row.original.name}</div>
            <div className="text-sm text-gray-500">
              {row.original.account_number}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "bank_name",
        header: "Bank",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">
              {row.original.bank_name}
            </div>
            {row.original.swift_code && (
              <div className="text-sm text-gray-500">
                SWIFT: {row.original.swift_code}
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
            {row.original.currency.currency_code}
          </div>
        ),
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => (
          <div className="text-sm text-gray-900">
            <div className="font-medium">
              {formatToCurrency(row.original.balance) +
                " " +
                row.original.currency.currency_code}
            </div>
            {row.original.locked_balance && row.original.locked_balance > 0 && (
              <div className="text-xs text-gray-500">
                Locked:{" "}
                {formatToCurrency(row.original.locked_balance) +
                  +" " +
                  row.original.currency.currency_code}
              </div>
            )}
          </div>
        ),
      },
      // {
      //   accessorKey: "organisation",
      //   header: "Organisation",
      //   cell: ({ row }) => {
      //     const org = row.original.organisation;
      //     return org ? (
      //       <div>
      //         <div className="font-medium text-gray-900">{org.name}</div>
      //         <div className="text-sm text-gray-500">{org.type}</div>
      //       </div>
      //     ) : (
      //       <span className="text-gray-400">-</span>
      //     );
      //   },
      // },
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
          <BankAccountActionCell
            bankAccount={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onTopup={onTopup}
            onWithdraw={onWithdraw}
          />
        ),
      },
    ],
    [onView, onEdit, onDelete, onTopup, onWithdraw]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={isLoading}
      emptyMessage="No bank accounts found"
    />
  );
};

export default BankAccountsTable;
