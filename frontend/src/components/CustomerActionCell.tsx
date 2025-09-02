import React from "react";
import { FiEdit, FiTrash2, FiEye } from "react-icons/fi";
import type { Customer } from "../types/CustomersTypes";

interface CustomerActionCellProps {
  customer: Customer;
  onView: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
}

const CustomerActionCell: React.FC<CustomerActionCellProps> = ({
  customer,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onView(customer)}
        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
        title="View customer"
      >
        <FiEye className="w-4 h-4" />
      </button>
      <button
        onClick={() => onEdit(customer)}
        className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-md transition-colors"
        title="Edit customer"
      >
        <FiEdit className="w-4 h-4" />
      </button>
      <button
        onClick={() => onDelete(customer)}
        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
        title="Delete customer"
      >
        <FiTrash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CustomerActionCell;
