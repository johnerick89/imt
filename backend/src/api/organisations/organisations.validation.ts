import { z } from "zod";
import {
  OrganisationType,
  OrganisationStatus,
  IntegrationMethod,
} from "@prisma/client";

export const createOrganisationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  type: z.nativeEnum(OrganisationType),
  integration_mode: z.nativeEnum(IntegrationMethod).optional(),
  contact_person: z
    .string()
    .max(100, "Contact person must be less than 100 characters"),
  contact_email: z
    .string()
    .email("Invalid email format")
    .max(100, "Email must be less than 100 characters"),
  contact_phone: z
    .string()
    .max(20, "Phone must be less than 20 characters")
    .optional(),
  contact_address: z
    .string()
    .max(200, "Address must be less than 200 characters")
    .optional(),
  contact_city: z
    .string()
    .max(100, "City must be less than 100 characters")
    .optional(),
  contact_state: z
    .string()
    .max(100, "State must be less than 100 characters")
    .optional(),
  contact_zip: z
    .string()
    .max(20, "ZIP code must be less than 20 characters")
    .optional(),
  base_currency_id: z
    .string()
    .uuid("Invalid currency ID")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? undefined : val)),
  country_id: z
    .string()
    .uuid("Invalid country ID")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? undefined : val)),
  contact_password: z
    .string()
    .max(100, "Password must be less than 100 characters"),
});

export const updateOrganisationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  type: z.nativeEnum(OrganisationType).optional(),
  integration_mode: z.nativeEnum(IntegrationMethod).optional(),
  contact_person: z
    .string()
    .max(100, "Contact person must be less than 100 characters"),
  contact_email: z
    .string()
    .email("Invalid email format")
    .max(100, "Email must be less than 100 characters"),
  contact_phone: z
    .string()
    .max(20, "Phone must be less than 20 characters")
    .optional(),
  contact_address: z
    .string()
    .max(200, "Address must be less than 200 characters")
    .optional(),
  contact_city: z
    .string()
    .max(100, "City must be less than 100 characters")
    .optional(),
  contact_state: z
    .string()
    .max(100, "State must be less than 100 characters")
    .optional(),
  contact_zip: z
    .string()
    .max(20, "ZIP code must be less than 20 characters")
    .optional(),
  status: z.nativeEnum(OrganisationStatus).optional(),
  base_currency_id: z
    .string()
    .uuid("Invalid currency ID")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? undefined : val)),
  country_id: z
    .string()
    .uuid("Invalid country ID")
    .optional()
    .nullable()
    .transform((val) => (val === "" ? undefined : val)),
});

export const organisationFiltersSchema = z.object({
  search: z.string().optional(),
  type: z.nativeEnum(OrganisationType).optional(),
  status: z.nativeEnum(OrganisationStatus).optional(),
  integration_mode: z.nativeEnum(IntegrationMethod).optional(),
  country_id: z.string().uuid("Invalid country ID").optional(),
  base_currency_id: z.string().uuid("Invalid currency ID").optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1, "Page must be at least 1"))
    .optional(),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit must be at most 100")
    )
    .optional(),
});

export const organisationIdSchema = z.object({
  id: z.string().uuid("Invalid organisation ID"),
});
