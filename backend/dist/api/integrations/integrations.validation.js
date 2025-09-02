"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationFiltersSchema = exports.updateIntegrationSchema = exports.createIntegrationSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createIntegrationSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters"),
    description: zod_1.z.string().optional(),
    organisation_id: zod_1.z.string().uuid().optional(),
    type: zod_1.z.enum([
        client_1.IntegrationType.API,
        client_1.IntegrationType.WEBHOOK,
        client_1.IntegrationType.EMAIL,
        client_1.IntegrationType.SMS,
    ]),
    status: zod_1.z
        .enum([
        client_1.IntegrationStatus.ACTIVE,
        client_1.IntegrationStatus.INACTIVE,
        client_1.IntegrationStatus.PENDING,
        client_1.IntegrationStatus.BLOCKED,
    ])
        .default("ACTIVE"),
    api_key: zod_1.z.string().optional(),
    api_secret: zod_1.z.string().optional(),
    endpoint_url: zod_1.z.string().url().optional(),
    webhook_secret: zod_1.z.string().optional(),
    configuration: zod_1.z.any().optional(),
});
exports.updateIntegrationSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .min(1, "Name is required")
        .max(256, "Name must be less than 256 characters")
        .optional(),
    description: zod_1.z.string().optional(),
    organisation_id: zod_1.z.string().uuid().optional(),
    type: zod_1.z
        .enum([
        client_1.IntegrationType.API,
        client_1.IntegrationType.WEBHOOK,
        client_1.IntegrationType.EMAIL,
        client_1.IntegrationType.SMS,
    ])
        .optional(),
    status: zod_1.z
        .enum([
        client_1.IntegrationStatus.ACTIVE,
        client_1.IntegrationStatus.INACTIVE,
        client_1.IntegrationStatus.PENDING,
        client_1.IntegrationStatus.BLOCKED,
    ])
        .optional(),
    api_key: zod_1.z.string().optional(),
    api_secret: zod_1.z.string().optional(),
    endpoint_url: zod_1.z.string().url().optional(),
    webhook_secret: zod_1.z.string().optional(),
    configuration: zod_1.z.any().optional(),
});
exports.integrationFiltersSchema = zod_1.z.object({
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
    type: zod_1.z
        .enum([
        client_1.IntegrationType.API,
        client_1.IntegrationType.WEBHOOK,
        client_1.IntegrationType.EMAIL,
        client_1.IntegrationType.SMS,
    ])
        .optional(),
    status: zod_1.z
        .enum([
        client_1.IntegrationStatus.ACTIVE,
        client_1.IntegrationStatus.INACTIVE,
        client_1.IntegrationStatus.PENDING,
        client_1.IntegrationStatus.BLOCKED,
    ])
        .optional(),
    organisation_id: zod_1.z.string().uuid().optional(),
    created_by: zod_1.z.string().uuid().optional(),
});
//# sourceMappingURL=integrations.validation.js.map