"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.industryFiltersSchema = exports.updateIndustrySchema = exports.createIndustrySchema = void 0;
const zod_1 = require("zod");
exports.createIndustrySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters"),
    description: zod_1.z.string().optional(),
});
exports.updateIndustrySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters")
        .optional(),
    description: zod_1.z.string().optional(),
});
exports.industryFiltersSchema = zod_1.z.object({
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
});
//# sourceMappingURL=industries.validation.js.map