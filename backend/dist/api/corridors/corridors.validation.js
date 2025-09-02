"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corridorFiltersSchema = exports.updateCorridorSchema = exports.createCorridorSchema = void 0;
const zod_1 = require("zod");
exports.createCorridorSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters"),
    description: zod_1.z.string().min(1, "Description is required"),
    base_country_id: zod_1.z.string().uuid("Base country ID must be a valid UUID"),
    destination_country_id: zod_1.z
        .string()
        .uuid("Destination country ID must be a valid UUID"),
    base_currency_id: zod_1.z.string().uuid("Base currency ID must be a valid UUID"),
    organisation_id: zod_1.z.string().uuid("Organisation ID must be a valid UUID"),
    status: zod_1.z
        .enum(["ACTIVE", "INACTIVE", "PENDING", "BLOCKED"])
        .default("ACTIVE"),
});
exports.updateCorridorSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters")
        .optional(),
    description: zod_1.z.string().min(1, "Description is required").optional(),
    base_country_id: zod_1.z
        .string()
        .uuid("Base country ID must be a valid UUID")
        .optional(),
    destination_country_id: zod_1.z
        .string()
        .uuid("Destination country ID must be a valid UUID")
        .optional(),
    base_currency_id: zod_1.z
        .string()
        .uuid("Base currency ID must be a valid UUID")
        .optional(),
    organisation_id: zod_1.z
        .string()
        .uuid("Organisation ID must be a valid UUID")
        .optional(),
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "PENDING", "BLOCKED"]).optional(),
});
exports.corridorFiltersSchema = zod_1.z.object({
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
    status: zod_1.z.enum(["ACTIVE", "INACTIVE", "PENDING", "BLOCKED"]).optional(),
    base_country_id: zod_1.z.string().uuid().optional(),
    destination_country_id: zod_1.z.string().uuid().optional(),
    base_currency_id: zod_1.z.string().uuid().optional(),
    organisation_id: zod_1.z.string().uuid().optional(),
    created_by: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=corridors.validation.js.map