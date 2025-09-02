import { z } from "zod";
import {
  CustomerStatus,
  IndividualIDType,
  Gender,
  TaxNumberType,
  CustomerType,
} from "@prisma/client";

export const createCustomerSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(256, "Full name must be less than 256 characters"),
  date_of_birth: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "") return undefined;
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }),
  nationality_id: z
    .string()
    .uuid("Nationality ID must be a valid UUID")
    .optional(),
  residence_country_id: z
    .string()
    .uuid("Residence country ID must be a valid UUID")
    .optional(),
  id_type: z.enum(IndividualIDType).optional(),
  id_number: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  phone_number: z.string().optional(),
  occupation_id: z
    .string()
    .uuid("Occupation ID must be a valid UUID")
    .optional(),
  risk_rating: z.number().min(0).max(100).default(0.0),
  risk_reasons: z.string().optional(),
  organisation_id: z.string().uuid("Organisation ID must be a valid UUID"),
  branch_id: z.string().uuid("Branch ID must be a valid UUID"),
  tax_number_type: z.enum(TaxNumberType).optional(),
  tax_number: z.string().optional(),
  gender: z.enum(Gender).optional(),
  customer_type: z.enum(CustomerType),
  incorporation_country_id: z
    .string()
    .uuid("Incorporation country ID must be a valid UUID")
    .optional(),
  incoporated_date: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "") return undefined;
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }),
  estimated_monthly_income: z.number().min(0).optional(),
  org_reg_number: z.string().optional(),
  current_age: z.number().min(0).max(150).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  currency_id: z.string().uuid("Currency ID must be a valid UUID").optional(),
  industry_id: z.string().uuid("Industry ID must be a valid UUID").optional(),
  legacy_customer_id: z.string().optional(),
  has_adverse_media: z.boolean().default(false),
  adverse_media_reason: z.string().optional(),
  status: z.enum(CustomerStatus).optional(),
});

export const updateCustomerSchema = z.object({
  full_name: z
    .string()
    .min(1, "Full name is required")
    .max(256, "Full name must be less than 256 characters")
    .optional(),
  date_of_birth: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "") return undefined;
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }),
  nationality_id: z
    .string()
    .uuid("Nationality ID must be a valid UUID")
    .optional(),
  residence_country_id: z
    .string()
    .uuid("Residence country ID must be a valid UUID")
    .optional(),
  id_type: z.enum(IndividualIDType).optional(),
  id_number: z.string().optional(),
  address: z.string().optional(),
  email: z.string().email("Invalid email format").optional(),
  phone_number: z.string().optional(),
  occupation_id: z
    .string()
    .uuid("Occupation ID must be a valid UUID")
    .optional(),
  risk_rating: z.number().min(0).max(100).optional(),
  risk_reasons: z.string().optional(),
  branch_id: z.string().uuid("Branch ID must be a valid UUID").optional(),
  tax_number_type: z.enum(TaxNumberType).optional(),
  tax_number: z.string().optional(),
  gender: z.enum(Gender).optional(),
  customer_type: z.enum(CustomerType).optional(),
  incorporation_country_id: z
    .string()
    .uuid("Incorporation country ID must be a valid UUID")
    .optional(),
  incoporated_date: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val === "") return undefined;
      const date = new Date(val);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }),
  estimated_monthly_income: z.number().min(0).optional(),
  org_reg_number: z.string().optional(),
  current_age: z.number().min(0).max(150).optional(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  currency_id: z.string().uuid("Currency ID must be a valid UUID").optional(),
  industry_id: z.string().uuid("Industry ID must be a valid UUID").optional(),
  legacy_customer_id: z.string().optional(),
  has_adverse_media: z.boolean().optional(),
  adverse_media_reason: z.string().optional(),
  status: z.enum(CustomerStatus).optional(),
});

export const customerFiltersSchema = z.object({
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
  customer_type: z.enum(CustomerType).optional(),
  organisation_id: z.string().uuid().optional(),
  branch_id: z.string().uuid().optional(),
  nationality_id: z.string().uuid().optional(),
  residence_country_id: z.string().uuid().optional(),
  occupation_id: z.string().uuid().optional(),
  industry_id: z.string().uuid().optional(),
  gender: z.enum(Gender).optional(),
  has_adverse_media: z
    .union([z.boolean(), z.string()])
    .transform((val) => {
      if (typeof val === "boolean") return val;
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    })
    .optional(),
  created_by: z.string().uuid().optional(),
  status: z.enum(CustomerStatus).optional(),
});
