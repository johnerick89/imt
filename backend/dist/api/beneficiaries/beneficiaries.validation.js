"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beneficiaryFiltersSchema = exports.updateBeneficiarySchema = exports.createBeneficiarySchema = void 0;
const zod_1 = require("zod");
exports.createBeneficiarySchema = zod_1.z.object({
    customer_id: zod_1.z.string().uuid("Customer ID must be a valid UUID"),
    type: zod_1.z.enum(["INDIVIDUAL", "CORPORATE", "BUSINESS"]),
    risk_contribution: zod_1.z.number().min(0).optional(),
    risk_contribution_details: zod_1.z.any().optional(),
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters"),
    date_of_birth: zod_1.z.string().optional(),
    nationality_id: zod_1.z
        .string()
        .uuid("Nationality ID must be a valid UUID")
        .optional(),
    residence_country_id: zod_1.z
        .string()
        .uuid("Residence country ID must be a valid UUID")
        .optional(),
    incorporation_country_id: zod_1.z
        .string()
        .uuid("Incorporation country ID must be a valid UUID")
        .optional(),
    address: zod_1.z.string().optional(),
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
    tax_number_type: zod_1.z.enum(["PIN", "TIN", "SSN", "KRA_PIN", "OTHER"]).optional(),
    tax_number: zod_1.z.string().optional(),
    reg_number: zod_1.z.string().optional(),
    occupation_id: zod_1.z
        .string()
        .uuid("Occupation ID must be a valid UUID")
        .optional(),
    industry_id: zod_1.z.string().uuid("Industry ID must be a valid UUID").optional(),
    organisation_id: zod_1.z.string().uuid("Organisation ID must be a valid UUID"),
});
exports.updateBeneficiarySchema = zod_1.z.object({
    type: zod_1.z.enum(["INDIVIDUAL", "CORPORATE", "BUSINESS"]).optional(),
    risk_contribution: zod_1.z.number().min(0).optional(),
    risk_contribution_details: zod_1.z.any().optional(),
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters")
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
    incorporation_country_id: zod_1.z
        .string()
        .uuid("Incorporation country ID must be a valid UUID")
        .optional(),
    address: zod_1.z.string().optional(),
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
    tax_number_type: zod_1.z.enum(["PIN", "TIN", "SSN", "KRA_PIN", "OTHER"]).optional(),
    tax_number: zod_1.z.string().optional(),
    reg_number: zod_1.z.string().optional(),
    occupation_id: zod_1.z
        .string()
        .uuid("Occupation ID must be a valid UUID")
        .optional(),
    industry_id: zod_1.z.string().uuid("Industry ID must be a valid UUID").optional(),
    organisation_id: zod_1.z.string().uuid("Organisation ID must be a valid UUID"),
});
exports.beneficiaryFiltersSchema = zod_1.z.object({
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
    customer_id: zod_1.z.string().uuid().optional(),
    organisation_id: zod_1.z.string().uuid().optional(),
    type: zod_1.z.enum(["INDIVIDUAL", "CORPORATE", "BUSINESS"]).optional(),
    nationality_id: zod_1.z.string().uuid().optional(),
    residence_country_id: zod_1.z.string().uuid().optional(),
    occupation_id: zod_1.z.string().uuid().optional(),
    industry_id: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=beneficiaries.validation.js.map