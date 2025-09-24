import { z } from "zod";
import { ChargeType, ChargesPaymentStatus } from "@prisma/client";

// Create Charges Payment Schema
export const createChargesPaymentSchema = z.object({
  transaction_charge_ids: z
    .array(z.string().uuid("Invalid transaction charge ID"))
    .min(1, "At least one transaction charge must be selected"),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

// Approve Charges Payment Schema
export const approveChargesPaymentSchema = z.object({
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

// Reverse Charges Payment Schema
export const reverseChargesPaymentSchema = z.object({
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(500, "Reason must be less than 500 characters"),
  notes: z
    .string()
    .max(500, "Notes must be less than 500 characters")
    .optional(),
});

// Charges Payment Filters Schema
export const chargesPaymentFiltersSchema = z.object({
  page: z.preprocess(
    (val) => (val ? parseInt(val as string) : 1),
    z.number().int().positive().optional()
  ),
  limit: z.preprocess(
    (val) => (val ? parseInt(val as string) : 10),
    z.number().int().positive().max(100).optional()
  ),
  search: z.string().optional(),
  type: z
    .enum(Object.values(ChargeType) as [ChargeType, ...ChargeType[]])
    .optional(),
  status: z
    .enum(
      Object.values(ChargesPaymentStatus) as [
        ChargesPaymentStatus,
        ...ChargesPaymentStatus[]
      ]
    )
    .optional(),
  destination_org_id: z
    .string()
    .uuid("Invalid destination organisation ID")
    .optional(),
  currency_id: z.string().uuid("Invalid currency ID").optional(),
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

// Pending Transaction Charges Filters Schema
export const pendingTransactionChargesFiltersSchema = z.object({
  page: z.preprocess(
    (val) => (val ? parseInt(val as string) : 1),
    z.number().int().positive().optional()
  ),
  limit: z.preprocess(
    (val) => (val ? parseInt(val as string) : 10),
    z.number().int().positive().max(100).optional()
  ),
  search: z.string().optional(),
  type: z
    .enum(Object.values(ChargeType) as [ChargeType, ...ChargeType[]])
    .optional(),
  destination_org_id: z
    .string()
    .uuid("Invalid destination organisation ID")
    .optional(),
  currency_id: z.string().uuid("Invalid currency ID").optional(),
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
