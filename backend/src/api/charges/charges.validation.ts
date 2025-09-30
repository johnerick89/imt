import { z } from "zod";
import {
  ChargeType,
  ChargeStatus,
  ApplicationMethod,
  Direction,
} from "@prisma/client";

export const createChargeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters"),
  description: z.string().min(1, "Description is required"),
  application_method: z.enum(ApplicationMethod),
  currency_id: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().uuid("Currency ID must be a valid UUID"))
    .optional(),
  type: z.enum(ChargeType),
  rate: z
    .string()
    .min(1, "Rate is required")
    .transform((val) => parseFloat(val))
    .pipe(z.number().min(0, "Rate must be non-negative")),
  origin_organisation_id: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().uuid("Origin organisation ID must be a valid UUID"))
    .optional(),
  destination_organisation_id: z
    .string()
    .uuid("Destination organisation ID must be a valid UUID")
    .optional(),
  is_reversible: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (val === "true") return true;
      if (val === "false") return false;
      return false;
    })
    .default(false),
  direction: z.enum(Direction).default("OUTBOUND"),
  origin_share_percentage: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().nonnegative().optional()),
  destination_share_percentage: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().nonnegative().optional()),
  status: z.enum(ChargeStatus).default("ACTIVE"),
  min_amount: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().nonnegative().optional()),
  max_amount: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().nonnegative().optional()),
  payment_authority: z.string().optional(),
});

export const updateChargeSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters")
    .optional(),
  description: z.string().min(1, "Description is required").optional(),
  application_method: z.enum(ApplicationMethod).optional(),
  currency_id: z
    .string()
    .transform((val) => (val === "" ? undefined : val))
    .pipe(z.string().uuid("Currency ID must be a valid UUID"))
    .optional(),
  type: z.enum(ChargeType).optional(),
  rate: z
    .string()
    .transform((val) => (val === "" ? undefined : parseFloat(val)))
    .pipe(z.number().min(0, "Rate must be non-negative"))
    .optional(),
  origin_organisation_id: z
    .string()
    .uuid("Origin organisation ID must be a valid UUID")
    .optional(),
  destination_organisation_id: z
    .string()
    .uuid("Destination organisation ID must be a valid UUID")
    .optional(),
  is_reversible: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    })
    .optional(),
  direction: z.enum(Direction).optional(),
  origin_share_percentage: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().nonnegative().optional()),
  destination_share_percentage: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().nonnegative().optional()),
  status: z.enum(ChargeStatus).optional(),
  min_amount: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().nonnegative().optional()),
  max_amount: z.preprocess((val) => {
    if (typeof val === "string") {
      if (val === "") return undefined;
      const parsed = parseFloat(val);
      return isNaN(parsed) ? undefined : parsed;
    }
    return val;
  }, z.number().nonnegative().optional()),
  payment_authority: z.string().optional(),
});

export const chargeFiltersSchema = z.object({
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
  type: z.enum(ChargeType).optional(),
  status: z.enum(ChargeStatus).optional(),
  application_method: z.enum(ApplicationMethod).optional(),
  direction: z.enum(Direction).optional(),
  currency_id: z.string().uuid().optional(),
  origin_organisation_id: z.string().uuid().optional(),
  destination_organisation_id: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
});
