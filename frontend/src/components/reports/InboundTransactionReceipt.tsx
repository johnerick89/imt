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
    width: "33.33%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    backgroundColor: "#F0F0F0",
    padding: 5,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableCol: {
    width: "33.33%",
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
});

interface OutboundTransactionReceiptProps {
  transaction: Transaction;
}

// Create Document Component
// Helper function to safely access metadata
const getMetadataValue = (
  metadata: Record<string, unknown> | null | undefined,
  key: string
): string => {
  if (!metadata || typeof metadata !== "object") return "N/A";
  const value = metadata[key];
  return typeof value === "string" ? value : "N/A";
};

const InboundTransactionReceipt = ({
  transaction,
}: OutboundTransactionReceiptProps) => (
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
          Receipt Number: {transaction.transaction_no}
        </Text>
        <Text style={styles.text}>
          Transaction Date: {transaction.created_at}
        </Text>
        <Text style={styles.text}>
          Transaction By: {transaction.created_by_user?.first_name}{" "}
          {transaction.created_by_user?.last_name}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Sender Details</Text>
        <Text style={styles.text}>
          Name: {transaction.sender_trasaction_party?.name || "N/A"}
        </Text>
        <Text style={styles.text}>
          Address:{" "}
          {getMetadataValue(
            transaction.sender_trasaction_party?.metadata,
            "address"
          )}
        </Text>
        <Text style={styles.text}>
          Contact:{" "}
          {getMetadataValue(
            transaction.sender_trasaction_party?.metadata,
            "phone"
          ) ||
            getMetadataValue(
              transaction.sender_trasaction_party?.metadata,
              "email"
            ) ||
            "N/A"}
        </Text>
        <Text style={styles.text}>
          ID/Reference:{" "}
          {transaction.sender_trasaction_party?.id_number || "N/A"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Receiver Details</Text>
        <Text style={styles.text}>
          Name: {transaction.receiver_trasaction_party?.name || "N/A"}
        </Text>
        <Text style={styles.text}>
          Address:{" "}
          {getMetadataValue(
            transaction.receiver_trasaction_party?.metadata,
            "address"
          )}
        </Text>
        <Text style={styles.text}>
          Contact:{" "}
          {getMetadataValue(
            transaction.receiver_trasaction_party?.metadata,
            "phone"
          ) ||
            getMetadataValue(
              transaction.receiver_trasaction_party?.metadata,
              "email"
            ) ||
            "N/A"}
        </Text>
        <Text style={styles.text}>
          ID/Reference:{" "}
          {transaction.receiver_trasaction_party?.id_number || "N/A"}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Transfer Details</Text>
        <Text style={styles.text}>
          Origin Organisation: {transaction.origin_organisation?.name}
        </Text>
        <Text style={styles.text}>
          Destination Organisation: {transaction.destination_organisation?.name}
        </Text>
        <Text style={styles.text}>
          Amount to Send: {transaction?.origin_amount}{" "}
          {transaction?.origin_currency?.currency_code}
        </Text>
        <Text style={styles.text}>
          Destination Currency: {transaction?.dest_currency?.currency_code}
        </Text>
        <Text style={styles.text}>
          Exchange Rate: 1 {transaction?.origin_currency?.currency_code || ""} ={" "}
          {transaction.rate || 0}{" "}
          {transaction?.dest_currency?.currency_code || ""}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Charges Breakdown</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={styles.tableColHeader}>Charge Type</Text>
            <Text style={styles.tableColHeader}>Description</Text>
            <Text style={styles.tableColHeader}>Amount</Text>
          </View>
          {transaction?.transaction_charges?.map((charge, index) => (
            <View style={styles.tableRow} key={index}>
              <Text style={styles.tableCol}>{charge.type}</Text>
              <Text style={styles.tableCol}>{charge.description}</Text>
              <Text style={styles.tableCol}>
                {charge.amount} {transaction.origin_currency?.currency_code}
              </Text>
            </View>
          ))}
        </View>
        <Text style={styles.text}>
          Total Charges:{" "}
          {transaction?.transaction_charges?.reduce(
            (acc, charge) => acc + charge.amount,
            0
          )}{" "}
          {transaction.origin_currency?.currency_code}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subHeader}>Payment Summary</Text>
        <Text style={styles.text}>
          Total Amount to Pay ({transaction.origin_currency?.currency_code}):{" "}
          {transaction?.amount_payable}
        </Text>
        <Text style={styles.text}>
          Amount to Beneficiary ({transaction?.dest_currency?.currency_code}):{" "}
          {transaction?.amount_receivable}
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
    </Page>
  </Document>
);

export default InboundTransactionReceipt;
