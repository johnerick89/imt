import { PDFViewer } from "@react-pdf/renderer";
import OutboundTransactionReceipt from "./OutboundTransactionReceipt";
import type { Transaction } from "../../types/TransactionsTypes";
import { Direction } from "../../types/TransactionsTypes";
import InboundTransactionReceipt from "./InboundTransactionReceipt";

interface TransactionReceiptProps {
  transaction: Transaction;
}

const TransactionReceipt = ({ transaction }: TransactionReceiptProps) => {
  const direction = transaction.direction;
  return (
    <PDFViewer>
      {direction === Direction.OUTBOUND ? (
        <OutboundTransactionReceipt transaction={transaction} />
      ) : (
        <InboundTransactionReceipt transaction={transaction} />
      )}
    </PDFViewer>
  );
};

export default TransactionReceipt;
