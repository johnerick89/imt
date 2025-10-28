import { z } from "zod";

// Base validation schema with common fields
const baseReportSchema = z.object({
  organisation_id: z.string().optional(),
  currency_id: z.string().optional(),
  date_from: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Optional field
        const date = new Date(val);
        return !isNaN(date.getTime()) && val.includes("T") && val.includes("Z");
      },
      {
        message:
          "date_from must be a valid ISO datetime string (e.g., '2024-01-01T00:00:00.000Z')",
      }
    )
    .transform((val) => (val ? new Date(val) : undefined)),
  date_to: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true; // Optional field
        const date = new Date(val);
        return !isNaN(date.getTime()) && val.includes("T") && val.includes("Z");
      },
      {
        message:
          "date_to must be a valid ISO datetime string (e.g., '2024-01-01T00:00:00.000Z')",
      }
    )
    .transform((val) => (val ? new Date(val) : undefined)),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1))
    .optional()
    .default(1),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(1000))
    .optional()
    .default(100),
});

// Outbound Transactions Report
export const outboundTransactionsReportSchema = baseReportSchema.extend({
  status: z.string().optional(),
  corridor_id: z.string().optional(),
  customer_id: z.string().optional(),
});

// Inbound Transactions Report
export const inboundTransactionsReportSchema = baseReportSchema.extend({
  status: z.string().optional(),
  corridor_id: z.string().optional(),
  customer_id: z.string().optional(),
});

// Commissions & Other Revenues Report
export const commissionsReportSchema = baseReportSchema.extend({
  charge_type: z.string().optional(),
  corridor_id: z.string().optional(),
});

// Taxes Report
export const taxesReportSchema = baseReportSchema.extend({
  tax_type: z.string().optional(),
});

// User Tills Report
export const userTillsReportSchema = baseReportSchema.extend({
  user_id: z.string().optional(),
  till_id: z.string().optional(),
  status: z.string().optional(),
});

// Balances History Report
export const balancesHistoryReportSchema = baseReportSchema.extend({
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
});

// Organisation Balances History Report
export const organisationBalancesHistoryReportSchema = baseReportSchema.extend({
  organisation_id: z.string().optional(),
});

// GL Accounts Report
export const glAccountsReportSchema = baseReportSchema.extend({
  account_id: z.string().optional(),
  type: z.string().optional(),
});

// Profit and Loss Report
export const profitLossReportSchema = baseReportSchema;

// Balance Sheet Report
export const balanceSheetReportSchema = baseReportSchema;

// Partner Balances Report
export const partnerBalancesReportSchema = baseReportSchema.extend({
  partner_org_id: z.string().optional(),
});

// Customer and Beneficiary Compliance Report
export const complianceReportSchema = baseReportSchema.extend({
  risk_rating: z.string().optional(),
  customer_type: z.string().optional(),
  nationality: z.string().optional(),
});

// Exchange Rates Report
export const exchangeRatesReportSchema = baseReportSchema.extend({
  corridor_id: z.string().optional(),
  currency_pair: z.string().optional(),
});

// Audit Trail Report
export const auditTrailReportSchema = baseReportSchema.extend({
  user_id: z.string().optional(),
  entity_type: z.string().optional(),
});

// Corridor Performance Report
export const corridorPerformanceReportSchema = baseReportSchema.extend({
  corridor_id: z.string().optional(),
});

// User Performance Report
export const userPerformanceReportSchema = baseReportSchema.extend({
  user_id: z.string().optional(),
  till_id: z.string().optional(),
});

// Integration Status Report
export const integrationStatusReportSchema = baseReportSchema.extend({
  integration_type: z.string().optional(),
  partner_org_id: z.string().optional(),
});

// Cash Position Report
export const cashPositionReportSchema = baseReportSchema.extend({
  entity_type: z.string().optional(),
  entity_id: z.string().optional(),
});
