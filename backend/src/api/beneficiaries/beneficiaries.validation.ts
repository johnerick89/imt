import { z } from "zod";

export const createBeneficiarySchema = z.object({
  customer_id: z.string().uuid("Customer ID must be a valid UUID"),
  type: z.enum(["INDIVIDUAL", "CORPORATE", "BUSINESS"]),
  risk_contribution: z.number().min(0).optional(),
  risk_contribution_details: z.any().optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters"),
  date_of_birth: z.string().optional(),
  nationality_id: z
    .string()
    .uuid("Nationality ID must be a valid UUID")
    .optional(),
  residence_country_id: z
    .string()
    .uuid("Residence country ID must be a valid UUID")
    .optional(),
  incorporation_country_id: z
    .string()
    .uuid("Incorporation country ID must be a valid UUID")
    .optional(),
  address: z.string().optional(),
  id_type: z
    .enum([
      "PASSPORT",
      "NATIONAL_ID",
      "DRIVERS_LICENSE",
      "ALIEN_CARD",
      "KRA_PIN",
      "OTHER",
    ])
    .optional(),
  id_number: z.string().optional(),
  tax_number_type: z.enum(["PIN", "TIN", "SSN", "KRA_PIN", "OTHER"]).optional(),
  tax_number: z.string().optional(),
  reg_number: z.string().optional(),
  occupation_id: z
    .string()
    .uuid("Occupation ID must be a valid UUID")
    .optional(),
  industry_id: z.string().uuid("Industry ID must be a valid UUID").optional(),
  organisation_id: z.string().uuid("Organisation ID must be a valid UUID"),
});

export const updateBeneficiarySchema = z.object({
  type: z.enum(["INDIVIDUAL", "CORPORATE", "BUSINESS"]).optional(),
  risk_contribution: z.number().min(0).optional(),
  risk_contribution_details: z.any().optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters")
    .optional(),
  date_of_birth: z.string().optional(),
  nationality_id: z
    .string()
    .uuid("Nationality ID must be a valid UUID")
    .optional(),
  residence_country_id: z
    .string()
    .uuid("Residence country ID must be a valid UUID")
    .optional(),
  incorporation_country_id: z
    .string()
    .uuid("Incorporation country ID must be a valid UUID")
    .optional(),
  address: z.string().optional(),
  id_type: z
    .enum([
      "PASSPORT",
      "NATIONAL_ID",
      "DRIVERS_LICENSE",
      "ALIEN_CARD",
      "KRA_PIN",
      "OTHER",
    ])
    .optional(),
  id_number: z.string().optional(),
  tax_number_type: z.enum(["PIN", "TIN", "SSN", "KRA_PIN", "OTHER"]).optional(),
  tax_number: z.string().optional(),
  reg_number: z.string().optional(),
  occupation_id: z
    .string()
    .uuid("Occupation ID must be a valid UUID")
    .optional(),
  industry_id: z.string().uuid("Industry ID must be a valid UUID").optional(),
  organisation_id: z.string().uuid("Organisation ID must be a valid UUID"),
});

export const beneficiaryFiltersSchema = z.object({
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
  customer_id: z.string().uuid().optional(),
  organisation_id: z.string().uuid().optional(),
  type: z.enum(["INDIVIDUAL", "CORPORATE", "BUSINESS"]).optional(),
  nationality_id: z.string().uuid().optional(),
  residence_country_id: z.string().uuid().optional(),
  occupation_id: z.string().uuid().optional(),
  industry_id: z.string().uuid().optional(),
});
