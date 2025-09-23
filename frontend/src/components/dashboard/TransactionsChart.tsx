import React, { useMemo } from "react";
import { Chart } from "react-charts";
import type { TransactionSummary } from "../../types/DashboardTypes";

interface TransactionsChartProps {
  data: TransactionSummary;
  height?: number;
}

const TransactionsChart: React.FC<TransactionsChartProps> = ({
  data,
  height = 300,
}) => {
  // Prepare data for the line chart
  const chartData = useMemo(() => {
    if (!data?.transactionTrend || data.transactionTrend.length === 0) {
      return [];
    }

    return [
      {
        label: "Transaction Count",
        data: data.transactionTrend.map((trend) => ({
          primary: new Date(trend.date),
          secondary: trend.count,
        })),
      },
      {
        label: "Transaction Value",
        data: data.transactionTrend.map((trend) => ({
          primary: new Date(trend.date),
          secondary: trend.value,
        })),
      },
    ];
  }, [data]);

  const primaryAxis = useMemo(
    () => ({
      getValue: (datum: { primary: Date }) => datum.primary,
      type: "time" as const,
      format: (date: Date) => {
        return new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
        }).format(date);
      },
    }),
    []
  );

  const secondaryAxes = useMemo(
    () => [
      {
        getValue: (datum: { secondary: number }) => datum.secondary,
        type: "linear" as const,
        format: (value: number) => {
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
          } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return value.toString();
        },
      },
    ],
    []
  );

  const getTooltip = (props: any) => {
    const { datum, series } = props;
    if (!datum) return null;

    const date = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(datum.primary);

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <div className="text-sm font-medium text-gray-900">{date}</div>
        <div className="text-sm text-gray-600">
          {series?.label}: {datum.secondary?.toLocaleString()}
        </div>
      </div>
    );
  };

  if (!data?.transactionTrend || data.transactionTrend.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-500 text-sm">
            No transaction data available
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Transaction Trends
        </h3>
        <p className="text-sm text-gray-600">
          Transaction count and value over time
        </p>
      </div>

      <div style={{ height }}>
        <Chart
          options={{
            data: chartData,
            primaryAxis,
            secondaryAxes,
            tooltip: {
              render: getTooltip,
            },
            getDatumStyle: (datum: { seriesLabel: string }) => {
              const colors = {
                "Transaction Count": "#3B82F6", // Blue
                "Transaction Value": "#10B981", // Green
              };

              return {
                color:
                  colors[datum.seriesLabel as keyof typeof colors] || "#3B82F6",
                opacity: 0.8,
              };
            },
            getSeriesStyle: (series: { label: string }) => {
              const colors = {
                "Transaction Count": "#3B82F6", // Blue
                "Transaction Value": "#10B981", // Green
              };

              return {
                color: colors[series.label as keyof typeof colors] || "#3B82F6",
                opacity: 0.8,
              };
            },
          }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 flex justify-center space-x-6">
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#3B82F6" }}
          />
          <span className="text-sm text-gray-700">Transaction Count</span>
        </div>
        <div className="flex items-center space-x-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#10B981" }}
          />
          <span className="text-sm text-gray-700">Transaction Value</span>
        </div>
      </div>
    </div>
  );
};

export default TransactionsChart;
