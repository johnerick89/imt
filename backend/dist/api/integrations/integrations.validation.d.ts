import { z } from "zod";
export declare const createIntegrationSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    organisation_id: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        API: "API";
        WEBHOOK: "WEBHOOK";
        EMAIL: "EMAIL";
        SMS: "SMS";
    }>;
    status: z.ZodDefault<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        BLOCKED: "BLOCKED";
    }>>;
    api_key: z.ZodOptional<z.ZodString>;
    api_secret: z.ZodOptional<z.ZodString>;
    endpoint_url: z.ZodOptional<z.ZodString>;
    webhook_secret: z.ZodOptional<z.ZodString>;
    configuration: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const updateIntegrationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    organisation_id: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        API: "API";
        WEBHOOK: "WEBHOOK";
        EMAIL: "EMAIL";
        SMS: "SMS";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        BLOCKED: "BLOCKED";
    }>>;
    api_key: z.ZodOptional<z.ZodString>;
    api_secret: z.ZodOptional<z.ZodString>;
    endpoint_url: z.ZodOptional<z.ZodString>;
    webhook_secret: z.ZodOptional<z.ZodString>;
    configuration: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export declare const integrationFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        API: "API";
        WEBHOOK: "WEBHOOK";
        EMAIL: "EMAIL";
        SMS: "SMS";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        BLOCKED: "BLOCKED";
    }>>;
    organisation_id: z.ZodOptional<z.ZodString>;
    created_by: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=integrations.validation.d.ts.map