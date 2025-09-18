import React from "react";
import {
  FiX,
  FiDollarSign,
  FiLock,
  FiUnlock,
  FiCalendar,
  FiUser,
  FiHome,
} from "react-icons/fi";
import { Modal } from "./ui/Modal";
import { StatusBadge } from "./ui/StatusBadge";
import { useGlAccountById } from "../hooks/useGlAccounts";
import { formatToCurrency, formatDateTime } from "../utils/textUtils";
import type { GlAccount } from "../types/GlAccountsTypes";

interface ViewGlAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  glAccountId: string | null;
}

const ViewGlAccountModal: React.FC<ViewGlAccountModalProps> = ({
  isOpen,
  onClose,
  glAccountId,
}) => {
  const { data: glAccountData, isLoading } = useGlAccountById(
    glAccountId || ""
  );
  const glAccount = glAccountData?.data;

  if (!isOpen || !glAccountId) return null;

  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "ASSET":
        return "text-green-700 bg-green-100";
      case "LIABILITY":
        return "text-red-700 bg-red-100";
      case "EQUITY":
        return "text-purple-700 bg-purple-100";
      case "REVENUE":
        return "text-blue-700 bg-blue-100";
      case "EXPENSE":
        return "text-orange-700 bg-orange-100";
      default:
        return "text-gray-700 bg-gray-100";
    }
  };

  const getStatusInfo = (account: GlAccount) => {
    if (account.closed_at) {
      return {
        status: "Closed",
        color: "text-red-700 bg-red-100",
        icon: <FiX className="h-4 w-4" />,
        reason: account.close_reason,
      };
    }
    if (account.frozen_at) {
      return {
        status: "Frozen",
        color: "text-yellow-700 bg-yellow-100",
        icon: <FiLock className="h-4 w-4" />,
        reason: account.frozen_reason,
      };
    }
    return {
      status: "Active",
      color: "text-green-700 bg-green-100",
      icon: <FiUnlock className="h-4 w-4" />,
    };
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="GL Account Details"
      size="2xl"
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : glAccount ? (
        <div className="space-y-6">
          {/* Account Header */}
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {glAccount.name}
                </h3>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getAccountTypeColor(
                      glAccount.type
                    )}`}
                  >
                    {glAccount.type}
                  </span>
                  {(() => {
                    const statusInfo = getStatusInfo(glAccount);
                    return (
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color}`}
                      >
                        {statusInfo.icon}
                        <span className="ml-1">{statusInfo.status}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">
                  Current Balance
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatToCurrency(glAccount.balance || 0)}
                  {glAccount.currency && (
                    <span className="text-sm text-gray-500 ml-2">
                      {glAccount.currency.currency_code}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Status Reason */}
            {(() => {
              const statusInfo = getStatusInfo(glAccount);
              return (
                statusInfo.reason && (
                  <div className="bg-white border border-gray-200 rounded-lg p-3">
                    <div className="text-sm text-gray-600">
                      <strong>Reason:</strong> {statusInfo.reason}
                    </div>
                  </div>
                )
              );
            })()}
          </div>

          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Type:</span>
                  <StatusBadge status={glAccount.type} type="gl-account-type" />
                </div>
                {glAccount.currency && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Currency:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {glAccount.currency.currency_code} -{" "}
                      {glAccount.currency.currency_name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Balance Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-lg font-medium text-gray-900 mb-4">
                Balance Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Available Balance:
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatToCurrency(glAccount.balance || 0)}
                  </span>
                </div>
                {glAccount.locked_balance !== null && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Locked Balance:
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatToCurrency(glAccount.locked_balance || 0)}
                    </span>
                  </div>
                )}
                {glAccount.max_balance !== null && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Max Balance:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatToCurrency(glAccount.max_balance || 0)}
                    </span>
                  </div>
                )}
                {glAccount.min_balance !== null && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Min Balance:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {formatToCurrency(glAccount.min_balance || 0)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Related Entities */}
            {(glAccount.organisation ||
              glAccount.opened_by_user ||
              glAccount.bank_account ||
              glAccount.till ||
              glAccount.vault ||
              glAccount.charge) && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 md:col-span-2">
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Related Entities
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {glAccount.organisation && (
                    <div className="flex items-center space-x-3">
                      <FiHome className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">
                          Organisation
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {glAccount.organisation.name}
                        </div>
                      </div>
                    </div>
                  )}
                  {glAccount.opened_by_user && (
                    <div className="flex items-center space-x-3">
                      <FiUser className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Opened By</div>
                        <div className="text-sm font-medium text-gray-900">
                          {glAccount.opened_by_user.first_name}{" "}
                          {glAccount.opened_by_user.last_name}
                        </div>
                      </div>
                    </div>
                  )}
                  {glAccount.bank_account && (
                    <div className="flex items-center space-x-3">
                      <FiDollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">
                          Bank Account
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {glAccount.bank_account.name} -{" "}
                          {glAccount.bank_account.account_number}
                        </div>
                      </div>
                    </div>
                  )}
                  {glAccount.till && (
                    <div className="flex items-center space-x-3">
                      <FiDollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Till</div>
                        <div className="text-sm font-medium text-gray-900">
                          {glAccount.till.name}
                        </div>
                      </div>
                    </div>
                  )}
                  {glAccount.vault && (
                    <div className="flex items-center space-x-3">
                      <FiDollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Vault</div>
                        <div className="text-sm font-medium text-gray-900">
                          {glAccount.vault.name}
                        </div>
                      </div>
                    </div>
                  )}
                  {glAccount.charge && (
                    <div className="flex items-center space-x-3">
                      <FiDollarSign className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Charge</div>
                        <div className="text-sm font-medium text-gray-900">
                          {glAccount.charge.name}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* GL Entries (Transactions) */}
          {glAccount.gl_entries && glAccount.gl_entries.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-medium text-gray-900">
                  Transaction History ({glAccount.gl_entries.length} entries)
                </h4>
                <div className="text-xs text-gray-500">
                  <span className="inline-flex items-center mr-4">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    Increase
                  </span>
                  <span className="inline-flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-1"></span>
                    Decrease
                  </span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Debit
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Credit
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {glAccount.gl_entries
                      .sort(
                        (a, b) =>
                          new Date(b.created_at).getTime() -
                          new Date(a.created_at).getTime()
                      )
                      .map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(entry.created_at)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {entry.description}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {(() => {
                              // Determine if this entry increases or decreases the account
                              const isIncrease =
                                glAccount.type === "ASSET" ||
                                glAccount.type === "REVENUE"
                                  ? entry.dr_cr === "DR"
                                  : entry.dr_cr === "CR";

                              return (
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    isIncrease
                                      ? "text-green-800 bg-green-100"
                                      : "text-red-800 bg-red-100"
                                  }`}
                                >
                                  {entry.dr_cr}
                                </span>
                              );
                            })()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                            {entry.dr_cr === "DR" ? (
                              <span
                                className={`font-medium ${
                                  glAccount.type === "ASSET" ||
                                  glAccount.type === "REVENUE"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {formatToCurrency(entry.amount)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                            {entry.dr_cr === "CR" ? (
                              <span
                                className={`font-medium ${
                                  glAccount.type === "EXPENSE" ||
                                  glAccount.type === "LIABILITY"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {formatToCurrency(entry.amount)}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* No Entries Message */}
          {glAccount.gl_entries && glAccount.gl_entries.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
              <FiCalendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">
                No Transaction History
              </h4>
              <p className="text-gray-500">
                This account has no GL entries yet. Transactions will appear
                here when they affect this account.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-gray-500">GL Account not found</div>
        </div>
      )}
    </Modal>
  );
};

export default ViewGlAccountModal;
