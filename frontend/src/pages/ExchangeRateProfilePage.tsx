import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiTrash2, FiCheck, FiX } from "react-icons/fi";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Modal } from "../components/ui/Modal";
import { ConfirmModal } from "../components/ConfirmModal";
import ExchangeRateForm from "../components/ExchangeRateForm";
import {
  useExchangeRate,
  useUpdateExchangeRate,
  useDeleteExchangeRate,
  useApproveExchangeRate,
} from "../hooks";
import {
  ExchangeRateStatus,
  ExchangeRateOperatorStatus,
} from "../types/ExchangeRatesTypes";
import type { UpdateExchangeRateRequest } from "../types/ExchangeRatesTypes";
import { formatToCurrency } from "../utils/textUtils";
import { usePermissions } from "../hooks/usePermissions";

const ExchangeRateProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { canEditExchangeRates, canDeleteExchangeRates } = usePermissions();

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Data fetching
  const { data: exchangeRateData, isLoading } = useExchangeRate(id!);

  // Mutations
  const updateExchangeRateMutation = useUpdateExchangeRate();
  const deleteExchangeRateMutation = useDeleteExchangeRate();
  const approveExchangeRateMutation = useApproveExchangeRate();

  const exchangeRate = exchangeRateData?.data;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!exchangeRate) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Exchange Rate Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The exchange rate you're looking for doesn't exist or has been
            removed.
          </p>
          <button
            onClick={() => navigate("/exchange-rates")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Back to Exchange Rates
          </button>
        </div>
      </div>
    );
  }

  // Action permissions
  const canApprove =
    exchangeRate.status === ExchangeRateStatus.PENDING_APPROVAL ||
    exchangeRate.operator_status ===
      ExchangeRateOperatorStatus.PENDING_APPROVAL;

  const canEdit =
    exchangeRate.status !== ExchangeRateStatus.APPROVED &&
    exchangeRate.status !== ExchangeRateStatus.ACTIVE;

  const canDelete =
    exchangeRate.status !== ExchangeRateStatus.APPROVED &&
    exchangeRate.status !== ExchangeRateStatus.ACTIVE;

  // Handlers
  const handleEditExchangeRate = async (data: UpdateExchangeRateRequest) => {
    try {
      const result = await updateExchangeRateMutation.mutateAsync({
        id: exchangeRate.id,
        data,
      });
      if (result.success) {
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Failed to update exchange rate:", error);
    }
  };

  const handleDeleteExchangeRate = async () => {
    try {
      const result = await deleteExchangeRateMutation.mutateAsync(
        exchangeRate.id
      );
      if (result.success) {
        navigate("/exchange-rates");
      }
    } catch (error) {
      console.error("Failed to delete exchange rate:", error);
    }
  };

  const handleApproveExchangeRate = async () => {
    try {
      const result = await approveExchangeRateMutation.mutateAsync({
        id: exchangeRate.id,
        data: {
          status: ExchangeRateStatus.APPROVED,
          operator_status: ExchangeRateOperatorStatus.APPROVED,
        },
      });
      if (result.success) {
        setShowApproveModal(false);
      }
    } catch (error) {
      console.error("Failed to approve exchange rate:", error);
    }
  };

  const handleRejectExchangeRate = async () => {
    try {
      const result = await approveExchangeRateMutation.mutateAsync({
        id: exchangeRate.id,
        data: {
          status: ExchangeRateStatus.REJECTED,
          operator_status: ExchangeRateOperatorStatus.REJECTED,
        },
      });
      if (result.success) {
        setShowRejectModal(false);
      }
    } catch (error) {
      console.error("Failed to reject exchange rate:", error);
    }
  };

  const isAnyMutationLoading =
    updateExchangeRateMutation.isPending ||
    deleteExchangeRateMutation.isPending ||
    approveExchangeRateMutation.isPending;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/exchange-rates")}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <FiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {exchangeRate.name || "Exchange Rate"}
            </h1>
            <p className="text-gray-600">
              {exchangeRate.from_currency?.currency_code} →{" "}
              {exchangeRate.to_currency?.currency_code}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canEdit && canEditExchangeRates() && (
            <button
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit
            </button>
          )}

          {canApprove && canEditExchangeRates() && (
            <>
              <button
                onClick={() => setShowApproveModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
              >
                <FiCheck className="h-4 w-4" />
                Approve
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
              >
                <FiX className="h-4 w-4" />
                Reject
              </button>
            </>
          )}

          {canDelete && canDeleteExchangeRates() && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              <FiTrash2 className="h-4 w-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Basic Information */}
        <div className="xl:col-span-2 space-y-6">
          {/* Currency & Route Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Currency & Route Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <span className="text-sm font-medium text-gray-500">Name</span>
                <p className="mt-1 text-sm text-gray-900">
                  {exchangeRate.name || "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Currency Pair
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {exchangeRate.from_currency?.currency_code} →{" "}
                  {exchangeRate.to_currency?.currency_code}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  From Currency
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {exchangeRate.from_currency
                    ? `${exchangeRate.from_currency.currency_code} - ${exchangeRate.from_currency.currency_name}`
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  To Currency
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {exchangeRate.to_currency
                    ? `${exchangeRate.to_currency.currency_code} - ${exchangeRate.to_currency.currency_name}`
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Origin Country
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {exchangeRate.origin_country?.name || "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Destination Country
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {exchangeRate.destination_country?.name || "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Exchange Rates */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Exchange Rates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-600">
                  Buy Rate
                </span>
                <p className="mt-1 text-xl font-bold text-blue-900">
                  {formatToCurrency(exchangeRate.buy_rate)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-600">
                  Sell Rate
                </span>
                <p className="mt-1 text-xl font-bold text-green-900">
                  {formatToCurrency(exchangeRate.sell_rate)}
                </p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-600">
                  Exchange Rate
                </span>
                <p className="mt-1 text-xl font-bold text-purple-900">
                  {formatToCurrency(exchangeRate.exchange_rate)}
                </p>
              </div>
            </div>
          </div>

          {/* Rate Limits */}
          {(exchangeRate.min_buy_rate ||
            exchangeRate.max_buy_rate ||
            exchangeRate.min_sell_rate ||
            exchangeRate.max_sell_rate ||
            exchangeRate.min_exchange_rate ||
            exchangeRate.max_exchange_rate) && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Rate Limits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Buy Rate Limits */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Buy Rate Limits
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Minimum</span>
                      <p className="text-sm text-gray-900">
                        {exchangeRate.min_buy_rate
                          ? formatToCurrency(exchangeRate.min_buy_rate)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Maximum</span>
                      <p className="text-sm text-gray-900">
                        {exchangeRate.max_buy_rate
                          ? formatToCurrency(exchangeRate.max_buy_rate)
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sell Rate Limits */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Sell Rate Limits
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Minimum</span>
                      <p className="text-sm text-gray-900">
                        {exchangeRate.min_sell_rate
                          ? formatToCurrency(exchangeRate.min_sell_rate)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Maximum</span>
                      <p className="text-sm text-gray-900">
                        {exchangeRate.max_sell_rate
                          ? formatToCurrency(exchangeRate.max_sell_rate)
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Exchange Rate Limits */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">
                    Exchange Rate Limits
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500">Minimum</span>
                      <p className="text-sm text-gray-900">
                        {exchangeRate.min_exchange_rate
                          ? formatToCurrency(exchangeRate.min_exchange_rate)
                          : "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Maximum</span>
                      <p className="text-sm text-gray-900">
                        {exchangeRate.max_exchange_rate
                          ? formatToCurrency(exchangeRate.max_exchange_rate)
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div className="p-6">
          {/* Status & Approval */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Status & Approval
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={exchangeRate.status} type="status" />
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Operator Status
                </span>
                <div className="mt-1">
                  <StatusBadge
                    status={exchangeRate.operator_status}
                    type="status"
                  />
                </div>
              </div>
              {exchangeRate.approved_by_user && (
                <div>
                  <span className="text-sm font-medium text-gray-500">
                    Approved By
                  </span>
                  <p className="mt-1 text-sm text-gray-900">
                    {exchangeRate.approved_by_user.first_name}{" "}
                    {exchangeRate.approved_by_user.last_name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Validity Period */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Validity Period
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Valid From
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {exchangeRate.date_from
                    ? new Date(exchangeRate.date_from).toLocaleDateString()
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Valid To
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {exchangeRate.date_to
                    ? new Date(exchangeRate.date_to).toLocaleDateString()
                    : "No expiry"}
                </p>
              </div>
            </div>
          </div>

          {/* Organisation & Audit */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Organisation & Audit
            </h2>
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Organisation
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {exchangeRate.organisation?.name || "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Created By
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {exchangeRate.created_by_user
                    ? `${exchangeRate.created_by_user.first_name} ${exchangeRate.created_by_user.last_name}`
                    : "-"}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Created
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(exchangeRate.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">
                  Last Updated
                </span>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(exchangeRate.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Exchange Rate"
        size="xl"
      >
        <ExchangeRateForm
          initialData={exchangeRate}
          onSubmit={handleEditExchangeRate}
          isLoading={isAnyMutationLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteExchangeRate}
        title="Delete Exchange Rate"
        message="Are you sure you want to delete this exchange rate? This action cannot be undone."
        isLoading={isAnyMutationLoading}
      />

      {/* Approve Confirmation Modal */}
      <ConfirmModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApproveExchangeRate}
        title="Approve Exchange Rate"
        message="Are you sure you want to approve this exchange rate? This will activate the rate and mark any existing rates for the same currency pair as inactive."
        isLoading={isAnyMutationLoading}
        confirmText="Approve"
      />

      {/* Reject Confirmation Modal */}
      <ConfirmModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleRejectExchangeRate}
        title="Reject Exchange Rate"
        message="Are you sure you want to reject this exchange rate? This action cannot be undone."
        isLoading={isAnyMutationLoading}
        confirmText="Reject"
      />
    </div>
  );
};

export default ExchangeRateProfilePage;
