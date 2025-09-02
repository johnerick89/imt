import { z } from "zod";

export const createBranchSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country_id: z.string().uuid("Country ID must be a valid UUID"),
  zip_code: z.string().min(1, "Zip code is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email format"),
  organisation_id: z.string().uuid("Organisation ID must be a valid UUID"),
});

export const updateBranchSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters")
    .optional(),
  address: z.string().min(1, "Address is required").optional(),
  city: z.string().min(1, "City is required").optional(),
  state: z.string().min(1, "State is required").optional(),
  country_id: z.string().uuid("Country ID must be a valid UUID").optional(),
  zip_code: z.string().min(1, "Zip code is required").optional(),
  phone: z.string().min(1, "Phone is required").optional(),
  email: z.string().email("Invalid email format").optional(),
});

export const branchFiltersSchema = z.object({
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
  organisation_id: z.string().uuid().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country_id: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
});
