import React, { useEffect, useState } from "react";
import {
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiInfo,
  FiAlertCircle,
} from "react-icons/fi";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  const getToastStyles = () => {
    const baseStyles =
      "relative flex items-start p-4 rounded-lg shadow-lg border-l-4 transition-all duration-300 ease-in-out transform";

    if (isLeaving) {
      return `${baseStyles} translate-x-full opacity-0`;
    }

    if (isVisible) {
      return `${baseStyles} translate-x-0 opacity-100`;
    }

    return `${baseStyles} translate-x-full opacity-0`;
  };

  const getTypeStyles = () => {
    switch (toast.type) {
      case "success":
        return "bg-green-50 border-green-400 text-green-800";
      case "error":
        return "bg-red-50 border-red-400 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-400 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-400 text-blue-800";
      default:
        return "bg-gray-50 border-gray-400 text-gray-800";
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <FiCheck className="h-5 w-5 text-green-500" />;
      case "error":
        return <FiX className="h-5 w-5 text-red-500" />;
      case "warning":
        return <FiAlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <FiInfo className="h-5 w-5 text-blue-500" />;
      default:
        return <FiAlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className={`${getToastStyles()} ${getTypeStyles()} max-w-sm w-full`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium">{toast.title}</h3>
          {toast.message && (
            <p className="mt-1 text-sm opacity-90">{toast.message}</p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={handleRemove}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors duration-200"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ToastComponent;
