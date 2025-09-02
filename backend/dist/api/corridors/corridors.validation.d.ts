import { z } from "zod";
export declare const createCorridorSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    base_country_id: z.ZodString;
    destination_country_id: z.ZodString;
    base_currency_id: z.ZodString;
    organisation_id: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        BLOCKED: "BLOCKED";
    }>>;
}, z.core.$strip>;
export declare const updateCorridorSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    base_country_id: z.ZodOptional<z.ZodString>;
    destination_country_id: z.ZodOptional<z.ZodString>;
    base_currency_id: z.ZodOptional<z.ZodString>;
    organisation_id: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        BLOCKED: "BLOCKED";
    }>>;
}, z.core.$strip>;
export declare const corridorFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        BLOCKED: "BLOCKED";
    }>>;
    base_country_id: z.ZodOptional<z.ZodString>;
    destination_country_id: z.ZodOptional<z.ZodString>;
    base_currency_id: z.ZodOptional<z.ZodString>;
    organisation_id: z.ZodOptional<z.ZodString>;
    created_by: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=corridors.validation.d.ts.map