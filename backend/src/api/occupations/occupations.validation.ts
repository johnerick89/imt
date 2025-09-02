import { z } from "zod";

export const createOccupationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters"),
  description: z.string().optional(),
});

export const updateOccupationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters")
    .optional(),
  description: z.string().optional(),
});

export const occupationFiltersSchema = z.object({
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
});
