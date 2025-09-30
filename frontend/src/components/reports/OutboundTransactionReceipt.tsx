import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type { Transaction } from "../../types/TransactionsTypes";
import siteConfig from "../../config/site.config";

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
    backgroundColor: "#FFFFFF",
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginRight: 10,
  },
  companyInfo: {
    flexDirection: "column",
    alignItems: "center",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  companyDescription: {
    fontSize: 10,
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  subHeader: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 8,
    borderBottom: "1px solid #000",
  },
  text: {
    marginBottom: 5,
  },
  table: {
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#F0F0F0",
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    padding: 5,
    textAlign: "center",
  },
  footer: {
    marginTop: 20,
    fontSize: 10,
    color: "#555",
    textAlign: "center",
  },
  draftNote: {
    marginTop: 20,
    fontSize: 10,
    color: "#FF0000",
    textAlign: "center",
    fontWeight: "bold",
    backgroundColor: "#FFE6E6",
    padding: 10,
    border: "1px solid #FF0000",
  },
});

interface OutboundTransactionReceiptProps {
  transaction: Transaction;
}

// Helper function to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Helper function to format currency
const formatCurrency = (
  amount: number | null | undefined,
  currency: string | null | undefined
) => {
  if (amount === null || amount === undefined) return "N/A";
  return `${amount.toFixed(2)} ${currency || ""}`;
};

// Helper function to check if transaction is authorized
const isAuthorized = (transaction: Transaction) => {
  return transaction.status === "APPROVED";
};

// Create Document Component
const OutboundTransactionReceipt = ({
  transaction,
}: OutboundTransactionReceiptProps) => {
  const totalCharges =
    transaction.transaction_charges?.reduce(
      (sum, charge) => sum + charge.amount,
      0
    ) || 0;

  const totalAmountToPay = (transaction.origin_amount || 0) + totalCharges;
  const amountToBeneficiary = transaction.dest_amount || 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Company Logo and Info */}
        <View style={styles.logoContainer}>
          <Image
            src={siteConfig?.logo || "/logo-green.svg"}
            style={styles.logo}
          />
          <View style={styles.companyInfo}>
            <Text style={styles.companyName}>
              {siteConfig?.display_name || "Money Flow"}
            </Text>
            <Text style={styles.companyDescription}>
              {siteConfig?.description || "International Money Transfer"}
            </Text>
          </View>
        </View>

        <Text style={styles.header}>
          International Money Transfer (IMT) Receipt
        </Text>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Transaction Details</Text>
          <Text style={styles.text}>
            Receipt Number: {transaction.transaction_no || "N/A"}
          </Text>
          <Text style={styles.text}>
            Transaction Date: {formatDate(transaction.created_at)}
          </Text>
          <Text style={styles.text}>
            Transaction By: {transaction.created_by_user?.first_name || ""}{" "}
            {transaction.created_by_user?.last_name || ""} via Online Portal
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Sender Details</Text>
          <Text style={styles.text}>
            Name: {transaction.customer?.full_name || "N/A"}
          </Text>
          <Text style={styles.text}>
            Address: {transaction.customer?.address || "N/A"}
          </Text>
          <Text style={styles.text}>
            Contact: {transaction.customer?.phone_number || "N/A"}
          </Text>
          <Text style={styles.text}>
            ID/Reference: {transaction.customer?.id_number || "N/A"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Receiver Details</Text>
          <Text style={styles.text}>
            Name: {transaction.beneficiary?.name || "N/A"}
          </Text>
          <Text style={styles.text}>
            Address: {transaction.beneficiary?.address || "N/A"}
          </Text>
          <Text style={styles.text}>
            Contact: {transaction.beneficiary?.phone || "N/A"}
          </Text>
          <Text style={styles.text}>
            ID/Reference: {transaction.beneficiary?.id_number || "N/A"}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Transfer Details</Text>
          <Text style={styles.text}>
            Origin Organisation (Sent From):{" "}
            {transaction.origin_organisation?.name || "N/A"}
          </Text>
          <Text style={styles.text}>
            Destination Organisation (Agency/Partner):{" "}
            {transaction.destination_organisation?.name || "N/A"}
          </Text>
          <Text style={styles.text}>
            Amount to Send:{" "}
            {formatCurrency(
              transaction.origin_amount,
              transaction.origin_currency?.currency_code
            )}
          </Text>
          <Text style={styles.text}>
            Destination Currency:{" "}
            {transaction.dest_currency?.currency_code || "N/A"}
          </Text>
          <Text style={styles.text}>
            Exchange Rate Applied: 1{" "}
            {transaction.origin_currency?.currency_code || ""} ={" "}
            {transaction.rate || 0}{" "}
            {transaction.dest_currency?.currency_code || ""} (for reference)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Charges Breakdown</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableColHeader}>Charge Type</Text>
              <Text style={styles.tableColHeader}>Description/Details</Text>
              <Text style={styles.tableColHeader}>Amount</Text>
              <Text style={styles.tableColHeader}>Tax</Text>
            </View>
            {transaction?.transaction_charges?.map((charge, index) => (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.tableCol}>{charge.type}</Text>
                <Text style={styles.tableCol}>
                  {charge.description || charge.charge?.name || "N/A"}
                </Text>
                <Text style={styles.tableCol}>
                  {formatCurrency(
                    charge.amount,
                    transaction.origin_currency?.currency_code
                  )}
                </Text>
                <Text style={styles.tableCol}>
                  {charge.type === "TAX"
                    ? formatCurrency(
                        charge.amount,
                        transaction.origin_currency?.currency_code
                      )
                    : "N/A"}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.text}>
            Total Charges:{" "}
            {formatCurrency(
              totalCharges,
              transaction.origin_currency?.currency_code
            )}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.subHeader}>Payment Summary</Text>
          <Text style={styles.text}>
            Total Amount to Pay ({transaction.origin_currency?.currency_code}):{" "}
            {formatCurrency(
              totalAmountToPay,
              transaction.origin_currency?.currency_code
            )}{" "}
            (Amount to Send + Total Charges)
          </Text>
          <Text style={styles.text}>
            Amount to Beneficiary ({transaction.dest_currency?.currency_code}):{" "}
            {formatCurrency(
              amountToBeneficiary,
              transaction.dest_currency?.currency_code
            )}{" "}
            (after conversion and deductions)
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Important Notes:</Text>
          <Text>
            This receipt serves as proof of transaction. Keep it safe for
            reference.
          </Text>
          <Text>
            Funds are subject to regulatory approvals and may take 1-3 business
            days to process.
          </Text>
          <Text>
            For inquiries, contact support at support@example.com or
            +1-800-123-4567.
          </Text>
          <Text>
            All amounts are final and non-refundable unless specified otherwise.
          </Text>
          <Text>Thank you for using our IMT service!</Text>
          <Text style={{ marginTop: 10, fontWeight: "bold" }}>
            {siteConfig?.display_name || "Money Flow"}
          </Text>
        </View>

        {!isAuthorized(transaction) && (
          <View style={styles.draftNote}>
            <Text>DRAFT TRANSACTION - NOT YET AUTHORIZED</Text>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default OutboundTransactionReceipt;
