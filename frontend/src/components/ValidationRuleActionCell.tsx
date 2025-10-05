import React from "react";
import { FiEye } from "react-icons/fi";
import type { ValidationRule } from "../types/ValidationRulesTypes";
import { usePermissions } from "../hooks/usePermissions";

interface ValidationRuleActionCellProps {
  validationRule: ValidationRule;
  onView: (validationRule: ValidationRule) => void;
}

const ValidationRuleActionCell: React.FC<ValidationRuleActionCellProps> = ({
  validationRule,
  onView,
}) => {
  const { canViewValidationRules } = usePermissions();

  return (
    <div className="flex items-center gap-2">
      {canViewValidationRules() && (
        <button
          onClick={() => onView(validationRule)}
          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          title="View validation rule configuration"
        >
          <FiEye className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default ValidationRuleActionCell;
