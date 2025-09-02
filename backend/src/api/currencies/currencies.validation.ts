import { z } from "zod";

export const createCurrencySchema = z.object({
  currency_name: z
    .string()
    .min(1, "Currency name is required")
    .max(100, "Currency name must be less than 100 characters"),
  currency_code: z
    .string()
    .min(1, "Currency code is required")
    .max(10, "Currency code must be less than 10 characters")
    .toUpperCase(),
  currency_symbol: z
    .string()
    .min(1, "Currency symbol is required")
    .max(10, "Currency symbol must be less than 10 characters"),
  symbol_native: z.string().optional(),
  decimal_digits: z.number().min(0).max(8).optional(),
  rounding: z.number().optional(),
  name_plural: z.string().optional(),
});

export const updateCurrencySchema = z.object({
  currency_name: z
    .string()
    .min(1, "Currency name is required")
    .max(100, "Currency name must be less than 100 characters")
    .optional(),
  currency_code: z
    .string()
    .min(1, "Currency code is required")
    .max(10, "Currency code must be less than 10 characters")
    .toUpperCase()
    .optional(),
  currency_symbol: z
    .string()
    .min(1, "Currency symbol is required")
    .max(10, "Currency symbol must be less than 10 characters")
    .optional(),
  symbol_native: z.string().optional(),
  decimal_digits: z.number().min(0).max(8).optional(),
  rounding: z.number().optional(),
  name_plural: z.string().optional(),
});

export const currencyFiltersSchema = z.object({
  search: z.string().optional(),
  currency_code: z.string().optional(),
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
