import { z } from "zod";
export declare const createOrganisationSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        PARTNER: "PARTNER";
        AGENCY: "AGENCY";
        CUSTOMER: "CUSTOMER";
    }>;
    integration_mode: z.ZodOptional<z.ZodEnum<{
        INTERNAL: "INTERNAL";
        EXTERNAL: "EXTERNAL";
    }>>;
    contact_person: z.ZodOptional<z.ZodString>;
    contact_email: z.ZodOptional<z.ZodString>;
    contact_phone: z.ZodOptional<z.ZodString>;
    contact_address: z.ZodOptional<z.ZodString>;
    contact_city: z.ZodOptional<z.ZodString>;
    contact_state: z.ZodOptional<z.ZodString>;
    contact_zip: z.ZodOptional<z.ZodString>;
    base_currency_id: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<string | null | undefined, string | null | undefined>>;
    country_id: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<string | null | undefined, string | null | undefined>>;
}, z.core.$strip>;
export declare const updateOrganisationSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        PARTNER: "PARTNER";
        AGENCY: "AGENCY";
        CUSTOMER: "CUSTOMER";
    }>>;
    integration_mode: z.ZodOptional<z.ZodEnum<{
        INTERNAL: "INTERNAL";
        EXTERNAL: "EXTERNAL";
    }>>;
    contact_person: z.ZodOptional<z.ZodString>;
    contact_email: z.ZodOptional<z.ZodString>;
    contact_phone: z.ZodOptional<z.ZodString>;
    contact_address: z.ZodOptional<z.ZodString>;
    contact_city: z.ZodOptional<z.ZodString>;
    contact_state: z.ZodOptional<z.ZodString>;
    contact_zip: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        BLOCKED: "BLOCKED";
    }>>;
    base_currency_id: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<string | null | undefined, string | null | undefined>>;
    country_id: z.ZodPipe<z.ZodNullable<z.ZodOptional<z.ZodString>>, z.ZodTransform<string | null | undefined, string | null | undefined>>;
}, z.core.$strip>;
export declare const organisationFiltersSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        PARTNER: "PARTNER";
        AGENCY: "AGENCY";
        CUSTOMER: "CUSTOMER";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        ACTIVE: "ACTIVE";
        INACTIVE: "INACTIVE";
        PENDING: "PENDING";
        BLOCKED: "BLOCKED";
    }>>;
    integration_mode: z.ZodOptional<z.ZodEnum<{
        INTERNAL: "INTERNAL";
        EXTERNAL: "EXTERNAL";
    }>>;
    country_id: z.ZodOptional<z.ZodString>;
    base_currency_id: z.ZodOptional<z.ZodString>;
    page: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
}, z.core.$strip>;
export declare const organisationIdSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=organisations.validation.d.ts.map