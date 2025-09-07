import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Textarea } from "./Textarea";
import type { GlTransaction } from "../types/GlTransactionsTypes";

interface ReverseGlTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (description?: string) => void;
  transaction: GlTransaction | null;
  isLoading?: boolean;
}

const ReverseGlTransactionModal: React.FC<ReverseGlTransactionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  transaction,
  isLoading = false,
}) => {
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(description.trim() || undefined);
  };

  const handleClose = () => {
    setDescription("");
    onClose();
  };

  if (!transaction) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reverse GL Transaction"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Transaction Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Transaction to Reverse
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Type:</span>
              <span className="text-sm text-gray-900">
                {transaction.transaction_type.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">Amount:</span>
              <span className="text-sm text-gray-900">
                {transaction.amount.toLocaleString()}{" "}
                {transaction.currency?.currency_code || "N/A"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">
                Description:
              </span>
              <span className="text-sm text-gray-900">
                {transaction.description}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-500">
                Created:
              </span>
              <span className="text-sm text-gray-900">
                {new Date(transaction.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Warning: This action cannot be undone
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Reversing this transaction will create a new reversal
                  transaction with opposite GL entries. This will affect account
                  balances and cannot be automatically undone.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reversal Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Reversal Description (Optional)
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description for this reversal transaction..."
            rows={3}
            maxLength={1000}
          />
          <p className="mt-1 text-xs text-gray-500">
            If left empty, a default description will be generated.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" variant="destructive" disabled={isLoading}>
            {isLoading ? "Reversing..." : "Reverse Transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ReverseGlTransactionModal;
