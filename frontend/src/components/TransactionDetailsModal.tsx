import React, { useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { StatusBadge } from "./ui/StatusBadge";
import { formatToCurrency } from "../utils/textUtils";
import type { Transaction } from "../types/TransactionsTypes";

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onCancel?: (transaction: Transaction) => void;
  onReverse?: (transaction: Transaction) => void;
  isLoading?: boolean;
}

export const TransactionDetailsModal: React.FC<
  TransactionDetailsModalProps
> = ({
  isOpen,
  onClose,
  transaction,
  onCancel,
  onReverse,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<"details" | "charges" | "audit">(
    "details"
  );

  if (!transaction) return null;

  const totalCharges =
    transaction.transaction_charges?.reduce(
      (sum, charge) => sum + charge.amount,
      0
    ) || 0;
  const netAmount = transaction.origin_amount - totalCharges;
  const canCancel =
    ["PENDING", "PENDING_APPROVAL"].includes(transaction.status) &&
    transaction.remittance_status === "PENDING";
  const canReverse =
    transaction.status === "APPROVED" &&
    transaction.remittance_status === "PENDING";

  const renderDetailsTab = () => (
    <div className="space-y-6">
      {/* Transaction Overview */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Transaction Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Transaction Number
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {transaction.transaction_no || "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Direction
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {transaction.direction}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <div className="mt-1 flex space-x-2">
              <StatusBadge status={transaction.status} />
              <StatusBadge status={transaction.remittance_status} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Request Status
            </label>
            <p className="mt-1 text-sm text-gray-900">
              {transaction.request_status}
            </p>
          </div>
        </div>
      </div>

      {/* Amount Details */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Amount Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount Paid
            </label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatToCurrency(transaction.origin_amount)}{" "}
              {transaction.origin_currency?.currency_code}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount to Transfer
            </label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatToCurrency(transaction.dest_amount)}{" "}
              {transaction.dest_currency?.currency_code}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Exchange Rate
            </label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {transaction.rate}
            </p>
          </div>
        </div>
      </div>

      {/* Customer & Beneficiary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Customer (Sender)
          </h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="text-sm text-gray-900">
                {transaction.customer
                  ? `${transaction.customer.first_name} ${transaction.customer.last_name}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="text-sm text-gray-900">
                {transaction.customer?.email || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <p className="text-sm text-gray-900">
                {transaction.customer?.phone || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Beneficiary
          </h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="text-sm text-gray-900">
                {transaction.beneficiary?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bank
              </label>
              <p className="text-sm text-gray-900">
                {transaction.beneficiary?.bank_name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Account Number
              </label>
              <p className="text-sm text-gray-900">
                {transaction.beneficiary?.account_number || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Organisations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Origin Organisation
          </h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="text-sm text-gray-900">
                {transaction.origin_organisation?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <p className="text-sm text-gray-900">
                {transaction.origin_organisation?.type || "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Destination Organisation
          </h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="text-sm text-gray-900">
                {transaction.destination_organisation?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <p className="text-sm text-gray-900">
                {transaction.destination_organisation?.type || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Corridor & Channels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Corridor</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <p className="text-sm text-gray-900">
                {transaction.corridor?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Route
              </label>
              <p className="text-sm text-gray-900">
                {transaction.corridor
                  ? `${transaction.corridor.base_country.country_code} → ${transaction.corridor.destination_country.country_code}`
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Channels</h3>
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Origin Channel
              </label>
              <p className="text-sm text-gray-900">
                {transaction.origin_channel?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Destination Channel
              </label>
              <p className="text-sm text-gray-900">
                {transaction.dest_channel?.name || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Additional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Purpose
            </label>
            <p className="text-sm text-gray-900">
              {transaction.purpose || "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Funds Source
            </label>
            <p className="text-sm text-gray-900">
              {transaction.funds_source || "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Relationship
            </label>
            <p className="text-sm text-gray-900">
              {transaction.relationship || "N/A"}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Created By
            </label>
            <p className="text-sm text-gray-900">
              {transaction.created_by_user
                ? `${transaction.created_by_user.first_name} ${transaction.created_by_user.last_name}`
                : "N/A"}
            </p>
          </div>
        </div>
        {transaction.remarks && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Remarks
            </label>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {transaction.remarks}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const renderChargesTab = () => (
    <div className="space-y-6">
      {/* Charges Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Charges Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Charges
            </label>
            <p className="mt-1 text-lg font-semibold text-red-600">
              {formatToCurrency(totalCharges)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Net Amount
            </label>
            <p className="mt-1 text-lg font-semibold text-green-600">
              {formatToCurrency(netAmount)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Charge Count
            </label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {transaction.transaction_charges?.length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Charges Breakdown */}
      <div className="bg-white border rounded-lg">
        <div className="px-4 py-3 border-b">
          <h3 className="text-lg font-medium text-gray-900">
            Charges Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reversible
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transaction.transaction_charges?.map((charge) => (
                <tr key={charge.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={charge.type} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {charge.description || "N/A"}
                    </div>
                    {charge.charge && (
                      <div className="text-sm text-gray-500">
                        {charge.charge.name}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {charge.rate ? `${charge.rate}%` : "Fixed"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {formatToCurrency(charge.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={charge.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        charge.is_reversible
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {charge.is_reversible ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No charges found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAuditTab = () => (
    <div className="space-y-6">
      {/* Transaction Timeline */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Transaction Timeline
        </h3>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Transaction Created
              </p>
              <p className="text-sm text-gray-500">
                {transaction.created_at
                  ? new Date(transaction.created_at).toLocaleString()
                  : "N/A"}
              </p>
              <p className="text-sm text-gray-500">
                by{" "}
                {transaction.created_by_user
                  ? `${transaction.created_by_user.first_name} ${transaction.created_by_user.last_name}`
                  : "Unknown User"}
              </p>
            </div>
          </div>

          {transaction.updated_at &&
            transaction.updated_at !== transaction.created_at && (
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Transaction Updated
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

          {transaction.received_at && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Transaction Received
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.received_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {transaction.remitted_at && (
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Transaction Remitted
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.remitted_at).toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status History */}
      <div className="bg-white border rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Status History
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Current Status
              </p>
              <p className="text-sm text-gray-500">Transaction Status</p>
            </div>
            <StatusBadge status={transaction.status} />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Remittance Status
              </p>
              <p className="text-sm text-gray-500">Payment Status</p>
            </div>
            <StatusBadge status={transaction.remittance_status} />
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900">
                Request Status
              </p>
              <p className="text-sm text-gray-500">Processing Status</p>
            </div>
            <span className="text-sm text-gray-900">
              {transaction.request_status}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Transaction Details"
      size="xl"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "details", label: "Details" },
              { id: "charges", label: "Charges" },
              { id: "audit", label: "Audit Trail" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as "details" | "charges" | "audit")
                }
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "details" && renderDetailsTab()}
        {activeTab === "charges" && renderChargesTab()}
        {activeTab === "audit" && renderAuditTab()}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {canCancel && (
            <Button
              variant="destructive"
              onClick={() => onCancel?.(transaction)}
              disabled={isLoading}
            >
              Cancel Transaction
            </Button>
          )}
          {canReverse && (
            <Button
              variant="destructive"
              onClick={() => onReverse?.(transaction)}
              disabled={isLoading}
            >
              Reverse Transaction
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TransactionDetailsModal;
