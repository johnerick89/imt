import React from "react";
import { DataTable } from "./ui/DataTable";
import type { ValidationRule } from "../types/ValidationRulesTypes";
import ValidationRuleActionCell from "./ValidationRuleActionCell";

interface ValidationRulesTableProps {
  validationRules: ValidationRule[];
  isLoading?: boolean;
  searchKey?: string;
  onView: (validationRule: ValidationRule) => void;
}

const ValidationRulesTable: React.FC<ValidationRulesTableProps> = ({
  validationRules,
  isLoading = false,
  searchKey = "entity",
  onView,
}) => {
  const columns = [
    {
      accessorKey: "entity",
      header: "Entity",
      cell: ({ row }: { row: { original: ValidationRule } }) => (
        <div className="flex flex-col items-left gap-1">
          <div className="font-medium text-gray-900 capitalize">
            {row.original.entity}
          </div>
          <div className="text-sm text-gray-500">
            {Object.keys(row.original.config).length} fields configured
          </div>
        </div>
      ),
    },
    {
      accessorKey: "config",
      header: "Field Configuration",
      cell: ({ row }: { row: { original: ValidationRule } }) => {
        const config = row.original.config;
        const enabledFields = Object.values(config).filter(Boolean).length;
        const totalFields = Object.keys(config).length;

        return (
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-600">
              {enabledFields} of {totalFields} fields enabled
            </div>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(enabledFields / totalFields) * 100}%` }}
              ></div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Last Updated",
      cell: ({ row }: { row: { original: ValidationRule } }) => (
        <div className="text-gray-600">
          {new Date(row.original.updated_at).toLocaleDateString()}
        </div>
      ),
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: ValidationRule } }) => (
        <ValidationRuleActionCell
          validationRule={row.original}
          onView={onView}
        />
      ),
      enableSorting: false,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={validationRules}
      searchKey={searchKey}
      loading={isLoading}
    />
  );
};

export default ValidationRulesTable;
