import { z } from "zod";
import { GLTransactionType, GLTransactionStatus, DrCr } from "@prisma/client";

export const glTransactionFiltersSchema = z.object({
  page: z.coerce.number().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .default(10),
  search: z.string().optional(),
  transaction_type: z.enum(Object.values(GLTransactionType)).optional(),
  status: z.enum(Object.values(GLTransactionStatus)).optional(),
  currency_id: z.string().uuid("Invalid currency ID").optional(),
  vault_id: z.string().uuid("Invalid vault ID").optional(),
  user_till_id: z.string().uuid("Invalid user till ID").optional(),
  customer_id: z.string().uuid("Invalid customer ID").optional(),
  transaction_id: z.string().uuid("Invalid transaction ID").optional(),
  date_from: z.string().optional(),
  date_to: z.string().optional(),
});

export const createGlEntrySchema = z.object({
  gl_account_id: z.string().uuid("Invalid GL account ID"),
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Amount must be positive")),
  dr_cr: z.enum(["DR", "CR"]),
  description: z
    .string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),
});

export const createGlTransactionSchema = z.object({
  transaction_type: z.enum(Object.values(GLTransactionType)),
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Amount must be positive")),
  currency_id: z.string().uuid("Invalid currency ID").optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description must be less than 1000 characters"),
  vault_id: z.string().uuid("Invalid vault ID").optional(),
  user_till_id: z.string().uuid("Invalid user till ID").optional(),
  customer_id: z.string().uuid("Invalid customer ID").optional(),
  transaction_id: z.string().uuid("Invalid transaction ID").optional(),
  gl_entries: z
    .array(createGlEntrySchema)
    .min(1, "At least one GL entry is required")
    .refine(
      (entries) => {
        const totalDr = entries
          .filter((e) => e.dr_cr === "DR")
          .reduce((sum, e) => sum + e.amount, 0);
        const totalCr = entries
          .filter((e) => e.dr_cr === "CR")
          .reduce((sum, e) => sum + e.amount, 0);
        return Math.abs(totalDr - totalCr) < 0.01; // Allow for small floating point differences
      },
      {
        message: "Total debits must equal total credits",
      }
    ),
});

export const reverseGlTransactionSchema = z.object({
  description: z
    .string()
    .max(1000, "Description must be less than 1000 characters")
    .optional(),
});
