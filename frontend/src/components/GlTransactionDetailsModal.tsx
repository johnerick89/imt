import React from "react";
import { Modal } from "./ui/Modal";
import { StatusBadge } from "./ui/StatusBadge";
import { formatToCurrency } from "../utils/textUtils";
import type { GlTransaction } from "../types/GlTransactionsTypes";

interface GlTransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: GlTransaction | null;
}

const GlTransactionDetailsModal: React.FC<GlTransactionDetailsModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  if (!transaction) return null;

  const drEntries =
    transaction.gl_entries?.filter((entry) => entry.dr_cr === "DR") || [];
  const crEntries =
    transaction.gl_entries?.filter((entry) => entry.dr_cr === "CR") || [];
  const drTotal = drEntries.reduce(
    (sum, entry) => sum + Number(entry.amount),
    0
  );
  const crTotal = crEntries.reduce(
    (sum, entry) => sum + Number(entry.amount),
    0
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GL Transaction Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Transaction Overview */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Transaction Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Type</label>
              <p className="text-sm text-gray-900">
                {transaction.transaction_type.replace(/_/g, " ")}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <div className="mt-1">
                <StatusBadge status={transaction.status} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Amount
              </label>
              <p className="text-sm text-gray-900">
                {formatToCurrency(transaction.amount)}{" "}
                {transaction.currency?.currency_code || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Created
              </label>
              <p className="text-sm text-gray-900">
                {new Date(transaction.created_at).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-500">
              Description
            </label>
            <p className="text-sm text-gray-900 mt-1">
              {transaction.description}
            </p>
          </div>
        </div>

        {/* Entity Information */}
        {(transaction.vault ||
          transaction.user_till ||
          transaction.customer ||
          transaction.transaction ||
          transaction.till) && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Related Entity
            </h3>
            {transaction.vault && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Vault
                  </label>
                  <p className="text-sm text-gray-900">
                    {transaction.vault.name}
                  </p>
                </div>
              </div>
            )}
            {transaction.user_till && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Till
                  </label>
                  <p className="text-sm text-gray-900">
                    {transaction.user_till.till.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    User
                  </label>
                  <p className="text-sm text-gray-900">
                    {transaction.user_till.user.first_name}{" "}
                    {transaction.user_till.user.last_name}
                  </p>
                </div>
              </div>
            )}
            {transaction.customer && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Customer
                  </label>
                  <p className="text-sm text-gray-900">
                    {transaction.customer.first_name}{" "}
                    {transaction.customer.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-sm text-gray-900">
                    {transaction.customer.email}
                  </p>
                </div>
              </div>
            )}
            {transaction.till && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Till
                  </label>
                  <p className="text-sm text-gray-900">
                    {transaction.till.name}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* GL Entries */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">GL Entries</h3>

          {/* Debit Entries */}
          {drEntries.length > 0 && (
            <div className="mb-6">
              <h4 className="text-md font-medium text-gray-700 mb-2">
                Debit Entries
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">
                              {entry.gl_account?.name}
                            </div>
                            <div className="text-gray-500">
                              {entry.gl_account?.type}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {entry.description}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatToCurrency(entry.amount)}{" "}
                          {entry.gl_account?.currency?.currency_code || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={2}
                        className="px-3 py-2 text-right text-sm font-medium text-gray-900"
                      >
                        Total Debits:
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                        {formatToCurrency(drTotal)}{" "}
                        {transaction.currency?.currency_code || "N/A"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Credit Entries */}
          {crEntries.length > 0 && (
            <div>
              <h4 className="text-md font-medium text-gray-700 mb-2">
                Credit Entries
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {crEntries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">
                              {entry.gl_account?.name}
                            </div>
                            <div className="text-gray-500">
                              {entry.gl_account?.type}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 text-sm text-gray-900">
                          {entry.description}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900 text-right">
                          {formatToCurrency(entry.amount)}{" "}
                          {entry.gl_account?.currency?.currency_code || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td
                        colSpan={2}
                        className="px-3 py-2 text-right text-sm font-medium text-gray-900"
                      >
                        Total Credits:
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-medium text-gray-900">
                        {formatToCurrency(crTotal)}{" "}
                        {transaction.currency?.currency_code || "N/A"}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Balance Check */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-blue-900">
                Balance Check:
              </span>
              <span
                className={`text-sm font-medium ${
                  Math.abs(drTotal - crTotal) < 0.01
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {Math.abs(drTotal - crTotal) < 0.01
                  ? "✓ Balanced"
                  : "✗ Unbalanced"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default GlTransactionDetailsModal;
