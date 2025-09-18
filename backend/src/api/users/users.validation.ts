import { z } from "zod";
import { UserStatus } from "@prisma/client";

export const createUserSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password must be less than 100 characters"),
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters"),
  role: z
    .string()
    .min(1, "Role is required")
    .max(20, "Role must be less than 20 characters"),
  role_id: z.string().uuid("Invalid role ID"),
  avatar: z.string().url("Invalid avatar URL").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  organisation_id: z.string().uuid().optional(),
});

export const updateUserSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  first_name: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .optional(),
  last_name: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .optional(),
  role: z
    .string()
    .min(1, "Role is required")
    .max(20, "Role must be less than 20 characters")
    .optional(),
  role_id: z.string().uuid("Invalid role ID").optional(),
  avatar: z.string().url("Invalid avatar URL").optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  organisation_id: z.string().uuid().optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  role_id: z.string().uuid("Invalid role ID").optional(),
  status: z.nativeEnum(UserStatus).optional(),
  organisation_id: z.string().uuid().optional(),
  page: z.number().min(1, "Page must be at least 1").optional(),
  limit: z
    .number()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit must be at most 100")
    .optional(),
});

export const toggleUserStatusSchema = z.object({
  status: z.nativeEnum(UserStatus),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(6, "Confirm password must be at least 6 characters"),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z
    .string()
    .min(6, "Confirm password must be at least 6 characters"),
});

export const userStatsFiltersSchema = z.object({
  organisation_id: z.string().uuid().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFiltersInput = z.infer<typeof userFiltersSchema>;
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UserStatsFiltersInput = z.infer<typeof userStatsFiltersSchema>;
