import React, { useState } from "react";
import { Modal } from "./ui/Modal";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Textarea";
import { formatToCurrency } from "../utils/textUtils";
import type { Transaction } from "../types/TransactionsTypes";

interface ApproveTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (remarks: string) => void;
  transaction: Transaction | null;
  isLoading?: boolean;
}

export const ApproveTransactionModal: React.FC<
  ApproveTransactionModalProps
> = ({ isOpen, onClose, onApprove, transaction, isLoading = false }) => {
  const [remarks, setRemarks] = useState("");

  const handleApprove = () => {
    onApprove(remarks);
    setRemarks("");
  };

  const handleClose = () => {
    setRemarks("");
    onClose();
  };

  if (!transaction) return null;

  const approveTitle =
    transaction.direction === "OUTBOUND"
      ? "Approve Transaction"
      : "Pay Recipient";
  const approveDescription =
    transaction.direction === "OUTBOUND"
      ? "Are you sure you want to approve this transaction?"
      : "Are you sure you want to pay this recipient?";

  const sender =
    transaction.direction === "OUTBOUND"
      ? transaction.customer?.full_name
      : transaction.sender_trasaction_party?.name;

  const receiver =
    transaction.direction === "OUTBOUND"
      ? transaction.beneficiary?.name
      : transaction.receiver_trasaction_party?.name;

  const approveButtonText = isLoading
    ? transaction.direction === "OUTBOUND"
      ? "Approving..."
      : "Paying..."
    : transaction.direction === "OUTBOUND"
    ? "Approve Transaction"
    : "Pay Recipient";

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={approveTitle} size="md">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{approveDescription}</p>

        {transaction && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p>
              <strong>Transaction:</strong> {transaction.transaction_no}
            </p>
            <p>
              <strong>Amount:</strong>{" "}
              {formatToCurrency(transaction.origin_amount)}{" "}
              {transaction.origin_currency?.currency_code}
            </p>
            <p>
              <strong>Sender:</strong> {sender || "Unknown Sender"}
            </p>
            <p>
              <strong>Recipient:</strong> {receiver || "Unknown Recipient"}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {transaction.direction === "OUTBOUND"
              ? "Approval Remarks (Optional)"
              : "Payment Remarks (Optional)"}
          </label>
          <Textarea
            placeholder="Enter any remarks for this approval..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {approveButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ApproveTransactionModal;
