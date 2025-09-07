import { z } from "zod";

export const createBankAccountSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters"),
  account_number: z
    .string()
    .min(1, "Account number is required")
    .max(50, "Account number must be less than 50 characters"),
  bank_name: z
    .string()
    .min(1, "Bank name is required")
    .max(100, "Bank name must be less than 100 characters"),
  swift_code: z
    .string()
    .max(11, "SWIFT code must be less than 11 characters")
    .optional(),
  currency_id: z.string().uuid("Invalid currency ID"),
  organisation_id: z.string().uuid("Invalid organisation ID").optional(),
  balance: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Balance must be positive")),
  locked_balance: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Locked balance must be positive"))
    .optional(),
});

export const updateBankAccountSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters")
    .optional(),
  account_number: z
    .string()
    .min(1, "Account number is required")
    .max(50, "Account number must be less than 50 characters")
    .optional(),
  bank_name: z
    .string()
    .min(1, "Bank name is required")
    .max(100, "Bank name must be less than 100 characters")
    .optional(),
  swift_code: z
    .string()
    .max(11, "SWIFT code must be less than 11 characters")
    .optional(),
  currency_id: z.string().uuid("Invalid currency ID").optional(),
  organisation_id: z.string().uuid("Invalid organisation ID").optional(),
  balance: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Balance must be positive"))
    .optional(),
  locked_balance: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Locked balance must be positive"))
    .optional(),
});

export const bankAccountFiltersSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .default(1),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .default(10),
  search: z.string().optional(),
  currency_id: z.string().uuid().optional(),
  organisation_id: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
});

export const topupSchema = z.object({
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Amount must be positive")),
  source_type: z.enum(["BANK_ACCOUNT", "VAULT"]),
  source_id: z.string().uuid("Invalid source ID"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export const withdrawalSchema = z.object({
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Amount must be positive")),
  destination_type: z.enum(["BANK_ACCOUNT", "VAULT"]),
  destination_id: z.string().uuid("Invalid destination ID"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});
