import React from "react";

interface StatusBadgeProps {
  status: string;
  type?: "status" | "role" | "organisation-type";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = "status",
}) => {
  const getStatusClasses = () => {
    switch (type) {
      case "status": {
        const statusClasses = {
          ACTIVE: "bg-green-100 text-green-800",
          INACTIVE: "bg-gray-100 text-gray-800",
          PENDING: "bg-yellow-100 text-yellow-800",
          BLOCKED: "bg-red-100 text-red-800",
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
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <span
      className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClasses()}`}
    >
      {status}
    </span>
  );
};
