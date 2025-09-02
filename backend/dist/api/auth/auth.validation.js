"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSchema = exports.loginSchema = void 0;
const zod_1 = require("zod");
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format").min(1, "Email is required"),
    password: zod_1.z
        .string()
        .min(6, "Password must be at least 6 characters")
        .max(100, "Password must be less than 100 characters"),
});
exports.registerSchema = zod_1.z.object({
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
    phone: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    organisation_id: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=auth.validation.js.map