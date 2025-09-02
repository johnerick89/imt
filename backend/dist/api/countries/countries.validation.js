"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countryFiltersSchema = exports.updateCountrySchema = exports.createCountrySchema = void 0;
const zod_1 = require("zod");
exports.createCountrySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Country name is required")
        .max(100, "Country name must be less than 100 characters"),
    code: zod_1.z
        .string()
        .min(1, "Country code is required")
        .max(10, "Country code must be less than 10 characters")
        .toUpperCase(),
});
exports.updateCountrySchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Country name is required")
        .max(100, "Country name must be less than 100 characters")
        .optional(),
    code: zod_1.z
        .string()
        .min(1, "Country code is required")
        .max(10, "Country code must be less than 10 characters")
        .toUpperCase()
        .optional(),
});
exports.countryFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    code: zod_1.z.string().optional(),
    page: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(zod_1.z.number().min(1).max(100))
        .optional(),
    limit: zod_1.z
        .string()
        .transform((val) => parseInt(val, 10))
        .pipe(zod_1.z.number().min(1).max(100))
        .optional(),
});
//# sourceMappingURL=countries.validation.js.map