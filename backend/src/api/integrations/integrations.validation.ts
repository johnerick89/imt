import { z } from "zod";
import { IntegrationType, IntegrationStatus } from "@prisma/client";

export const createIntegrationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters"),
  description: z.string().optional(),
  organisation_id: z.string().uuid().optional(),
  origin_organisation_id: z.string().uuid().optional(),
  type: z.enum([
    IntegrationType.API,
    IntegrationType.WEBHOOK,
    IntegrationType.EMAIL,
    IntegrationType.SMS,
  ]),
  status: z
    .enum([
      IntegrationStatus.ACTIVE,
      IntegrationStatus.INACTIVE,
      IntegrationStatus.PENDING,
      IntegrationStatus.BLOCKED,
    ])
    .default("ACTIVE"),
  api_key: z.string().optional(),
  api_secret: z.string().optional(),
  endpoint_url: z.string().url().optional(),
  webhook_secret: z.string().optional(),
  configuration: z.any().optional(),
});

export const updateIntegrationSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(256, "Name must be less than 256 characters")
    .optional(),
  description: z.string().optional(),
  organisation_id: z.string().uuid().optional(),
  origin_organisation_id: z.string().uuid().optional(),
  type: z
    .enum([
      IntegrationType.API,
      IntegrationType.WEBHOOK,
      IntegrationType.EMAIL,
      IntegrationType.SMS,
    ])
    .optional(),
  status: z
    .enum([
      IntegrationStatus.ACTIVE,
      IntegrationStatus.INACTIVE,
      IntegrationStatus.PENDING,
      IntegrationStatus.BLOCKED,
    ])
    .optional(),
  api_key: z.string().optional(),
  api_secret: z.string().optional(),
  endpoint_url: z.string().url().optional(),
  webhook_secret: z.string().optional(),
  configuration: z.any().optional(),
});

export const integrationFiltersSchema = z.object({
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .default(1),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(100))
    .default(10),
  search: z.string().optional(),
  type: z
    .enum([
      IntegrationType.API,
      IntegrationType.WEBHOOK,
      IntegrationType.EMAIL,
      IntegrationType.SMS,
    ])
    .optional(),
  status: z
    .enum([
      IntegrationStatus.ACTIVE,
      IntegrationStatus.INACTIVE,
      IntegrationStatus.PENDING,
      IntegrationStatus.BLOCKED,
    ])
    .optional(),
  organisation_id: z.string().uuid().optional(),
  origin_organisation_id: z.string().uuid().optional(),
  created_by: z.string().uuid().optional(),
});
