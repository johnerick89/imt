import React, { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./ui/DataTable";
import { StatusBadge } from "./ui/StatusBadge";
import ExchangeRateActionCell from "./ExchangeRateActionCell";
import type { ExchangeRate } from "../types/ExchangeRatesTypes";
import { formatToCurrency } from "../utils/textUtils";

interface ExchangeRatesTableProps {
  data: ExchangeRate[];
  isLoading?: boolean;
  onView: (exchangeRate: ExchangeRate) => void;
  onEdit: (exchangeRate: ExchangeRate) => void;
  onDelete: (exchangeRate: ExchangeRate) => void;
  onApprove: (exchangeRate: ExchangeRate) => void;
  onReject: (exchangeRate: ExchangeRate) => void;
}

const ExchangeRatesTable: React.FC<ExchangeRatesTableProps> = ({
  data,
  isLoading = false,
  onView,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) => {
  const columns = useMemo<ColumnDef<ExchangeRate>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Exchange Rate",
        cell: ({ row }) => (
          <div>
            <div className="font-medium text-gray-900">
              {row.original.name || "Unnamed Rate"}
            </div>
            <div className="text-sm text-gray-500">
              {row.original.from_currency?.currency_code} →{" "}
              {row.original.to_currency?.currency_code}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "rates",
        header: "Rates",
        cell: ({ row }) => (
          <div className="text-sm">
            <div>Buy: {formatToCurrency(row.original.buy_rate)}</div>
            <div>Sell: {formatToCurrency(row.original.sell_rate)}</div>
            <div className="font-medium">
              Rate: {formatToCurrency(row.original.exchange_rate)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: "route",
        header: "Route",
        cell: ({ row }) => {
          const originCountry = row.original.origin_country;
          const destCountry = row.original.destination_country;
          return originCountry && destCountry
            ? `${originCountry.name} → ${destCountry.name}`
            : "-";
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <div className="space-y-1">
            <StatusBadge status={row.original.status} type="status" />
            <div className="text-xs">
              <StatusBadge
                status={row.original.operator_status}
                type="status"
              />
            </div>
          </div>
        ),
      },
      {
        accessorKey: "validity",
        header: "Valid Period",
        cell: ({ row }) => {
          const dateFrom = row.original.date_from;
          const dateTo = row.original.date_to;

          if (!dateFrom && !dateTo) return "-";

          const fromStr = dateFrom
            ? new Date(dateFrom).toLocaleDateString()
            : "∞";
          const toStr = dateTo
            ? new Date(dateTo).toLocaleDateString()
            : "No expiry";

          return (
            <div className="text-sm">
              <div>From: {fromStr}</div>
              <div>To: {toStr}</div>
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => (
          <div className="text-sm">
            <div>{new Date(row.original.created_at).toLocaleDateString()}</div>
            {row.original.created_by_user && (
              <div className="text-xs text-gray-500">
                {row.original.created_by_user.first_name}{" "}
                {row.original.created_by_user.last_name}
              </div>
            )}
          </div>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <ExchangeRateActionCell
            exchangeRate={row.original}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onApprove={onApprove}
            onReject={onReject}
          />
        ),
      },
    ],
    [onView, onEdit, onDelete, onApprove, onReject]
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={isLoading}
      emptyMessage="No exchange rates found"
    />
  );
};

export default ExchangeRatesTable;
