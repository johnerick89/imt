"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chargeFiltersSchema = exports.updateChargeSchema = exports.createChargeSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createChargeSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters"),
    description: zod_1.z.string().min(1, "Description is required"),
    application_method: zod_1.z.enum(client_1.ApplicationMethod),
    currency_id: zod_1.z
        .string()
        .transform((val) => (val === "" ? undefined : val))
        .pipe(zod_1.z.string().uuid("Currency ID must be a valid UUID"))
        .optional(),
    type: zod_1.z.enum(client_1.ChargeType),
    rate: zod_1.z
        .string()
        .min(1, "Rate is required")
        .transform((val) => parseFloat(val))
        .pipe(zod_1.z.number().min(0, "Rate must be non-negative")),
    origin_organisation_id: zod_1.z
        .string()
        .transform((val) => (val === "" ? undefined : val))
        .pipe(zod_1.z.string().uuid("Origin organisation ID must be a valid UUID"))
        .optional(),
    destination_organisation_id: zod_1.z
        .string()
        .uuid("Destination organisation ID must be a valid UUID")
        .optional(),
    is_reversible: zod_1.z
        .union([zod_1.z.boolean(), zod_1.z.string()])
        .transform((val) => {
        if (typeof val === "boolean")
            return val;
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return false;
    })
        .default(false),
    direction: zod_1.z.enum(client_1.Direction).default("OUTBOUND"),
    origin_share_percentage: zod_1.z
        .string()
        .transform((val) => (val === "" ? undefined : parseFloat(val)))
        .pipe(zod_1.z.number().min(0).max(100))
        .optional(),
    destination_share_percentage: zod_1.z
        .string()
        .transform((val) => (val === "" ? undefined : parseFloat(val)))
        .pipe(zod_1.z.number().min(0).max(100))
        .optional(),
    status: zod_1.z.enum(client_1.ChargeStatus).default("ACTIVE"),
    min_amount: zod_1.z
        .string()
        .transform((val) => (val === "" ? undefined : parseFloat(val)))
        .pipe(zod_1.z.number().min(0))
        .optional(),
    max_amount: zod_1.z
        .string()
        .transform((val) => (val === "" ? undefined : parseFloat(val)))
        .pipe(zod_1.z.number().min(0))
        .optional(),
});
exports.updateChargeSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters")
        .optional(),
    description: zod_1.z.string().min(1, "Description is required").optional(),
    application_method: zod_1.z.enum(client_1.ApplicationMethod).optional(),
    currency_id: zod_1.z
        .string()
        .transform((val) => (val === "" ? undefined : val))
        .pipe(zod_1.z.string().uuid("Currency ID must be a valid UUID"))
        .optional(),
    type: zod_1.z.enum(client_1.ChargeType).optional(),
    rate: zod_1.z
        .string()
        .transform((val) => (val === "" ? undefined : parseFloat(val)))
        .pipe(zod_1.z.number().min(0, "Rate must be non-negative"))
        .optional(),
    origin_organisation_id: zod_1.z
        .string()
        .uuid("Origin organisation ID must be a valid UUID")
        .optional(),
    destination_organisation_id: zod_1.z
        .string()
        .uuid("Destination organisation ID must be a valid UUID")
        .optional(),
    is_reversible: zod_1.z
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
    direction: zod_1.z.enum(client_1.Direction).optional(),
    origin_share_percentage: zod_1.z
        .string()
        .transform((val) => (val === "" ? undefined : parseFloat(val)))
        .pipe(zod_1.z.number().min(0).max(100))
        .optional(),
    destination_share_percentage: zod_1.z
        .string()
        .transform((val) => (val === "" ? undefined : parseFloat(val)))
        .pipe(zod_1.z.number().min(0).max(100))
        .optional(),
    status: zod_1.z.enum(client_1.ChargeStatus).optional(),
    min_amount: zod_1.z
        .string()
        .transform((val) => (val === "" ? undefined : parseFloat(val)))
        .pipe(zod_1.z.number().min(0))
        .optional(),
    max_amount: zod_1.z
        .string()
        .transform((val) => (val === "" ? undefined : parseFloat(val)))
        .pipe(zod_1.z.number().min(0))
        .optional(),
});
exports.chargeFiltersSchema = zod_1.z.object({
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
    type: zod_1.z.enum(client_1.ChargeType).optional(),
    status: zod_1.z.enum(client_1.ChargeStatus).optional(),
    application_method: zod_1.z.enum(client_1.ApplicationMethod).optional(),
    direction: zod_1.z.enum(client_1.Direction).optional(),
    currency_id: zod_1.z.string().uuid().optional(),
    origin_organisation_id: zod_1.z.string().uuid().optional(),
    destination_organisation_id: zod_1.z.string().uuid().optional(),
    created_by: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=charges.validation.js.map