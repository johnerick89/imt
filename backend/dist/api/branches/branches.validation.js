"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.branchFiltersSchema = exports.updateBranchSchema = exports.createBranchSchema = void 0;
const zod_1 = require("zod");
exports.createBranchSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters"),
    address: zod_1.z.string().min(1, "Address is required"),
    city: zod_1.z.string().min(1, "City is required"),
    state: zod_1.z.string().min(1, "State is required"),
    country: zod_1.z.string().min(1, "Country is required"),
    zip_code: zod_1.z.string().min(1, "Zip code is required"),
    phone: zod_1.z.string().min(1, "Phone is required"),
    email: zod_1.z.string().email("Invalid email format"),
    organisation_id: zod_1.z.string().uuid("Organisation ID must be a valid UUID"),
});
exports.updateBranchSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters")
        .optional(),
    address: zod_1.z.string().min(1, "Address is required").optional(),
    city: zod_1.z.string().min(1, "City is required").optional(),
    state: zod_1.z.string().min(1, "State is required").optional(),
    country: zod_1.z.string().min(1, "Country is required").optional(),
    zip_code: zod_1.z.string().min(1, "Zip code is required").optional(),
    phone: zod_1.z.string().min(1, "Phone is required").optional(),
    email: zod_1.z.string().email("Invalid email format").optional(),
});
exports.branchFiltersSchema = zod_1.z.object({
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
    organisation_id: zod_1.z.string().uuid().optional(),
    city: zod_1.z.string().optional(),
    state: zod_1.z.string().optional(),
    country: zod_1.z.string().optional(),
    created_by: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=branches.validation.js.map