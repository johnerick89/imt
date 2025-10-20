import React from "react";
import { FiX } from "react-icons/fi";
import {
  type ChargesPayment,
  CommissionSplitStatus,
} from "../types/ChargesPaymentTypes";
import { formatToCurrency } from "../utils/textUtils";
import { formatDate } from "../utils/dateUtils";

interface CommissionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  commissionPayment: ChargesPayment | null;
}

const CommissionDetailsModal: React.FC<CommissionDetailsModalProps> = ({
  isOpen,
  onClose,
  commissionPayment,
}) => {
  console.log("commissionPayment", commissionPayment);
  if (!isOpen || !commissionPayment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Commission Payment Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Payment Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Reference Number
                  </label>
                  <p className="text-sm text-gray-900">
                    {commissionPayment.reference_number}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      commissionPayment.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : commissionPayment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {commissionPayment.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Amount
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatToCurrency(commissionPayment.amount ?? 0)}{" "}
                    {commissionPayment.currency?.currency_code || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Organisation
                  </label>
                  <p className="text-sm text-gray-900">
                    {commissionPayment.organisation?.name || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created Date
                  </label>
                  <p className="text-sm text-gray-900">
                    {formatDate(commissionPayment.created_at)}
                  </p>
                </div>
                {commissionPayment.date_completed && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Completed Date
                    </label>
                    <p className="text-sm text-gray-900">
                      {formatDate(commissionPayment.date_completed)}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Additional Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created By
                  </label>
                  <p className="text-sm text-gray-900">
                    {commissionPayment.created_by_user?.first_name}{" "}
                    {commissionPayment.created_by_user?.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Type
                  </label>
                  <p className="text-sm text-gray-900">
                    {commissionPayment.type}
                  </p>
                </div>
                {commissionPayment.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Notes
                    </label>
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {commissionPayment.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Commission Splits */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Commission Splits ({commissionPayment.payment_items?.length || 0})
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount Settled
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {commissionPayment.payment_items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.transaction_charges?.transaction
                          ?.transaction_no || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.commission_split?.role || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatToCurrency(item.amount_settled ?? 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.commission_split?.status ===
                            ("SETTLED" as CommissionSplitStatus)
                              ? "bg-green-100 text-green-800"
                              : item.commission_split?.status ===
                                ("PROCESSING" as CommissionSplitStatus)
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {item.commission_split?.status || "N/A"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommissionDetailsModal;
