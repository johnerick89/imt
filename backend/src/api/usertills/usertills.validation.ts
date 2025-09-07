import { z } from "zod";
import { UserTillStatus } from "@prisma/client";

export const createUserTillSchema = z.object({
  user_id: z.string().uuid("Invalid user ID"),
  till_id: z.string().uuid("Invalid till ID"),
  opening_balance: z.preprocess(
    (val) => (val === "" || val === undefined ? 0 : parseFloat(val as string)),
    z.number().min(0, "Opening balance must be non-negative")
  ),
  closing_balance: z.preprocess(
    (val) =>
      val === "" || val === undefined ? undefined : parseFloat(val as string),
    z.number().min(0, "Closing balance must be non-negative").optional()
  ),
  date: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return new Date().toISOString();
      return new Date(val).toISOString();
    }),
  status: z.nativeEnum(UserTillStatus).optional(),
});

export const updateUserTillSchema = z.object({
  user_id: z.string().uuid("Invalid user ID").optional(),
  till_id: z.string().uuid("Invalid till ID").optional(),
  opening_balance: z.preprocess(
    (val) =>
      val === "" || val === undefined ? undefined : parseFloat(val as string),
    z.number().min(0, "Opening balance must be non-negative").optional()
  ),
  closing_balance: z.preprocess(
    (val) =>
      val === "" || val === undefined ? undefined : parseFloat(val as string),
    z.number().min(0, "Closing balance must be non-negative").optional()
  ),
  date: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return new Date(val).toISOString();
    }),
  status: z.nativeEnum(UserTillStatus).optional(),
});

export const userTillFiltersSchema = z.object({
  page: z.preprocess(
    (val) => (val ? parseInt(val as string) : 1),
    z.number().int().positive().optional()
  ),
  limit: z.preprocess(
    (val) => (val ? parseInt(val as string) : 10),
    z.number().int().positive().max(100).optional()
  ),
  search: z.string().optional(),
  user_id: z.string().uuid().optional(),
  till_id: z.string().uuid().optional(),
  status: z.nativeEnum(UserTillStatus).optional(),
});
