import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "status" | "role" | "organisation-type" | "gl-account-type";
  title?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "status",
  title,
}) => {
  const getStatusClasses = () => {
    switch (type) {
      case "status": {
        const statusClasses = {
          ACTIVE: "bg-green-100 text-green-800",
          INACTIVE: "bg-gray-100 text-gray-800",
          PENDING: "bg-yellow-100 text-yellow-800",
          BLOCKED: "bg-red-100 text-red-800",
          OPEN: "bg-green-100 text-green-800",
          CLOSED: "bg-gray-100 text-gray-800",
          POSTED: "bg-green-100 text-green-800",
          FAILED: "bg-red-100 text-red-800",
          APPROVED: "bg-blue-100 text-blue-800",
          PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
          REJECTED: "bg-red-100 text-red-800",
          CANCELLED: "bg-gray-100 text-gray-800",
          COMPLETED: "bg-green-100 text-green-800",
          PROCESSING: "bg-yellow-100 text-yellow-800",
          SUCCESS: "bg-green-100 text-green-800",
          REVERSED: "bg-orange-100 text-orange-800",
        };
        return (
          statusClasses[status as keyof typeof statusClasses] ||
          "bg-gray-100 text-gray-800"
        );
      }

      case "role": {
        const roleClasses = {
          ADMIN: "bg-purple-100 text-purple-800",
          USER: "bg-blue-100 text-blue-800",
          MANAGER: "bg-indigo-100 text-indigo-800",
          SYSTEM: "bg-gray-100 text-gray-800",
        };
        return (
          roleClasses[status as keyof typeof roleClasses] ||
          "bg-gray-100 text-gray-800"
        );
      }

      case "organisation-type": {
        const orgTypeClasses = {
          PARTNER: "bg-blue-100 text-blue-800",
          AGENCY: "bg-purple-100 text-purple-800",
          CUSTOMER: "bg-orange-100 text-orange-800",
        };
        return (
          orgTypeClasses[status as keyof typeof orgTypeClasses] ||
          "bg-gray-100 text-gray-800"
        );
      }
      case "gl-account-type": {
        const glAccountTypeClasses = {
          ASSET: "bg-green-100 text-green-800",
          LIABILITY: "bg-red-100 text-red-800",
          EQUITY: "bg-blue-100 text-blue-800",
          REVENUE: "bg-purple-100 text-purple-800",
          EXPENSE: "bg-gray-100 text-gray-800",
        };

        return (
          glAccountTypeClasses[status as keyof typeof glAccountTypeClasses] ||
          "bg-gray-100 text-gray-800"
        );
      }
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses()}`}
      title={title}
    >
      {status}
    </span>
  );
};
