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
