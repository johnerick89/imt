import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import siteConfig from "../../config/site.config";
import type { TransactionCharge } from "../../types/TransactionsTypes";

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
  },
  summaryContainer: {
    backgroundColor: "#f8f9fa",
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  summaryLabel: {
    fontWeight: "bold",
    color: "#333",
  },
  summaryValue: {
    color: "#666",
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  tableHeader: {
    backgroundColor: "#f8f9fa",
    flexDirection: "row",
  },
  tableHeaderCell: {
    padding: 8,
    fontSize: 10,
    fontWeight: "bold",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ddd",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableCol: {
    flex: 1,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableCell: {
    padding: 8,
    fontSize: 10,
    textAlign: "center",
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

interface TaxesReportPDFProps {
  data: TransactionCharge[];
  filters: Record<string, unknown>;
  reportMetadata: {
    name: string;
    description: string;
  };
}

export const TaxesReportPDF: React.FC<TaxesReportPDFProps> = ({
  data,
  filters,
  reportMetadata,
}) => {
  // Calculate summary statistics
  const totalTaxes = data.length;
  const totalTaxAmount = data.reduce(
    (sum, item) => sum + (item.amount || 0),
    0
  );
  const totalVAT = data.reduce(
    (sum, item) =>
      sum + (item.charge?.name?.includes("VAT") ? item.amount || 0 : 0),
    0
  );
  const totalIncomeTax = data.reduce(
    (sum, item) =>
      sum + (item.charge?.name?.includes("Income") ? item.amount || 0 : 0),
    0
  );

  // Get unique tax types
  const taxTypes = [
    ...new Set(data.map((item) => item.charge?.name).filter(Boolean)),
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
          <Text>Total Records: {totalTaxes}</Text>
          {typeof filters.organisation_id === "string" ||
          typeof filters.organisation_id === "number" ? (
            <Text>Organisation ID: {String(filters.organisation_id)}</Text>
          ) : null}
          {typeof filters.currency_id === "string" ||
          typeof filters.currency_id === "number" ? (
            <Text>Currency ID: {String(filters.currency_id)}</Text>
          ) : null}
        </View>

        {/* Report Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Summary</Text>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Report Period:</Text>
              <Text style={styles.summaryValue}>{dateRange}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Tax Records:</Text>
              <Text style={styles.summaryValue}>{totalTaxes}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Tax Amount:</Text>
              <Text style={styles.summaryValue}>
                {formatToCurrency(totalTaxAmount)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total VAT:</Text>
              <Text style={styles.summaryValue}>
                {formatToCurrency(totalVAT)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total Income Tax:</Text>
              <Text style={styles.summaryValue}>
                {formatToCurrency(totalIncomeTax)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax Types:</Text>
              <Text style={styles.summaryValue}>{taxTypes.join(", ")}</Text>
            </View>
          </View>
        </View>

        {/* Taxes Table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tax Details</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
              <View style={[styles.tableHeaderCell, { flex: 1.5 }]}>
                <Text>Transaction</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1.5 }]}>
                <Text>Tax Type</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text>Amount</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text>Currency</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1.5 }]}>
                <Text>Corridor</Text>
              </View>
              <View style={[styles.tableHeaderCell, { flex: 1 }]}>
                <Text>Date</Text>
              </View>
            </View>

            {/* Table Rows */}
            {data.map((item, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.transaction?.transaction_no || "N/A"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.charge?.name || "N/A"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {formatToCurrency(item.amount || 0)}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.transaction?.origin_currency?.currency_code || "N/A"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.transaction?.corridor?.organisation?.name || "N/A"}
                  </Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : "N/A"}
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

// Helper function to format currency
const formatToCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};
