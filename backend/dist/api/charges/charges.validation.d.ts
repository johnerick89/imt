import { z } from "zod";
export declare const createChargeSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    application_method: z.ZodEnum<{
        PERCENTAGE: "PERCENTAGE";
        FIXED: "FIXED";
    }>;
    currency_id: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodString>>;
    type: z.ZodEnum<{
        TAX: "TAX";
        INTERNAL_FEE: "INTERNAL_FEE";
        COMMISSION: "COMMISSION";
        OTHER: "OTHER";
    }>;
    rate: z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>;
    origin_organisation_id: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodString>>;
    destination_organisation_id: z.ZodOptional<z.ZodString>;
    is_reversible: z.ZodDefault<z.ZodPipe<z.ZodUnion<readonly [z.ZodBoolean, z.ZodString]>, z.ZodTransform<boolean, string | boolean>>>;
    direction: z.ZodDefault<z.ZodEnum<{
        INBOUND: "INBOUND";
        OUTBOUND: "OUTBOUND";
    }>>;
    origin_share_percentage: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber>>;
    destination_share_percentage: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber>>;
    status: z.ZodDefault<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        BLOCKED: "BLOCKED";
    }>>;
    min_amount: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber>>;
    max_amount: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber>>;
}, z.core.$strip>;
export declare const updateChargeSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    application_method: z.ZodOptional<z.ZodEnum<{
        PERCENTAGE: "PERCENTAGE";
        FIXED: "FIXED";
    }>>;
    currency_id: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<string | undefined, string>>, z.ZodString>>;
    type: z.ZodOptional<z.ZodEnum<{
        TAX: "TAX";
        INTERNAL_FEE: "INTERNAL_FEE";
        COMMISSION: "COMMISSION";
        OTHER: "OTHER";
    }>>;
    rate: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber>>;
    origin_organisation_id: z.ZodOptional<z.ZodString>;
    destination_organisation_id: z.ZodOptional<z.ZodString>;
    is_reversible: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodBoolean, z.ZodString]>, z.ZodTransform<boolean | undefined, string | boolean>>>;
    direction: z.ZodOptional<z.ZodEnum<{
        INBOUND: "INBOUND";
        OUTBOUND: "OUTBOUND";
    }>>;
    origin_share_percentage: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber>>;
    destination_share_percentage: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber>>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        BLOCKED: "BLOCKED";
    }>>;
    min_amount: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber>>;
    max_amount: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number | undefined, string>>, z.ZodNumber>>;
}, z.core.$strip>;
export declare const chargeFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        TAX: "TAX";
        INTERNAL_FEE: "INTERNAL_FEE";
        COMMISSION: "COMMISSION";
        OTHER: "OTHER";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        BLOCKED: "BLOCKED";
    }>>;
    application_method: z.ZodOptional<z.ZodEnum<{
        PERCENTAGE: "PERCENTAGE";
        FIXED: "FIXED";
    }>>;
    direction: z.ZodOptional<z.ZodEnum<{
        INBOUND: "INBOUND";
        OUTBOUND: "OUTBOUND";
    }>>;
    currency_id: z.ZodOptional<z.ZodString>;
    origin_organisation_id: z.ZodOptional<z.ZodString>;
    destination_organisation_id: z.ZodOptional<z.ZodString>;
    created_by: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=charges.validation.d.ts.map