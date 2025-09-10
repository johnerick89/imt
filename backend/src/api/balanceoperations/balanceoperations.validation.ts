import { z } from "zod";

export const balanceOperationSchema = z.object({
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Amount must be positive")),
  source_type: z.enum(["BANK_ACCOUNT", "VAULT", "TILL"]).optional(),
  source_id: z.string().uuid("Invalid source ID").optional(),
  destination_type: z.enum(["BANK_ACCOUNT", "VAULT", "TILL"]).optional(),
  destination_id: z.string().uuid("Invalid destination ID").optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export const orgBalanceOperationSchema = z.object({
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Amount must be positive")),
  source_type: z.literal("BANK_ACCOUNT").optional().default("BANK_ACCOUNT"),
  source_id: z.string().uuid("Invalid source ID"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export const tillBalanceOperationSchema = z.object({
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Amount must be positive")),
  source_type: z.literal("VAULT").optional().default("VAULT"),
  source_id: z.string().uuid("Invalid source ID"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export const vaultBalanceOperationSchema = z.object({
  amount: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().positive("Amount must be positive")),
  source_type: z.literal("BANK_ACCOUNT").optional().default("BANK_ACCOUNT"),
  source_id: z.string().uuid("Invalid source ID"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
});

export const orgBalanceFiltersSchema = z.object({
  page: z.coerce.number().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .default(10),
  search: z.string().optional(),
  base_org_id: z.string().uuid().optional(),
  dest_org_id: z.string().uuid().optional(),
  currency_id: z.string().uuid().optional(),
});
