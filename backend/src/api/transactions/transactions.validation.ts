import { z } from "zod";
import {
  Direction,
  Status,
  RemittanceStatus,
  RequestStatus,
  ChargeType,
} from "@prisma/client";

export const transactionChargeCalculationSchema = z.object({
  charge_id: z.string().uuid("Invalid charge ID"),
  type: z.enum(Object.values(ChargeType) as [ChargeType, ...ChargeType[]]),
  original_rate: z.number().positive("Original rate must be positive"),
  negotiated_rate: z.number().positive("Negotiated rate must be positive"),
});

// Create Outbound Transaction Schema
export const createOutboundTransactionSchema = z.object({
  corridor_id: z.string().uuid("Invalid corridor ID"),
  till_id: z.string().uuid("Invalid till ID"),
  customer_id: z.string().uuid("Invalid customer ID"),
  origin_amount: z.number().positive("Origin amount must be positive"),
  origin_channel_id: z.string().uuid("Invalid origin channel ID"),
  origin_currency_id: z.string().uuid("Invalid origin currency ID"),
  beneficiary_id: z.string().uuid("Invalid beneficiary ID"),
  dest_amount: z.number().positive("Destination amount must be positive"),
  dest_channel_id: z.string().uuid("Invalid destination channel ID"),
  dest_currency_id: z.string().uuid("Invalid destination currency ID"),
  rate: z.number().positive("Rate must be positive"),
  internal_exchange_rate: z
    .number()
    .positive("Internal exchange rate must be positive")
    .optional(),
  inflation: z.number().min(0, "Inflation cannot be negative").optional(),
  markup: z.number().min(0, "Markup cannot be negative").optional(),
  purpose: z
    .string()
    .max(256, "Purpose must be less than 256 characters")
    .optional(),
  funds_source: z
    .string()
    .max(256, "Funds source must be less than 256 characters")
    .optional(),
  relationship: z
    .string()
    .max(256, "Relationship must be less than 256 characters")
    .optional(),
  remarks: z
    .string()
    .max(1024, "Remarks must be less than 1024 characters")
    .optional(),
  exchange_rate_id: z.string().uuid("Invalid exchange rate ID").optional(),
  external_exchange_rate_id: z
    .string()
    .uuid("Invalid external exchange rate ID")
    .optional(),
  destination_organisation_id: z
    .string()
    .uuid("Invalid destination organisation ID")
    .optional(),
  origin_country_id: z.string().uuid("Invalid origin country ID").optional(),
  destination_country_id: z
    .string()
    .uuid("Invalid destination country ID")
    .optional(),
  amount_to_send_base_currency: z
    .number()
    .positive("Amount to send base currency must be positive")
    .optional(),
  amount_to_send_destination_currency: z
    .number()
    .positive("Amount to send destination currency must be positive")
    .optional(),
  transaction_charges: z.array(transactionChargeCalculationSchema).optional(),
});

// Create Inbound Transaction Schema
export const createInboundTransactionSchema = z.object({
  corridor_id: z.string().uuid("Invalid corridor ID"),
  customer_id: z.string().uuid("Invalid customer ID"),
  origin_amount: z.number().positive("Origin amount must be positive"),
  origin_channel_id: z.string().uuid("Invalid origin channel ID"),
  origin_currency_id: z.string().uuid("Invalid origin currency ID"),
  beneficiary_id: z.string().uuid("Invalid beneficiary ID"),
  dest_amount: z.number().positive("Destination amount must be positive"),
  dest_channel_id: z.string().uuid("Invalid destination channel ID"),
  dest_currency_id: z.string().uuid("Invalid destination currency ID"),
  rate: z.number().positive("Rate must be positive"),
  internal_exchange_rate: z
    .number()
    .positive("Internal exchange rate must be positive")
    .optional(),
  inflation: z.number().min(0, "Inflation cannot be negative").optional(),
  markup: z.number().min(0, "Markup cannot be negative").optional(),
  purpose: z
    .string()
    .max(256, "Purpose must be less than 256 characters")
    .optional(),
  funds_source: z
    .string()
    .max(256, "Funds source must be less than 256 characters")
    .optional(),
  relationship: z
    .string()
    .max(256, "Relationship must be less than 256 characters")
    .optional(),
  remarks: z
    .string()
    .max(1024, "Remarks must be less than 1024 characters")
    .optional(),
  exchange_rate_id: z.string().uuid("Invalid exchange rate ID").optional(),
  external_exchange_rate_id: z
    .string()
    .uuid("Invalid external exchange rate ID")
    .optional(),
  destination_organisation_id: z
    .string()
    .uuid("Invalid destination organisation ID")
    .optional(),
  origin_country_id: z.string().uuid("Invalid origin country ID").optional(),
  destination_country_id: z
    .string()
    .uuid("Invalid destination country ID")
    .optional(),
});

// Update Transaction Schema
export const updateTransactionSchema = z.object({
  corridor_id: z.string().uuid("Invalid corridor ID").optional(),
  till_id: z.string().uuid("Invalid till ID").optional(),
  customer_id: z.string().uuid("Invalid customer ID").optional(),
  origin_amount: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Origin amount must be positive"))
    .optional(),
  origin_channel_id: z.string().uuid("Invalid origin channel ID").optional(),
  origin_currency_id: z.string().uuid("Invalid origin currency ID").optional(),
  beneficiary_id: z.string().uuid("Invalid beneficiary ID").optional(),
  dest_amount: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Destination amount must be positive"))
    .optional(),
  dest_channel_id: z.string().uuid("Invalid destination channel ID").optional(),
  dest_currency_id: z
    .string()
    .uuid("Invalid destination currency ID")
    .optional(),
  rate: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Rate must be positive"))
    .optional(),
  internal_exchange_rate: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Internal exchange rate must be positive"))
    .optional(),
  inflation: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Inflation cannot be negative"))
    .optional(),
  markup: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Markup cannot be negative"))
    .optional(),
  purpose: z
    .string()
    .max(256, "Purpose must be less than 256 characters")
    .optional(),
  funds_source: z
    .string()
    .max(256, "Funds source must be less than 256 characters")
    .optional(),
  relationship: z
    .string()
    .max(256, "Relationship must be less than 256 characters")
    .optional(),
  remarks: z
    .string()
    .max(1024, "Remarks must be less than 1024 characters")
    .optional(),
  exchange_rate_id: z.string().uuid("Invalid exchange rate ID").optional(),
  external_exchange_rate_id: z
    .string()
    .uuid("Invalid external exchange rate ID")
    .optional(),
  destination_organisation_id: z
    .string()
    .uuid("Invalid destination organisation ID")
    .optional(),
});

// Transaction Filters Schema
export const transactionFiltersSchema = z.object({
  page: z.preprocess(
    (val) => (val ? parseInt(val as string) : 1),
    z.number().int().positive().optional()
  ),
  limit: z.preprocess(
    (val) => (val ? parseInt(val as string) : 10),
    z.number().int().positive().max(100).optional()
  ),
  search: z.string().optional(),
  direction: z
    .enum(Object.values(Direction) as [Direction, ...Direction[]])
    .optional(),
  status: z.enum(Object.values(Status) as [Status, ...Status[]]).optional(),
  remittance_status: z
    .enum(
      Object.values(RemittanceStatus) as [
        RemittanceStatus,
        ...RemittanceStatus[]
      ]
    )
    .optional(),
  request_status: z
    .enum(Object.values(RequestStatus) as [RequestStatus, ...RequestStatus[]])
    .optional(),
  corridor_id: z.string().uuid("Invalid corridor ID").optional(),
  till_id: z.string().uuid("Invalid till ID").optional(),
  customer_id: z.string().uuid("Invalid customer ID").optional(),
  origin_currency_id: z.string().uuid("Invalid origin currency ID").optional(),
  dest_currency_id: z
    .string()
    .uuid("Invalid destination currency ID")
    .optional(),
  origin_organisation_id: z
    .string()
    .uuid("Invalid origin organisation ID")
    .optional(),
  destination_organisation_id: z
    .string()
    .uuid("Invalid destination organisation ID")
    .optional(),
  created_by: z.string().uuid("Invalid created by user ID").optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
  amount_min: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Minimum amount cannot be negative"))
    .optional(),
  amount_max: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Maximum amount cannot be negative"))
    .optional(),
});

// Cancel Transaction Schema
export const cancelTransactionSchema = z.object({
  reason: z
    .string()
    .max(500, "Reason must be less than 500 characters")
    .optional(),
});

// Approve Transaction Schema
export const approveTransactionSchema = z.object({
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional(),
});

// Mark as Ready Transaction Schema
export const markAsReadySchema = z.object({
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional(),
  assigned_to: z.string().uuid("Invalid assigned user ID").optional(),
});

// Reassign Transaction Schema
export const reassignTransactionSchema = z.object({
  assigned_to: z.string().uuid("Invalid assigned user ID"),
  remarks: z.string().max(500, "Remarks must be less than 500 characters"),
});

// Reverse Transaction Schema
export const reverseTransactionSchema = z.object({
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(500, "Reason must be less than 500 characters"),
  remarks: z
    .string()
    .max(500, "Remarks must be less than 500 characters")
    .optional(),
});
