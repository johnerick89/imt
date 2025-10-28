import React from "react";
import { Modal } from "../ui/Modal";
import { formatToCurrency } from "../../utils/textUtils";
import type {
  OrgBalance,
  BalanceHistory,
} from "../../types/BalanceOperationsTypes";

interface BalanceHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: OrgBalance | null;
}

const BalanceHistoryModal: React.FC<BalanceHistoryModalProps> = ({
  isOpen,
  onClose,
  balance,
}) => {
  if (!balance) return null;

  const { balance_histories = [] } = balance;

  // Get current periodic balance
  const currentPeriodicBalance = balance.periodic_org_balances?.find(
    (periodic) => periodic.is_current
  );

  // Calculate summary statistics
  const totalInflows = balance_histories
    .filter((h) => h.change_amount > 0)
    .reduce((sum, h) => sum + Number(h.change_amount), 0);

  const totalOutflows = balance_histories
    .filter((h) => h.change_amount < 0)
    .reduce((sum, h) => sum + Math.abs(Number(h.change_amount)), 0);

  const getActionTypeBadge = (actionType: string) => {
    const badges: { [key: string]: string } = {
      TOPUP: "bg-green-100 text-green-800",
      WITHDRAWAL: "bg-red-100 text-red-800",
      LOCK: "bg-yellow-100 text-yellow-800",
      SETTLEMENT: "bg-blue-100 text-blue-800",
      DEPOSIT: "bg-green-100 text-green-800",
      TRANSFER: "bg-purple-100 text-purple-800",
    };
    return badges[actionType] || "bg-gray-100 text-gray-800";
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Balance History" size="lg">
      <div className="space-y-6">
        {/* Balance Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Balance Summary
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Current Balance</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatToCurrency(balance.balance || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Locked Balance</div>
              <div className="text-2xl font-bold text-gray-900">
                {formatToCurrency(balance.locked_balance || 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Inflows</div>
              <div className="text-xl font-semibold text-green-600">
                {formatToCurrency(totalInflows)}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Total Outflows</div>
              <div className="text-xl font-semibold text-red-600">
                {formatToCurrency(totalOutflows)}
              </div>
            </div>
          </div>
        </div>

        {/* Balance Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Balance Details
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Currency:</span>
              <span className="text-sm font-medium text-gray-900">
                {balance.currency.currency_code}
              </span>
            </div>
            {balance.base_org && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Base Organisation:
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {balance.base_org.name} ({balance.base_org.type})
                </span>
              </div>
            )}
            {balance.dest_org && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Agency/Partner:</span>
                <span className="text-sm font-medium text-gray-900">
                  {balance.dest_org.name} ({balance.dest_org.type})
                </span>
              </div>
            )}
            {balance.limit && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Limit:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formatToCurrency(balance.limit)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Current Period Details */}
        {currentPeriodicBalance && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Current Period Details
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Opening Balance</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatToCurrency(
                    currentPeriodicBalance.opening_balance || 0
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Period Limit</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatToCurrency(currentPeriodicBalance.limit || 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Commissions</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatToCurrency(currentPeriodicBalance.commissions || 0)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  Incoming Transactions
                </div>
                <div className="text-lg font-semibold text-green-600">
                  {formatToCurrency(
                    currentPeriodicBalance.transactions_in || 0
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">
                  Outgoing Transactions
                </div>
                <div className="text-lg font-semibold text-red-600">
                  {formatToCurrency(
                    currentPeriodicBalance.transactions_out || 0
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Deposits</div>
                <div className="text-lg font-semibold text-green-600">
                  {formatToCurrency(
                    currentPeriodicBalance.deposits_amount || 0
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Withdrawals</div>
                <div className="text-lg font-semibold text-red-600">
                  {formatToCurrency(
                    currentPeriodicBalance.withdrawals_amount || 0
                  )}
                </div>
              </div>
              {currentPeriodicBalance.closing_balance && (
                <div>
                  <div className="text-sm text-gray-600">Closing Balance</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {formatToCurrency(currentPeriodicBalance.closing_balance)}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-blue-200">
              <div className="text-sm text-gray-600">
                Period Created:{" "}
                {new Date(
                  currentPeriodicBalance.created_at
                ).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-600">
                Created by:{" "}
                {currentPeriodicBalance.created_by_user?.name || "System"}
              </div>
            </div>
          </div>
        )}

        {/* Transaction History */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Transaction History ({balance_histories.length})
          </h3>
          {balance_histories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transaction history available
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {balance_histories.map((history: BalanceHistory) => (
                <div
                  key={history.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${getActionTypeBadge(
                            history.action_type
                          )}`}
                        >
                          {history.action_type}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(history.created_at).toLocaleString()}
                        </span>
                      </div>
                      {history.description && (
                        <div className="text-sm text-gray-700 mb-2">
                          {history.description}
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Old Balance:</span>
                          <div className="font-medium text-gray-900">
                            {formatToCurrency(history.old_balance)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Change:</span>
                          <div
                            className={`font-medium ${
                              history.change_amount >= 0
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {history.change_amount >= 0 ? "+" : ""}
                            {formatToCurrency(history.change_amount)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">New Balance:</span>
                          <div className="font-medium text-gray-900">
                            {formatToCurrency(history.new_balance)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BalanceHistoryModal;
