import { z } from "zod";
import { GlAccountType } from "@prisma/client";

export const createGlAccountSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters"),
  type: z.enum(Object.values(GlAccountType) as [string, ...string[]], {
    message: "Invalid account type",
  }),
  balance: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Balance must be non-negative"))
    .optional(),
  currency_id: z.string().uuid("Invalid currency ID").optional(),
  locked_balance: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Locked balance must be non-negative"))
    .optional(),
  max_balance: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Max balance must be non-negative"))
    .optional(),
  min_balance: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Min balance must be non-negative"))
    .optional(),
  organisation_id: z.string().uuid("Invalid organisation ID").optional(),
  bank_account_id: z.string().uuid("Invalid bank account ID").optional(),
  till_id: z.string().uuid("Invalid till ID").optional(),
  charge_id: z.string().uuid("Invalid charge ID").optional(),
  vault_id: z.string().uuid("Invalid vault ID").optional(),
});

export const updateGlAccountSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters")
    .optional(),
  type: z
    .enum(Object.values(GlAccountType) as [string, ...string[]])
    .optional(),
  balance: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Balance must be non-negative"))
    .optional(),
  currency_id: z.string().uuid("Invalid currency ID").optional(),
  locked_balance: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Locked balance must be non-negative"))
    .optional(),
  max_balance: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Max balance must be non-negative"))
    .optional(),
  min_balance: z
    .string()
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Min balance must be non-negative"))
    .optional(),
  organisation_id: z.string().uuid("Invalid organisation ID").optional(),
  bank_account_id: z.string().uuid("Invalid bank account ID").optional(),
  close_reason: z
    .string()
    .max(256, "Close reason must be less than 256 characters")
    .optional(),
  frozen_reason: z
    .string()
    .max(256, "Frozen reason must be less than 256 characters")
    .optional(),
  till_id: z.string().uuid("Invalid till ID").optional(),
  charge_id: z.string().uuid("Invalid charge ID").optional(),
  vault_id: z.string().uuid("Invalid vault ID").optional(),
});

export const glAccountFiltersSchema = z.object({
  page: z.coerce.number().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .default(10),
  search: z.string().optional(),
  type: z.enum(Object.values(GlAccountType)).optional(),
  currency_id: z.string().uuid("Invalid currency ID").optional(),
  organisation_id: z.string().uuid("Invalid organisation ID").optional(),
  opened_by: z.string().uuid("Invalid user ID").optional(),
  is_closed: z.coerce.boolean().optional(),
  is_frozen: z.coerce.boolean().optional(),
  till_id: z.string().uuid("Invalid till ID").optional(),
  charge_id: z.string().uuid("Invalid charge ID").optional(),
  vault_id: z.string().uuid("Invalid vault ID").optional(),
});

export const generateAccountsSchema = z.object({
  organisation_id: z.string().uuid("Invalid organisation ID"),
  generate_for_bank_accounts: z.boolean().default(true),
  generate_for_tills: z.boolean().default(true),
  generate_for_vaults: z.boolean().default(true),
  generate_for_charges: z.boolean().default(true),
  generate_for_org_balances: z.boolean().default(true),
  generate_for_charges_payments: z.boolean().default(true),
  generate_for_inbound_beneficiary_payments: z.boolean().default(false),
  generate_for_agency_floats: z.boolean().default(true),
  generate_for_float_transit_payables: z.boolean().default(true),
});
