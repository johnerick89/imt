import React from "react";
import { FiAlertTriangle, FiInfo, FiXCircle } from "react-icons/fi";

interface AlertCardProps {
  type: "ERROR" | "WARNING" | "INFO";
  message: string;
  count?: number;
  onDismiss?: () => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
  type,
  message,
  count,
  onDismiss,
}) => {
  const getAlertConfig = () => {
    switch (type) {
      case "ERROR":
        return {
          icon: <FiXCircle className="h-5 w-5" />,
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-800",
          iconColor: "text-red-500",
        };
      case "WARNING":
        return {
          icon: <FiAlertTriangle className="h-5 w-5" />,
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-800",
          iconColor: "text-yellow-500",
        };
      case "INFO":
        return {
          icon: <FiInfo className="h-5 w-5" />,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-800",
          iconColor: "text-blue-500",
        };
      default:
        return {
          icon: <FiInfo className="h-5 w-5" />,
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
          textColor: "text-gray-800",
          iconColor: "text-gray-500",
        };
    }
  };

  const config = getAlertConfig();

  return (
    <div
      className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 flex items-start`}
    >
      <div className={`${config.iconColor} mr-3 mt-0.5`}>{config.icon}</div>
      <div className="flex-1">
        <p className={`${config.textColor} text-sm font-medium`}>
          {message}
          {count && count > 1 && (
            <span className="ml-1 font-normal">({count} items)</span>
          )}
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className={`${config.iconColor} hover:opacity-75 transition-opacity`}
        >
          <FiXCircle className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

export default AlertCard;
