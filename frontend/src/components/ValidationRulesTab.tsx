import React, { useState } from "react";
import {
  useValidationRules,
  useUpdateValidationRule,
} from "../hooks/useValidationRules";
import type { ValidationRule } from "../types/ValidationRulesTypes";
import ValidationRulesTable from "./ValidationRulesTable";
import ValidationRuleForm from "./ValidationRuleForm";
import { Modal } from "./ui/Modal";
import { usePermissions } from "../hooks/usePermissions";

const ValidationRulesTab: React.FC = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    search: "",
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedValidationRule, setSelectedValidationRule] =
    useState<ValidationRule | null>(null);

  const { canViewValidationRules } = usePermissions();

  const { data: validationRulesData, isLoading: validationRulesLoading } =
    useValidationRules(filters);
  const updateValidationRuleMutation = useUpdateValidationRule();

  const handleViewValidationRule = (validationRule: ValidationRule) => {
    setSelectedValidationRule(validationRule);
    setShowEditModal(true);
  };

  const handleUpdateValidationRule = (data: Partial<ValidationRule>) => {
    if (!selectedValidationRule) return;

    // Ensure 'config' is always defined to satisfy the type requirement
    const safeData = {
      ...data,
      config: data.config ?? {},
    };

    updateValidationRuleMutation.mutate(
      { id: selectedValidationRule.id, data: safeData },
      {
        onSuccess: () => {
          setShowEditModal(false);
          setSelectedValidationRule(null);
        },
      }
    );
  };

  if (!canViewValidationRules()) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Access Denied
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You don't have permission to view validation rules. Contact
                  your administrator for access.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Validation Rules</h1>
          <p className="text-gray-600">
            Configure field validation requirements for forms
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search validation rules..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filters.limit}
            onChange={(e) =>
              setFilters({ ...filters, limit: Number(e.target.value) })
            }
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>

      {/* Validation Rules Table */}
      <div className="bg-white rounded-lg shadow-sm border">
        <ValidationRulesTable
          validationRules={validationRulesData?.data?.validationRules || []}
          isLoading={validationRulesLoading}
          onView={handleViewValidationRule}
        />
      </div>

      {/* Pagination */}
      {validationRulesData?.data?.pagination && (
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Showing {(filters.page - 1) * filters.limit + 1} to{" "}
            {Math.min(
              filters.page * filters.limit,
              validationRulesData.data.pagination.total
            )}{" "}
            of {validationRulesData.data.pagination.total} validation rules
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page === 1}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={
                filters.page >=
                (validationRulesData.data.pagination.totalPages || 1)
              }
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Edit Validation Rule Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedValidationRule(null);
        }}
        title="Configure Validation Rules"
        size="xl"
      >
        {selectedValidationRule && (
          <ValidationRuleForm
            validationRule={selectedValidationRule}
            onSubmit={handleUpdateValidationRule}
            isLoading={updateValidationRuleMutation.isPending}
          />
        )}
      </Modal>
    </div>
  );
};

export default ValidationRulesTab;
