"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.organisationIdSchema = exports.organisationFiltersSchema = exports.updateOrganisationSchema = exports.createOrganisationSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createOrganisationSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters"),
    description: zod_1.z
        .string()
        .max(500, "Description must be less than 500 characters")
        .optional(),
    type: zod_1.z.nativeEnum(client_1.OrganisationType),
    integration_mode: zod_1.z.nativeEnum(client_1.IntegrationMethod).optional(),
    contact_person: zod_1.z
        .string()
        .max(100, "Contact person must be less than 100 characters")
        .optional(),
    contact_email: zod_1.z
        .string()
        .email("Invalid email format")
        .max(100, "Email must be less than 100 characters")
        .optional(),
    contact_phone: zod_1.z
        .string()
        .max(20, "Phone must be less than 20 characters")
        .optional(),
    contact_address: zod_1.z
        .string()
        .max(200, "Address must be less than 200 characters")
        .optional(),
    contact_city: zod_1.z
        .string()
        .max(100, "City must be less than 100 characters")
        .optional(),
    contact_state: zod_1.z
        .string()
        .max(100, "State must be less than 100 characters")
        .optional(),
    contact_zip: zod_1.z
        .string()
        .max(20, "ZIP code must be less than 20 characters")
        .optional(),
    base_currency_id: zod_1.z
        .string()
        .uuid("Invalid currency ID")
        .optional()
        .nullable()
        .transform((val) => (val === "" ? undefined : val)),
    country_id: zod_1.z
        .string()
        .uuid("Invalid country ID")
        .optional()
        .nullable()
        .transform((val) => (val === "" ? undefined : val)),
});
exports.updateOrganisationSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be less than 100 characters")
        .optional(),
    description: zod_1.z
        .string()
        .max(500, "Description must be less than 500 characters")
        .optional(),
    type: zod_1.z.nativeEnum(client_1.OrganisationType).optional(),
    integration_mode: zod_1.z.nativeEnum(client_1.IntegrationMethod).optional(),
    contact_person: zod_1.z
        .string()
        .max(100, "Contact person must be less than 100 characters")
        .optional(),
    contact_email: zod_1.z
        .string()
        .email("Invalid email format")
        .max(100, "Email must be less than 100 characters")
        .optional(),
    contact_phone: zod_1.z
        .string()
        .max(20, "Phone must be less than 20 characters")
        .optional(),
    contact_address: zod_1.z
        .string()
        .max(200, "Address must be less than 200 characters")
        .optional(),
    contact_city: zod_1.z
        .string()
        .max(100, "City must be less than 100 characters")
        .optional(),
    contact_state: zod_1.z
        .string()
        .max(100, "State must be less than 100 characters")
        .optional(),
    contact_zip: zod_1.z
        .string()
        .max(20, "ZIP code must be less than 20 characters")
        .optional(),
    status: zod_1.z.nativeEnum(client_1.OrganisationStatus).optional(),
    base_currency_id: zod_1.z
        .string()
        .uuid("Invalid currency ID")
        .optional()
        .nullable()
        .transform((val) => (val === "" ? undefined : val)),
    country_id: zod_1.z
        .string()
        .uuid("Invalid country ID")
        .optional()
        .nullable()
        .transform((val) => (val === "" ? undefined : val)),
});
exports.organisationFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    type: zod_1.z.nativeEnum(client_1.OrganisationType).optional(),
    status: zod_1.z.nativeEnum(client_1.OrganisationStatus).optional(),
    integration_mode: zod_1.z.nativeEnum(client_1.IntegrationMethod).optional(),
    country_id: zod_1.z.string().uuid("Invalid country ID").optional(),
    base_currency_id: zod_1.z.string().uuid("Invalid currency ID").optional(),
    page: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(zod_1.z.number().min(1, "Page must be at least 1"))
        .optional(),
    limit: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(zod_1.z
        .number()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit must be at most 100"))
        .optional(),
});
exports.organisationIdSchema = zod_1.z.object({
    id: zod_1.z.string().uuid("Invalid organisation ID"),
});
//# sourceMappingURL=organisations.validation.js.map