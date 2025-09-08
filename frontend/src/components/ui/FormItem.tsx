import React from "react";

interface FormItemProps {
  label: string;
  children: React.ReactNode;
  invalid?: boolean;
  errorMessage?: string;
  required?: boolean;
}

export const FormItem: React.FC<FormItemProps> = ({
  label,
  children,
  invalid = false,
  errorMessage,
  required = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={invalid ? "ring-2 ring-red-500 ring-opacity-50" : ""}>
        {children}
      </div>
      {invalid && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};
