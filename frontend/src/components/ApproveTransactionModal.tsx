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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Approve Transaction"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Are you sure you want to approve this transaction?
        </p>

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
              <strong>Sender:</strong>{" "}
              {transaction.customer?.full_name || "Unknown Sender"}
            </p>
            <p>
              <strong>Receiver:</strong>{" "}
              {transaction.beneficiary?.name || "Unknown Receiver"}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Approval Remarks (Optional)
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
            {isLoading ? "Approving..." : "Approve Transaction"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ApproveTransactionModal;
