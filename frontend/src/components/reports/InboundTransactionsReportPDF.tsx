import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import siteConfig from "../../config/site.config";
import type { Transaction } from "../../types/TransactionsTypes";

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
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    borderBottom: "1 solid #333",
    paddingBottom: 5,
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "12.5%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCell: {
    margin: "auto",
    marginTop: 5,
    fontSize: 10,
    padding: 5,
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f9f9f9",
    border: "1 solid #ddd",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontWeight: "bold",
  },
  summaryValue: {
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 10,
    color: "#666",
  },
});

interface OutboundTransactionsReportPDFProps {
  data: Transaction[];
  filters: Record<string, unknown>;
  reportMetadata: {
    name: string;
    description: string;
  };
}

export const InboundTransactionsReportPDF: React.FC<
  OutboundTransactionsReportPDFProps
> = ({ data, filters, reportMetadata }) => {
  // Calculate summary statistics
  const totalTransactions = data.length;
  const totalAmount = data.reduce(
    (sum, item) => sum + (Number(item.dest_amount) || 0),
    0
  );
  const totalCharges = data.reduce(
    (sum, item) => sum + (Number(item.total_all_charges) || 0),
    0
  );
  const totalPayable = data.reduce(
    (sum, item) => sum + (Number(item.amount_payable) || 0),
    0
  );

  // Get unique currencies
  const currencies = [
    ...new Set(
      data.map((item) => item.dest_currency?.currency_code).filter(Boolean)
    ),
  ];

  // Get date range
  const dates = data
    .map((item) => item.created_at)
    .filter((date): date is string => !!date)
    .map((date) => new Date(date))
    .sort((a, b) => a.getTime() - b.getTime());
  const dateRange =
    dates.length > 0
      ? `${dates[0].toLocaleDateString()} - ${dates[
          dates.length - 1
        ].toLocaleDateString()}`
      : "N/A";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
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

        <Text style={styles.header}>{reportMetadata.name}</Text>

        {/* Report Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Report Information</Text>
          <Text>Generated on: {new Date().toLocaleDateString()}</Text>
          <Text>Date Range: {dateRange}</Text>
          <Text>Total Records: {totalTransactions}</Text>
          {typeof filters.organisation_id === "string" ||
          typeof filters.organisation_id === "number" ? (
            <Text>Organisation ID: {String(filters.organisation_id)}</Text>
          ) : null}
          {typeof filters.currency_id === "string" ||
          typeof filters.currency_id === "number" ? (
            <Text>Currency ID: {String(filters.currency_id)}</Text>
          ) : null}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Transactions:</Text>
            <Text style={styles.summaryValue}>{totalTransactions}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Amount to Send:</Text>
            <Text style={styles.summaryValue}>
              {formatToCurrency(totalAmount)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Charges:</Text>
            <Text style={styles.summaryValue}>
              {formatToCurrency(totalCharges)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Payable:</Text>
            <Text style={styles.summaryValue}>
              {formatToCurrency(totalPayable)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Currencies:</Text>
            <Text style={styles.summaryValue}>{currencies.join(", ")}</Text>
          </View>
        </View>

        {/* Data Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Transaction No</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Amount To Send</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Total Received</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Total Charges</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Currency</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Status</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Sender</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Receiver</Text>
              </View>
            </View>

            {/* Table Rows */}
            {data.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.transaction_no || "N/A"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {formatToCurrency(Number(item.dest_amount) || 0)}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {formatToCurrency(Number(item.amount_payable) || 0)}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {formatToCurrency(Number(item.total_all_charges) || 0)}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.dest_currency?.currency_code || "N/A"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text
                    style={styles.tableCell}
                  >{`${item.status} - ${item.remittance_status}`}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.sender_trasaction_party?.name || "N/A"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.receiver_trasaction_party?.name || "N/A"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          This report was generated on {new Date().toLocaleString()} by{" "}
          {siteConfig?.display_name || "Money Flow"}
        </Text>
      </Page>
    </Document>
  );
};

// Helper function for currency formatting
const formatToCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};
