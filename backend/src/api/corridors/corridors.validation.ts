import { z } from "zod";
import { CorridorStatus } from "@prisma/client";

export const createCorridorSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters"),
  description: z.string().min(1, "Description is required"),
  base_country_id: z.string().uuid("Base country ID must be a valid UUID"),
  destination_country_id: z
    .string()
    .uuid("Destination country ID must be a valid UUID"),
  base_currency_id: z.string().uuid("Base currency ID must be a valid UUID"),
  organisation_id: z.string().uuid("Organisation ID must be a valid UUID"),
  status: z.enum(CorridorStatus).default("ACTIVE"),
  origin_organisation_id: z
    .string()
    .uuid("Origin organisation ID must be a valid UUID"),
});

export const updateCorridorSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters")
    .optional(),
  description: z.string().min(1, "Description is required").optional(),
  base_country_id: z
    .string()
    .uuid("Base country ID must be a valid UUID")
    .optional(),
  destination_country_id: z
    .string()
    .uuid("Destination country ID must be a valid UUID")
    .optional(),
  base_currency_id: z
    .string()
    .uuid("Base currency ID must be a valid UUID")
    .optional(),
  organisation_id: z
    .string()
    .uuid("Organisation ID must be a valid UUID")
    .optional(),
  status: z.enum(CorridorStatus).optional(),
  origin_organisation_id: z
    .string()
    .uuid("Origin organisation ID must be a valid UUID")
    .optional(),
});

export const corridorFiltersSchema = z.object({
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
  status: z.enum(CorridorStatus).optional(),
  base_country_id: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().uuid().nullable().optional()),
  destination_country_id: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().uuid().nullable().optional()),
  base_currency_id: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().uuid().nullable().optional()),
  organisation_id: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().uuid().nullable().optional()),
  created_by: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().uuid().nullable().optional()),
  origin_organisation_id: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val))
    .pipe(
      z
        .string()
        .uuid("Origin organisation ID must be a valid UUID")
        .nullable()
        .optional()
    ),
});

export const corridorStatsFiltersSchema = z.object({
  origin_organisation_id: z
    .string()
    .optional()
    .transform((val) => (val === "" ? null : val))
    .pipe(
      z
        .string()
        .uuid("Origin organisation ID must be a valid UUID")
        .nullable()
        .optional()
    ),
});
