import { z } from "zod";
export declare const createCustomerSchema: z.ZodObject<{
    full_name: z.ZodString;
    date_of_birth: z.ZodOptional<z.ZodString>;
    nationality_id: z.ZodOptional<z.ZodString>;
    residence_country_id: z.ZodOptional<z.ZodString>;
    id_type: z.ZodOptional<z.ZodEnum<{
        OTHER: "OTHER";
        PASSPORT: "PASSPORT";
        NATIONAL_ID: "NATIONAL_ID";
        DRIVERS_LICENSE: "DRIVERS_LICENSE";
        ALIEN_CARD: "ALIEN_CARD";
        KRA_PIN: "KRA_PIN";
    }>>;
    id_number: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone_number: z.ZodOptional<z.ZodString>;
    occupation_id: z.ZodOptional<z.ZodString>;
    risk_rating: z.ZodDefault<z.ZodNumber>;
    risk_reasons: z.ZodOptional<z.ZodString>;
    organisation_id: z.ZodString;
    branch_id: z.ZodString;
    tax_number_type: z.ZodOptional<z.ZodEnum<{
        OTHER: "OTHER";
        KRA_PIN: "KRA_PIN";
        PIN: "PIN";
        TIN: "TIN";
        SSN: "SSN";
    }>>;
    tax_number: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<{
        OTHER: "OTHER";
        MALE: "MALE";
        FEMALE: "FEMALE";
    }>>;
    customer_type: z.ZodEnum<{
        INDIVIDUAL: "INDIVIDUAL";
        CORPORATE: "CORPORATE";
        BUSINESS: "BUSINESS";
    }>;
    incorporation_country_id: z.ZodOptional<z.ZodString>;
    incoporated_date: z.ZodOptional<z.ZodString>;
    estimated_monthly_income: z.ZodOptional<z.ZodNumber>;
    org_reg_number: z.ZodOptional<z.ZodString>;
    current_age: z.ZodOptional<z.ZodNumber>;
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    currency_id: z.ZodOptional<z.ZodString>;
    industry_id: z.ZodOptional<z.ZodString>;
    legacy_customer_id: z.ZodOptional<z.ZodString>;
    has_adverse_media: z.ZodDefault<z.ZodBoolean>;
    adverse_media_reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateCustomerSchema: z.ZodObject<{
    full_name: z.ZodOptional<z.ZodString>;
    date_of_birth: z.ZodOptional<z.ZodString>;
    nationality_id: z.ZodOptional<z.ZodString>;
    residence_country_id: z.ZodOptional<z.ZodString>;
    id_type: z.ZodOptional<z.ZodEnum<{
        OTHER: "OTHER";
        PASSPORT: "PASSPORT";
        NATIONAL_ID: "NATIONAL_ID";
        DRIVERS_LICENSE: "DRIVERS_LICENSE";
        ALIEN_CARD: "ALIEN_CARD";
        KRA_PIN: "KRA_PIN";
    }>>;
    id_number: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone_number: z.ZodOptional<z.ZodString>;
    occupation_id: z.ZodOptional<z.ZodString>;
    risk_rating: z.ZodOptional<z.ZodNumber>;
    risk_reasons: z.ZodOptional<z.ZodString>;
    branch_id: z.ZodOptional<z.ZodString>;
    tax_number_type: z.ZodOptional<z.ZodEnum<{
        OTHER: "OTHER";
        KRA_PIN: "KRA_PIN";
        PIN: "PIN";
        TIN: "TIN";
        SSN: "SSN";
    }>>;
    tax_number: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<{
        OTHER: "OTHER";
        MALE: "MALE";
        FEMALE: "FEMALE";
    }>>;
    customer_type: z.ZodOptional<z.ZodEnum<{
        INDIVIDUAL: "INDIVIDUAL";
        CORPORATE: "CORPORATE";
        BUSINESS: "BUSINESS";
    }>>;
    incorporation_country_id: z.ZodOptional<z.ZodString>;
    incoporated_date: z.ZodOptional<z.ZodString>;
    estimated_monthly_income: z.ZodOptional<z.ZodNumber>;
    org_reg_number: z.ZodOptional<z.ZodString>;
    current_age: z.ZodOptional<z.ZodNumber>;
    first_name: z.ZodOptional<z.ZodString>;
    last_name: z.ZodOptional<z.ZodString>;
    currency_id: z.ZodOptional<z.ZodString>;
    industry_id: z.ZodOptional<z.ZodString>;
    legacy_customer_id: z.ZodOptional<z.ZodString>;
    has_adverse_media: z.ZodOptional<z.ZodBoolean>;
    adverse_media_reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const customerFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    customer_type: z.ZodOptional<z.ZodEnum<{
        INDIVIDUAL: "INDIVIDUAL";
        CORPORATE: "CORPORATE";
        BUSINESS: "BUSINESS";
    }>>;
    organisation_id: z.ZodOptional<z.ZodString>;
    branch_id: z.ZodOptional<z.ZodString>;
    nationality_id: z.ZodOptional<z.ZodString>;
    residence_country_id: z.ZodOptional<z.ZodString>;
    occupation_id: z.ZodOptional<z.ZodString>;
    industry_id: z.ZodOptional<z.ZodString>;
    gender: z.ZodOptional<z.ZodEnum<{
        OTHER: "OTHER";
        MALE: "MALE";
        FEMALE: "FEMALE";
    }>>;
    has_adverse_media: z.ZodOptional<z.ZodPipe<z.ZodUnion<readonly [z.ZodBoolean, z.ZodString]>, z.ZodTransform<boolean | undefined, string | boolean>>>;
    created_by: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=customers.validation.d.ts.map