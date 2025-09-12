import { z } from "zod";
import { CustomerType, IndividualIDType, TaxNumberType } from "@prisma/client";

export const createBeneficiarySchema = z.object({
  customer_id: z.string().uuid("Customer ID must be a valid UUID"),
  type: z.enum(CustomerType),
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
  id_type: z.enum(IndividualIDType).optional(),
  id_number: z.string().optional(),
  tax_number_type: z.enum(TaxNumberType).optional(),
  tax_number: z.string().optional(),
  reg_number: z.string().optional(),
  occupation_id: z
    .string()
    .uuid("Occupation ID must be a valid UUID")
    .optional(),
  industry_id: z.string().uuid("Industry ID must be a valid UUID").optional(),
  organisation_id: z.string().uuid("Organisation ID must be a valid UUID"),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  bank_name: z.string().optional(),
  bank_address: z.string().optional(),
  bank_city: z.string().optional(),
  bank_state: z.string().optional(),
  bank_zip: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_account_name: z.string().optional(),
});

export const updateBeneficiarySchema = z.object({
  type: z.enum(CustomerType).optional(),
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
  id_type: z.enum(IndividualIDType).optional(),
  id_number: z.string().optional(),
  tax_number_type: z.enum(TaxNumberType).optional(),
  tax_number: z.string().optional(),
  reg_number: z.string().optional(),
  occupation_id: z
    .string()
    .uuid("Occupation ID must be a valid UUID")
    .optional(),
  industry_id: z.string().uuid("Industry ID must be a valid UUID").optional(),
  organisation_id: z
    .string()
    .uuid("Organisation ID must be a valid UUID")
    .optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().optional(),
  bank_name: z.string().optional(),
  bank_address: z.string().optional(),
  bank_city: z.string().optional(),
  bank_state: z.string().optional(),
  bank_zip: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_account_name: z.string().optional(),
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
  type: z.enum(CustomerType).optional(),
  nationality_id: z.string().uuid().optional(),
  residence_country_id: z.string().uuid().optional(),
  occupation_id: z.string().uuid().optional(),
  industry_id: z.string().uuid().optional(),
});
