import { z } from "zod";

// Common param schema for organisationId in route params
export const organisationIdParamSchema = z.object({
  organisationId: z.string().min(1, "organisationId is required"),
});
