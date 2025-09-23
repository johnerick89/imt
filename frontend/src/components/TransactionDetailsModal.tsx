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
  onApprove?: (transaction: Transaction) => void;
  onUpdate?: (transaction: Transaction) => void;
  onMarkAsReady?: (transaction: Transaction) => void;
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
  onApprove,
  onUpdate,
  onMarkAsReady,
  isLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState<"details" | "charges" | "audit">(
    "details"
  );
  console.log("transaction", transaction);

  if (!transaction) return null;

  const totalCharges =
    transaction.transaction_charges?.reduce(
      (sum, charge) => sum + charge.amount,
      0
    ) || 0;
  const netAmount = transaction.dest_amount;

  // Only show actions for outbound transactions
  const isOutbound = transaction.direction === "OUTBOUND";
  const isInbound = transaction.direction === "INBOUND";

  const canCancel =
    isOutbound &&
    ["PENDING", "PENDING_APPROVAL", "READY"].includes(transaction.status) &&
    transaction.remittance_status === "PENDING";
  const canReverse =
    isOutbound &&
    transaction.status === "APPROVED" &&
    transaction.remittance_status === "READY";
  const canApprove =
    isOutbound &&
    transaction.status === "READY" &&
    transaction.remittance_status === "READY";
  const canUpdate =
    isOutbound &&
    ["PENDING", "PENDING_APPROVAL"].includes(transaction.status) &&
    transaction.remittance_status === "PENDING";
  const canMarkAsReady =
    isOutbound && ["PENDING", "PENDING_APPROVAL"].includes(transaction.status);

  const getCounterPartyEmail = (metadata: Record<string, unknown>) => {
    return metadata.email as string;
  };

  const getCounterPartyPhone = (metadata: Record<string, unknown>) => {
    return metadata.phone as string;
  };

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
              Amount To Transfer (Origin)
            </label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatToCurrency(transaction.origin_amount || 0)}{" "}
              {transaction.origin_currency?.currency_code}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Total Charges (Origin)
            </label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatToCurrency(transaction.total_all_charges || 0)}{" "}
              {transaction.origin_currency?.currency_code}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount paid (Origin)
            </label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatToCurrency(transaction.amount_payable || 0)}{" "}
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
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Amount to Transfer (Destination)
            </label>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {formatToCurrency(transaction.dest_amount)}{" "}
              {transaction.dest_currency?.currency_code}
            </p>
          </div>
        </div>
      </div>

      {/* Customer & Beneficiary */}
      {isOutbound && (
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
                    ? `${transaction.customer.full_name}`
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
                  {transaction.customer?.phone_number || "N/A"}
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
                  {transaction.beneficiary?.bank_account_number || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sender & Receiver */}
      {isInbound && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sender</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="text-sm text-gray-900">
                  {transaction.sender_trasaction_party
                    ? `${transaction.sender_trasaction_party?.name}`
                    : "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="text-sm text-gray-900">
                  {getCounterPartyEmail(
                    transaction.sender_trasaction_party?.metadata || {}
                  ) || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <p className="text-sm text-gray-900">
                  {getCounterPartyPhone(
                    transaction.sender_trasaction_party?.metadata || {}
                  ) || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Receiver</h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="text-sm text-gray-900">
                  {transaction.receiver_trasaction_party?.name || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="text-sm text-gray-900">
                  {getCounterPartyEmail(
                    transaction.receiver_trasaction_party?.metadata || {}
                  ) || "N/A"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <p className="text-sm text-gray-900">
                  {getCounterPartyPhone(
                    transaction.receiver_trasaction_party?.metadata || {}
                  ) || "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  ? `${transaction?.corridor?.base_country?.code} → ${transaction.corridor.destination_country?.code}`
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

  const renderAuditTab = () => {
    const audits = transaction.transaction_audits || [];

    const getActionColor = (action: string) => {
      switch (action) {
        case "CREATED":
          return "bg-blue-500";
        case "UPDATED":
          return "bg-yellow-500";
        case "APPROVED":
          return "bg-green-500";
        case "CANCELLED":
          return "bg-red-500";
        case "REVERSED":
          return "bg-red-600";
        case "MADE_READY":
          return "bg-orange-500";
        case "REASSIGNED":
          return "bg-purple-500";
        default:
          return "bg-gray-500";
      }
    };

    const getActionLabel = (action: string) => {
      switch (action) {
        case "CREATED":
          return "Transaction Created";
        case "UPDATED":
          return "Transaction Updated";
        case "APPROVED":
          return "Transaction Approved";
        case "CANCELLED":
          return "Transaction Cancelled";
        case "REVERSED":
          return "Transaction Reversed";
        case "MADE_READY":
          return "Transaction Made Ready";
        case "REASSIGNED":
          return "Transaction Reassigned";
        default:
          return action;
      }
    };

    return (
      <div className="space-y-6">
        {/* Transaction Audits */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Audit Trail
          </h3>
          {audits.length > 0 ? (
            <div className="space-y-4">
              {audits
                .sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                )
                .map((audit) => (
                  <div key={audit.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-2 h-2 ${getActionColor(
                          audit.action
                        )} rounded-full mt-2`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {getActionLabel(audit.action)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(audit.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-600">
                          by{" "}
                          {audit.user
                            ? `${audit.user.first_name} ${audit.user.last_name}`
                            : "Unknown User"}
                        </p>
                        {audit.new_user && (
                          <p className="text-sm text-gray-600">
                            reassigned to{" "}
                            {`${audit.new_user.first_name} ${audit.new_user.last_name}`}
                          </p>
                        )}
                        {audit.notes && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Notes:</span>{" "}
                            {audit.notes}
                          </p>
                        )}
                        {audit.details &&
                          Object.keys(audit.details).length > 0 && (
                            <details className="mt-2">
                              <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                                View Details
                              </summary>
                              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                                <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                                  {JSON.stringify(audit.details, null, 2)}
                                </pre>
                              </div>
                            </details>
                          )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No audit trail available for this transaction.
              </p>
            </div>
          )}
        </div>

        {/* Current Status Summary */}
        <div className="bg-white border rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Current Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Transaction Status
                </p>
              </div>
              <StatusBadge status={transaction.status} />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Remittance Status
                </p>
              </div>
              <StatusBadge status={transaction.remittance_status} />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  Request Status
                </p>
              </div>
              <span className="text-sm text-gray-900">
                {transaction.request_status}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
        <div className="flex justify-end space-x-3 pt-6 border-t flex-wrap">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {canUpdate && (
            <Button
              variant="outline"
              onClick={() => onUpdate?.(transaction)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-gray-900"
            >
              Edit Transaction
            </Button>
          )}
          {canMarkAsReady && (
            <Button
              variant="outline"
              onClick={() => onMarkAsReady?.(transaction)}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700 text-white"
            >
              Make Ready
            </Button>
          )}
          {canApprove && (
            <Button
              variant="default"
              onClick={() => onApprove?.(transaction)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Approve Transaction
            </Button>
          )}
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
