import React, { useMemo } from "react";
import { Chart } from "react-charts";
import type { ChargesAndPayments } from "../../types/DashboardTypes";

interface ChargesChartProps {
  data: ChargesAndPayments;
  height?: number;
}

const ChargesChart: React.FC<ChargesChartProps> = ({ data, height = 300 }) => {
  console.log("charges chart data", data);
  // Prepare data for the pie chart
  const chartData = useMemo(() => {
    if (!data?.chargeBreakdown || data.chargeBreakdown.length === 0) {
      return [];
    }

    return [
      {
        label: "Charge Breakdown",
        data: data.chargeBreakdown.map((charge) => ({
          primary: charge.type,
          secondary: charge.amount,
          percentage: charge.percentage,
        })),
      },
    ];
  }, [data]);

  const primaryAxis = useMemo(
    () => ({
      getValue: (datum: { primary: string }) => datum.primary,
      type: "ordinal" as const,
    }),
    []
  );

  const secondaryAxes = useMemo(
    () => [
      {
        getValue: (datum: { secondary: number }) => datum.secondary,
        type: "linear" as const,
      },
    ],
    []
  );

  const getTooltip = (props: any) => {
    const { focusedDatum } = props;
    if (!focusedDatum) return null;

    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
        <div className="text-sm font-medium text-gray-900">
          {focusedDatum.primary}
        </div>
        <div className="text-sm text-gray-600">
          Amount: {focusedDatum.secondary?.toLocaleString()}
        </div>
        <div className="text-sm text-gray-600">
          Percentage: {focusedDatum.percentage?.toFixed(1)}%
        </div>
      </div>
    );
  };

  if (!data?.chargeBreakdown || data.chargeBreakdown.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200"
        style={{ height }}
      >
        <div className="text-center">
          <div className="text-gray-500 text-sm">No charge data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">Charge Breakdown</h3>
        <p className="text-sm text-gray-600">Distribution of charges by type</p>
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
            getDatumStyle: (datum: { index: number }) => {
              const colors = [
                "#3B82F6", // Blue
                "#EF4444", // Red
                "#10B981", // Green
                "#F59E0B", // Yellow
                "#8B5CF6", // Purple
                "#F97316", // Orange
                "#06B6D4", // Cyan
                "#84CC16", // Lime
              ];

              const colorIndex = datum.index % colors.length;
              return {
                color: colors[colorIndex],
                opacity: 0.8,
              };
            },
          }}
        />
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {data.chargeBreakdown.map((charge, index) => {
          const colors = [
            "#3B82F6",
            "#EF4444",
            "#10B981",
            "#F59E0B",
            "#8B5CF6",
            "#F97316",
            "#06B6D4",
            "#84CC16",
          ];
          const color = colors[index % colors.length];

          return (
            <div key={charge.type} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm text-gray-700">{charge.type}</span>
              <span className="text-sm text-gray-500">
                ({charge.percentage.toFixed(1)}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChargesChart;
