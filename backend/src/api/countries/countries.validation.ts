import { z } from "zod";

export const createCountrySchema = z.object({
  name: z
    .string()
    .min(1, "Country name is required")
    .max(100, "Country name must be less than 100 characters"),
  code: z
    .string()
    .min(1, "Country code is required")
    .max(10, "Country code must be less than 10 characters")
    .toUpperCase(),
});

export const updateCountrySchema = z.object({
  name: z
    .string()
    .min(1, "Country name is required")
    .max(100, "Country name must be less than 100 characters")
    .optional(),
  code: z
    .string()
    .min(1, "Country code is required")
    .max(10, "Country code must be less than 10 characters")
    .toUpperCase()
    .optional(),
});

export const countryFiltersSchema = z.object({
  search: z.string().optional(),
  code: z.string().optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .optional(),
});
