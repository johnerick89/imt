import { z } from "zod";

// Transaction Channel Filters Schema
export const transactionChannelFiltersSchema = z.object({
  page: z.preprocess((val) => {
    const parsed = parseInt(val as string, 10);
    return isNaN(parsed) ? 1 : parsed;
  }, z.number().min(1)),
  limit: z.preprocess((val) => {
    const parsed = parseInt(val as string, 10);
    return isNaN(parsed) ? 10 : parsed;
  }, z.number().min(1).max(100)),
  search: z.string().optional(),
  direction: z.string().optional(),
  created_by: z.string().uuid().optional(),
});

// Create Transaction Channel Schema
export const createTransactionChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required").max(255),
  description: z.string().min(1, "Description is required").max(1000),
  direction: z
    .array(z.string().min(1, "Direction cannot be empty"))
    .min(1, "At least one direction is required"),
});

// Update Transaction Channel Schema
export const updateTransactionChannelSchema = z.object({
  name: z.string().min(1, "Channel name is required").max(255).optional(),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000)
    .optional(),
  direction: z
    .array(z.string().min(1, "Direction cannot be empty"))
    .min(1, "At least one direction is required")
    .optional(),
});

// Transaction Channel ID Schema
export const transactionChannelIdSchema = z.object({
  id: z.string().uuid("Invalid transaction channel ID"),
});
