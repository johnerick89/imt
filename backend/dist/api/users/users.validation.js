"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleUserStatusSchema = exports.userFiltersSchema = exports.updateUserSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be less than 100 characters"),
    first_name: zod_1.z
        .string()
        .min(1, "First name is required")
        .max(50, "First name must be less than 50 characters"),
    last_name: zod_1.z
        .string()
        .min(1, "Last name is required")
        .max(50, "Last name must be less than 50 characters"),
    role: zod_1.z
        .string()
        .min(1, "Role is required")
        .max(20, "Role must be less than 20 characters"),
    avatar: zod_1.z.string().url("Invalid avatar URL").optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    organisation_id: zod_1.z.string().uuid().optional(),
});
exports.updateUserSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").optional(),
    first_name: zod_1.z
        .string()
        .min(1, "First name is required")
        .max(50, "First name must be less than 50 characters")
        .optional(),
    last_name: zod_1.z
        .string()
        .min(1, "Last name is required")
        .max(50, "Last name must be less than 50 characters")
        .optional(),
    role: zod_1.z
        .string()
        .min(1, "Role is required")
        .max(20, "Role must be less than 20 characters")
        .optional(),
    avatar: zod_1.z.string().url("Invalid avatar URL").optional(),
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    organisation_id: zod_1.z.string().uuid().optional(),
    status: zod_1.z.nativeEnum(client_1.UserStatus).optional(),
});
exports.userFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    role: zod_1.z.string().optional(),
    status: zod_1.z.nativeEnum(client_1.UserStatus).optional(),
    organisation_id: zod_1.z.string().uuid().optional(),
    page: zod_1.z.number().min(1, "Page must be at least 1").optional(),
    limit: zod_1.z
        .number()
        .min(1, "Limit must be at least 1")
        .max(100, "Limit must be at most 100")
        .optional(),
});
exports.toggleUserStatusSchema = zod_1.z.object({
    status: zod_1.z.nativeEnum(client_1.UserStatus),
});
//# sourceMappingURL=users.validation.js.map