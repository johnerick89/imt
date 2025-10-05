import React from "react";
import { useForm, Controller } from "react-hook-form";
import { FormItem } from "./ui/FormItem";
import { Input } from "./ui/Input";
import type {
  ValidationRule,
  UpdateValidationRuleRequest,
} from "../types/ValidationRulesTypes";
import { ENTITY_FIELD_CONFIGS } from "../types/ValidationRulesTypes";
import { usePermissions } from "../hooks/usePermissions";

interface ValidationRuleFormProps {
  validationRule: ValidationRule;
  onSubmit: (data: UpdateValidationRuleRequest) => void;
  isLoading?: boolean;
}

const ValidationRuleForm: React.FC<ValidationRuleFormProps> = ({
  validationRule,
  onSubmit,
  isLoading = false,
}) => {
  const { canEditValidationRules } = usePermissions();
  const isEditDisabled = !canEditValidationRules();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateValidationRuleRequest>({
    defaultValues: {
      config: validationRule.config,
    },
  });

  const handleFormSubmit = (data: UpdateValidationRuleRequest) => {
    onSubmit(data);
  };

  const fieldConfig = ENTITY_FIELD_CONFIGS[validationRule.entity] || {};

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Validation Rules for{" "}
          {validationRule.entity.charAt(0).toUpperCase() +
            validationRule.entity.slice(1)}
        </h3>
        <p className="text-sm text-gray-600">
          Configure which fields are required for {validationRule.entity} forms.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(validationRule.config).map(([fieldName, isEnabled]) => {
          const fieldInfo = fieldConfig[fieldName];
          const label =
            fieldInfo?.label ||
            fieldName
              .replace(/_/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());
          const isRequired = fieldInfo?.required || false;
          const description = fieldInfo?.description;

          return (
            <div key={fieldName} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-700">
                    {label}
                    {isRequired && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  {description && (
                    <p className="text-xs text-gray-500 mt-1">{description}</p>
                  )}
                </div>
                <Controller
                  name={`config.${fieldName}`}
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        disabled={isEditDisabled || isLoading}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className="ml-2 text-sm text-gray-600">
                        {field.value ? "Required" : "Optional"}
                      </span>
                    </div>
                  )}
                />
              </div>
            </div>
          );
        })}
      </div>

      {isEditDisabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Read-only mode
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You don't have permission to edit validation rules. Contact
                  your administrator for access.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="submit"
          disabled={isEditDisabled || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  );
};

export default ValidationRuleForm;
