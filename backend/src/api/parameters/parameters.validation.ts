import { z } from "zod";

export const parameterFiltersSchema = z.object({
  page: z.coerce.number().min(1).optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  search: z.string().optional(),
});

export const createParameterSchema = z.object({
  name: z.string().min(1, "Parameter name is required").max(255),
  value: z.string().min(1, "Parameter value is required").max(1000),
  value_2: z.string().max(1000).optional(),
});

export const updateParameterSchema = z.object({
  name: z.string().min(1, "Parameter name is required").max(255).optional(),
  value: z.string().min(1, "Parameter value is required").max(1000).optional(),
  value_2: z.string().max(1000).optional(),
});

export const parameterIdSchema = z.object({
  id: z.string().uuid("Invalid parameter ID"),
});
