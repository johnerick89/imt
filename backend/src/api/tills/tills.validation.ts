import { z } from "zod";

export const createTillSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "BLOCKED"]).optional(),
  current_teller_user_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  location: z.string().optional(),
  vault_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  currency_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  organisation_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  opened_at: z.preprocess((val) => {
    if (typeof val === "string" && val !== "") {
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    return val;
  }, z.string().optional()),
  closed_at: z.preprocess((val) => {
    if (typeof val === "string" && val !== "") {
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    return val;
  }, z.string().optional()),
  opening_balance: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.number().optional()
  ),
});

export const updateTillSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "BLOCKED"]).optional(),
  current_teller_user_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  location: z.string().optional(),
  vault_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  currency_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  organisation_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
  opened_at: z.preprocess((val) => {
    if (typeof val === "string" && val !== "") {
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    return val;
  }, z.string().optional()),
  closed_at: z.preprocess((val) => {
    if (typeof val === "string" && val !== "") {
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    return val;
  }, z.string().optional()),
  opening_balance: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.number().optional()
  ),
});

export const tillFiltersSchema = z.object({
  page: z.preprocess(
    (val) => (val ? parseInt(val as string) : 1),
    z.number().int().positive().optional()
  ),
  limit: z.preprocess(
    (val) => (val ? parseInt(val as string) : 10),
    z.number().int().positive().max(100).optional()
  ),
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "PENDING", "BLOCKED"]).optional(),
  current_teller_user_id: z.string().uuid().optional(),
  vault_id: z.string().uuid().optional(),
  currency_id: z.string().uuid().optional(),
  organisation_id: z.string().uuid().optional(),
});
