import { pdf } from "@react-pdf/renderer";
import { OutboundTransactionsReportPDF } from "../components/reports/OutboundTransactionsReportPDF";
import { InboundTransactionsReportPDF } from "../components/reports/InboundTransactionsReportPDF";
import { CommissionsReportPDF } from "../components/reports/CommissionsReportPDF";
import { TaxesReportPDF } from "../components/reports/TaxesReportPDF";
import { ReportType } from "../types/ReportsTypes";

export class ReportsPDFService {
  static async generateReportPDF(
    reportType: ReportType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[],
    filters: Record<string, unknown>,
    reportMetadata: { name: string; description: string }
  ): Promise<Blob> {
    let ReportComponent;

    switch (reportType) {
      case ReportType.OUTBOUND_TRANSACTIONS:
        ReportComponent = OutboundTransactionsReportPDF;
        break;
      case ReportType.INBOUND_TRANSACTIONS:
        ReportComponent = InboundTransactionsReportPDF;
        break;
      case ReportType.COMMISSIONS:
        ReportComponent = CommissionsReportPDF;
        break;
      case ReportType.TAXES:
        ReportComponent = TaxesReportPDF;
        break;
      default:
        throw new Error(`PDF export not implemented for ${reportType}`);
    }

    const pdfBlob = await pdf(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ReportComponent({ data, filters, reportMetadata }) as any
    ).toBlob();
    return pdfBlob;
  }

  static async downloadReportPDF(
    reportType: ReportType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any[],
    filters: Record<string, unknown>,
    reportMetadata: { name: string; description: string },
    filename?: string
  ): Promise<void> {
    try {
      const pdfBlob = await this.generateReportPDF(
        reportType,
        data,
        filters,
        reportMetadata
      );

      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        filename ||
        `${reportMetadata.name.replace(/\s+/g, "_")}_${
          new Date().toISOString().split("T")[0]
        }.pdf`;

      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating report PDF:", error);
      throw new Error("Failed to generate report PDF");
    }
  }
}
