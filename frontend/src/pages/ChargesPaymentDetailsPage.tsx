import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useChargesPayment,
  useApproveChargesPayment,
  useReverseChargesPayment,
} from "../hooks/useChargesPayments";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import { StatusBadge } from "../components/ui/StatusBadge";
import { formatToCurrency } from "../utils/textUtils";
import type {
  ApproveChargesPaymentRequest,
  ReverseChargesPaymentRequest,
} from "../types/ChargesPaymentTypes";

const ChargesPaymentDetailsPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showReverseModal, setShowReverseModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState("");
  const [reverseReason, setReverseReason] = useState("");
  const [reverseNotes, setReverseNotes] = useState("");

  const {
    data: paymentData,
    isLoading,
    error,
  } = useChargesPayment(paymentId || "");
  const approveMutation = useApproveChargesPayment();
  const reverseMutation = useReverseChargesPayment();

  const payment = paymentData?.data;

  const handleApprove = async () => {
    if (!payment) return;

    try {
      const data: ApproveChargesPaymentRequest = {
        notes: approveNotes || undefined,
      };

      await approveMutation.mutateAsync({
        paymentId: payment.id,
        data,
      });

      setShowApproveModal(false);
      setApproveNotes("");
    } catch (error) {
      console.error("Error approving charges payment:", error);
    }
  };

  const handleReverse = async () => {
    if (!payment) return;

    try {
      const data: ReverseChargesPaymentRequest = {
        reason: reverseReason,
        notes: reverseNotes || undefined,
      };

      await reverseMutation.mutateAsync({
        paymentId: payment.id,
        data,
      });

      setShowReverseModal(false);
      setReverseReason("");
      setReverseNotes("");
    } catch (error) {
      console.error("Error reversing charges payment:", error);
    }
  };

  const getChargeTypeColor = (type: string) => {
    switch (type) {
      case "TAX":
        return "bg-red-100 text-red-800";
      case "COMMISSION":
        return "bg-blue-100 text-blue-800";
      case "INTERNAL_FEE":
        return "bg-green-100 text-green-800";
      case "OTHER":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">
            Error loading payment details
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Charges Payment Details
          </h1>
          <p className="text-gray-600">{payment.reference_number}</p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate("/charges-payments")}
          >
            Back to List
          </Button>
          {payment.status === "PENDING" && (
            <Button onClick={() => setShowApproveModal(true)}>
              Approve Payment
            </Button>
          )}
          {payment.status === "COMPLETED" && (
            <Button variant="outline" onClick={() => setShowReverseModal(true)}>
              Reverse Payment
            </Button>
          )}
        </div>
      </div>

      {/* Payment Overview */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Payment Overview
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reference Number
              </label>
              <p className="text-sm text-gray-900">
                {payment.reference_number}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChargeTypeColor(
                  payment.type
                )}`}
              >
                {payment.type}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <StatusBadge status={payment.status} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Internal Total Amount
              </label>
              <p className="text-sm text-gray-900">
                {formatToCurrency(payment.internal_total_amount)}{" "}
                {payment.currency?.currency_code}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                External Total Amount
              </label>
              <p className="text-sm text-gray-900">
                {formatToCurrency(payment.external_total_amount)}{" "}
                {payment.currency?.currency_code}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency
              </label>
              <p className="text-sm text-gray-900">
                {payment.currency?.currency_code} -{" "}
                {payment.currency?.currency_name}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Destination Organisation
              </label>
              <p className="text-sm text-gray-900">
                {payment.destination_org?.name || "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Created
              </label>
              <p className="text-sm text-gray-900">
                {new Date(payment.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Completed
              </label>
              <p className="text-sm text-gray-900">
                {payment.date_completed
                  ? new Date(payment.date_completed).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <p className="text-sm text-gray-900">
                {payment.notes || "No notes"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Created By */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Created By</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                User
              </label>
              <p className="text-sm text-gray-900">
                {payment.created_by_user
                  ? `${payment.created_by_user.first_name} ${payment.created_by_user.last_name}`
                  : "N/A"}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-sm text-gray-900">
                {payment.created_by_user?.email || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Items */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">
            Payment Items ({payment.payment_items?.length || 0})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Charge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Beneficiary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Internal Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  External Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payment.payment_items?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.transaction_charges?.transaction?.transaction_no ||
                      "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.transaction_charges?.charge?.name || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.transaction_charges?.transaction?.customer
                      ? `${item.transaction_charges.transaction.customer.full_name}`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.transaction_charges?.transaction?.beneficiary
                      ? `${item.transaction_charges.transaction.beneficiary.name}`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatToCurrency(item.internal_amount_settled)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatToCurrency(item.external_amount_settled)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        title="Approve Charges Payment"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to approve this charges payment? This action
            will mark the payment as completed and update the transaction
            charges status.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>
              <strong>Reference:</strong> {payment.reference_number}
            </p>
            <p>
              <strong>Type:</strong> {payment.type}
            </p>
            <p>
              <strong>Internal Amount:</strong>{" "}
              {formatToCurrency(payment.internal_total_amount)}{" "}
              {payment.currency?.currency_code}
            </p>
            <p>
              <strong>External Amount:</strong>{" "}
              {formatToCurrency(payment.external_total_amount)}{" "}
              {payment.currency?.currency_code}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <Textarea
              placeholder="Enter approval notes..."
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowApproveModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove}>Approve Payment</Button>
          </div>
        </div>
      </Modal>

      {/* Reverse Modal */}
      <Modal
        isOpen={showReverseModal}
        onClose={() => setShowReverseModal(false)}
        title="Reverse Charges Payment"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to reverse this charges payment? This action
            cannot be undone and will mark the payment as failed.
          </p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>
              <strong>Reference:</strong> {payment.reference_number}
            </p>
            <p>
              <strong>Type:</strong> {payment.type}
            </p>
            <p>
              <strong>Internal Amount:</strong>{" "}
              {formatToCurrency(payment.internal_total_amount)}{" "}
              {payment.currency?.currency_code}
            </p>
            <p>
              <strong>External Amount:</strong>{" "}
              {formatToCurrency(payment.external_total_amount)}{" "}
              {payment.currency?.currency_code}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason *
            </label>
            <Input
              placeholder="Enter reason for reversal..."
              value={reverseReason}
              onChange={(e) => setReverseReason(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <Textarea
              placeholder="Enter additional notes..."
              value={reverseNotes}
              onChange={(e) => setReverseNotes(e.target.value)}
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowReverseModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleReverse} disabled={!reverseReason.trim()}>
              Reverse Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ChargesPaymentDetailsPage;
