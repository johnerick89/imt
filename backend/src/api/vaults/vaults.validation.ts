import { z } from "zod";

export const createVaultSchema = z.object({
  name: z.string().min(1, "Name is required"),
  organisation_id: z.string().uuid("Valid organisation ID is required"),
  currency_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
});

export const updateVaultSchema = z.object({
  name: z.string().min(1).optional(),
  organisation_id: z.string().uuid().optional(),
  currency_id: z.preprocess(
    (val) => (val === "" ? undefined : val),
    z.string().uuid().optional()
  ),
});

export const vaultFiltersSchema = z.object({
  page: z.preprocess(
    (val) => (val ? parseInt(val as string) : 1),
    z.number().int().positive().optional()
  ),
  limit: z.preprocess(
    (val) => (val ? parseInt(val as string) : 10),
    z.number().int().positive().max(100).optional()
  ),
  search: z.string().optional(),
  organisation_id: z.string().uuid().optional(),
  currency_id: z.string().uuid().optional(),
});
