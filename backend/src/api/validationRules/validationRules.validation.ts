import { z } from "zod";

export const updateValidationRuleSchema = z.object({
  config: z.record(z.string(), z.boolean()),
});

export const validationRuleFiltersSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
  entity: z.string().optional(),
});

export const validationRuleParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});
