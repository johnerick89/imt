import React from "react";
import { FiPlus, FiUsers } from "react-icons/fi";
import type { Customer } from "../types/CustomersTypes";
import { Button } from "./ui/Button";
import { Tooltip } from "./ui/Tooltip";

interface BeneficiaryCellProps {
  customer: Customer;
  onAddBeneficiary: (customer: Customer) => void;
}

const BeneficiaryCell: React.FC<BeneficiaryCellProps> = ({
  customer,
  onAddBeneficiary,
}) => {
  const beneficiaryCount = customer.beneficiaries?.length || 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-sm text-gray-600">
        <FiUsers className="w-4 h-4" />
        <span className="font-medium">{beneficiaryCount}</span>
        <span className="text-xs text-gray-500">
          {beneficiaryCount === 1 ? "beneficiary" : "beneficiaries"}
        </span>
      </div>
      <Tooltip content="Add Beneficiary">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddBeneficiary(customer)}
          className="flex items-center gap-1 whitespace-nowrap"
        >
          <FiPlus className="w-3 h-3 text-gray-600" />
        </Button>
      </Tooltip>
    </div>
  );
};

export default BeneficiaryCell;
