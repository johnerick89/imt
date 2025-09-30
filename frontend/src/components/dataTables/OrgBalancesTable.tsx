import React from "react";
import { FiPlus } from "react-icons/fi";
import { Button } from "../ui/Button";
import { DataTable } from "../ui/DataTable";
import { formatToCurrency } from "../../utils/textUtils";
import type { OrgBalance } from "../../types/BalanceOperationsTypes";
import type { ColumnDef } from "@tanstack/react-table";

interface OrgBalancesTableProps {
  data: OrgBalance[];
  loading: boolean;
  onPrefund: (orgId: string) => void;
}

const OrgBalancesTable: React.FC<OrgBalancesTableProps> = ({
  data,
  loading,
  onPrefund,
}) => {
  // Table columns
  const columns: ColumnDef<OrgBalance>[] = [
    {
      accessorKey: "base_org",
      header: "Base Organisation",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.original.base_org.name}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.base_org.type}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "dest_org",
      header: "Destination Organisation",
      cell: ({ row }) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.original.dest_org.name}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.dest_org.type}
          </div>
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
                " " +
                row.original.currency.currency_code}
            </div>
          )}
        </div>
      ),
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
          <Button
            onClick={() => onPrefund(row.original.dest_org_id)}
            size="sm"
            variant="outline"
            className="text-green-600 hover:text-green-700"
          >
            <FiPlus className="h-4 w-4 mr-1" />
            Prefund
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow">
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No organisation balances found"
      />
    </div>
  );
};

export default OrgBalancesTable;
