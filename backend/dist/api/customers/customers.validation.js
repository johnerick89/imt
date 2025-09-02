"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.customerFiltersSchema = exports.updateCustomerSchema = exports.createCustomerSchema = void 0;
const zod_1 = require("zod");
exports.createCustomerSchema = zod_1.z.object({
    full_name: zod_1.z
        .string()
        .min(1, "Full name is required")
        .max(256, "Full name must be less than 256 characters"),
    date_of_birth: zod_1.z.string().optional(),
    nationality_id: zod_1.z
        .string()
        .uuid("Nationality ID must be a valid UUID")
        .optional(),
    residence_country_id: zod_1.z
        .string()
        .uuid("Residence country ID must be a valid UUID")
        .optional(),
    id_type: zod_1.z
        .enum([
        "PASSPORT",
        "NATIONAL_ID",
        "DRIVERS_LICENSE",
        "ALIEN_CARD",
        "KRA_PIN",
        "OTHER",
    ])
        .optional(),
    id_number: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    email: zod_1.z.string().email("Invalid email format").optional(),
    phone_number: zod_1.z.string().optional(),
    occupation_id: zod_1.z
        .string()
        .uuid("Occupation ID must be a valid UUID")
        .optional(),
    risk_rating: zod_1.z.number().min(0).max(100).default(0.0),
    risk_reasons: zod_1.z.string().optional(),
    organisation_id: zod_1.z.string().uuid("Organisation ID must be a valid UUID"),
    branch_id: zod_1.z.string().uuid("Branch ID must be a valid UUID"),
    tax_number_type: zod_1.z.enum(["PIN", "TIN", "SSN", "KRA_PIN", "OTHER"]).optional(),
    tax_number: zod_1.z.string().optional(),
    gender: zod_1.z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    customer_type: zod_1.z.enum(["INDIVIDUAL", "CORPORATE", "BUSINESS"]),
    incorporation_country_id: zod_1.z
        .string()
        .uuid("Incorporation country ID must be a valid UUID")
        .optional(),
    incoporated_date: zod_1.z.string().optional(),
    estimated_monthly_income: zod_1.z.number().min(0).optional(),
    org_reg_number: zod_1.z.string().optional(),
    current_age: zod_1.z.number().min(0).max(150).optional(),
    first_name: zod_1.z.string().optional(),
    last_name: zod_1.z.string().optional(),
    currency_id: zod_1.z.string().uuid("Currency ID must be a valid UUID").optional(),
    industry_id: zod_1.z.string().uuid("Industry ID must be a valid UUID").optional(),
    legacy_customer_id: zod_1.z.string().optional(),
    has_adverse_media: zod_1.z.boolean().default(false),
    adverse_media_reason: zod_1.z.string().optional(),
});
exports.updateCustomerSchema = zod_1.z.object({
    full_name: zod_1.z
        .string()
        .min(1, "Full name is required")
        .max(256, "Full name must be less than 256 characters")
        .optional(),
    date_of_birth: zod_1.z.string().optional(),
    nationality_id: zod_1.z
        .string()
        .uuid("Nationality ID must be a valid UUID")
        .optional(),
    residence_country_id: zod_1.z
        .string()
        .uuid("Residence country ID must be a valid UUID")
        .optional(),
    id_type: zod_1.z
        .enum([
        "PASSPORT",
        "NATIONAL_ID",
        "DRIVERS_LICENSE",
        "ALIEN_CARD",
        "KRA_PIN",
        "OTHER",
    ])
        .optional(),
    id_number: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    email: zod_1.z.string().email("Invalid email format").optional(),
    phone_number: zod_1.z.string().optional(),
    occupation_id: zod_1.z
        .string()
        .uuid("Occupation ID must be a valid UUID")
        .optional(),
    risk_rating: zod_1.z.number().min(0).max(100).optional(),
    risk_reasons: zod_1.z.string().optional(),
    branch_id: zod_1.z.string().uuid("Branch ID must be a valid UUID").optional(),
    tax_number_type: zod_1.z.enum(["PIN", "TIN", "SSN", "KRA_PIN", "OTHER"]).optional(),
    tax_number: zod_1.z.string().optional(),
    gender: zod_1.z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    customer_type: zod_1.z.enum(["INDIVIDUAL", "CORPORATE", "BUSINESS"]).optional(),
    incorporation_country_id: zod_1.z
        .string()
        .uuid("Incorporation country ID must be a valid UUID")
        .optional(),
    incoporated_date: zod_1.z.string().optional(),
    estimated_monthly_income: zod_1.z.number().min(0).optional(),
    org_reg_number: zod_1.z.string().optional(),
    current_age: zod_1.z.number().min(0).max(150).optional(),
    first_name: zod_1.z.string().optional(),
    last_name: zod_1.z.string().optional(),
    currency_id: zod_1.z.string().uuid("Currency ID must be a valid UUID").optional(),
    industry_id: zod_1.z.string().uuid("Industry ID must be a valid UUID").optional(),
    legacy_customer_id: zod_1.z.string().optional(),
    has_adverse_media: zod_1.z.boolean().optional(),
    adverse_media_reason: zod_1.z.string().optional(),
});
exports.customerFiltersSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(zod_1.z.number().min(1).max(100))
        .default(1),
    limit: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(zod_1.z.number().min(1).max(100))
        .default(10),
    search: zod_1.z.string().optional(),
    customer_type: zod_1.z.enum(["INDIVIDUAL", "CORPORATE", "BUSINESS"]).optional(),
    organisation_id: zod_1.z.string().uuid().optional(),
    branch_id: zod_1.z.string().uuid().optional(),
    nationality_id: zod_1.z.string().uuid().optional(),
    residence_country_id: zod_1.z.string().uuid().optional(),
    occupation_id: zod_1.z.string().uuid().optional(),
    industry_id: zod_1.z.string().uuid().optional(),
    gender: zod_1.z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    has_adverse_media: zod_1.z
        .union([zod_1.z.boolean(), zod_1.z.string()])
        .transform((val) => {
        if (typeof val === "boolean")
            return val;
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return undefined;
    })
        .optional(),
    created_by: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=customers.validation.js.map