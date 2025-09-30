import React from "react";
import { Button } from "../ui/Button";
import { FiDownload } from "react-icons/fi";
import { ReceiptService } from "../../services/ReceiptService";
import type { Transaction } from "../../types/TransactionsTypes";

interface ReceiptDownloadButtonProps {
  transaction: Transaction;
  className?: string;
  variant?: "default" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
}

export const ReceiptDownloadButton: React.FC<ReceiptDownloadButtonProps> = ({
  transaction,
  className = "",
  variant = "outline",
  size = "sm",
}) => {
  const handleDownloadReceipt = async () => {
    try {
      await ReceiptService.downloadReceipt(transaction);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      // You might want to show a toast notification here
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownloadReceipt}
      className={`flex items-center gap-2 ${className}`}
    >
      <FiDownload className="h-4 w-4" />
      Download Receipt
    </Button>
  );
};
