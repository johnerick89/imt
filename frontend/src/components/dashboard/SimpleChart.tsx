import React from "react";

interface SimpleChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  type: "line" | "bar" | "pie";
  title?: string;
  height?: number;
}

const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  type,
  title,
  height = 200,
}) => {
  const maxValue = Math.max(...data.map((item) => item.value));

  const renderLineChart = () => {
    if (data.length < 2) return null;

    const points = data
      .map((item, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = 100 - (item.value / maxValue) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="w-full h-full">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polyline
            fill="none"
            stroke="#3B82F6"
            strokeWidth="0.5"
            points={points}
          />
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (item.value / maxValue) * 100;
            return <circle key={index} cx={x} cy={y} r="1" fill="#3B82F6" />;
          })}
        </svg>
      </div>
    );
  };

  const renderBarChart = () => {
    return (
      <div className="w-full h-full flex items-end justify-between px-2">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          return (
            <div key={index} className="flex flex-col items-center flex-1 mx-1">
              <div
                className="w-full bg-blue-500 rounded-t"
                style={{ height: `${height}%` }}
              />
              <div className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                {item.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderPieChart = () => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let cumulativePercentage = 0;

    return (
      <div className="w-full h-full flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;

            cumulativePercentage += percentage;

            const radius = 40;
            const centerX = 50;
            const centerY = 50;

            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);

            const largeArcFlag = percentage > 50 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              "Z",
            ].join(" ");

            const colors = [
              "#3B82F6",
              "#10B981",
              "#F59E0B",
              "#EF4444",
              "#8B5CF6",
            ];
            const color = item.color || colors[index % colors.length];

            return (
              <path
                key={index}
                d={pathData}
                fill={color}
                stroke="white"
                strokeWidth="0.5"
              />
            );
          })}
        </svg>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return renderLineChart();
      case "bar":
        return renderBarChart();
      case "pie":
        return renderPieChart();
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div style={{ height: `${height}px` }}>{renderChart()}</div>
      {type === "pie" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {data.map((item, index) => {
            const colors = [
              "#3B82F6",
              "#10B981",
              "#F59E0B",
              "#EF4444",
              "#8B5CF6",
            ];
            const color = item.color || colors[index % colors.length];
            return (
              <div key={index} className="flex items-center text-sm">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-600">{item.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SimpleChart;
