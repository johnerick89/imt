"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.occupationFiltersSchema = exports.updateOccupationSchema = exports.createOccupationSchema = void 0;
const zod_1 = require("zod");
exports.createOccupationSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters"),
    description: zod_1.z.string().optional(),
});
exports.updateOccupationSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters")
        .optional(),
    description: zod_1.z.string().optional(),
});
exports.occupationFiltersSchema = zod_1.z.object({
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
//# sourceMappingURL=occupations.validation.js.map