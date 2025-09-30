import { pdf } from "@react-pdf/renderer";
import OutboundTransactionReceipt from "../components/reports/OutboundTransactionReceipt";
import InboundTransactionReceipt from "../components/reports/InboundTransactionReceipt";
import type { Transaction } from "../types/TransactionsTypes";
import { Direction } from "../types/TransactionsTypes";

export class ReceiptService {
  static async generateReceiptPDF(transaction: Transaction): Promise<Blob> {
    let ReceiptComponent;

    if (transaction.direction === Direction.OUTBOUND) {
      ReceiptComponent = OutboundTransactionReceipt;
    } else {
      ReceiptComponent = InboundTransactionReceipt;
    }

    const pdfBlob = await pdf(ReceiptComponent({ transaction })).toBlob();
    return pdfBlob;
  }

  static async downloadReceipt(transaction: Transaction): Promise<void> {
    try {
      const pdfBlob = await this.generateReceiptPDF(transaction);

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `IMT_Receipt_${
        transaction.transaction_no || transaction.id
      }.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating receipt:", error);
      throw new Error("Failed to generate receipt");
    }
  }
}
