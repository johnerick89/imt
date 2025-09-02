import { z } from "zod";
export declare const createBeneficiarySchema: z.ZodObject<{
    customer_id: z.ZodString;
    type: z.ZodEnum<{
        INDIVIDUAL: "INDIVIDUAL";
        CORPORATE: "CORPORATE";
        BUSINESS: "BUSINESS";
    }>;
    risk_contribution: z.ZodOptional<z.ZodNumber>;
    risk_contribution_details: z.ZodOptional<z.ZodAny>;
    name: z.ZodString;
    date_of_birth: z.ZodOptional<z.ZodString>;
    nationality_id: z.ZodOptional<z.ZodString>;
    residence_country_id: z.ZodOptional<z.ZodString>;
    incorporation_country_id: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    id_type: z.ZodOptional<z.ZodEnum<{
        OTHER: "OTHER";
        PASSPORT: "PASSPORT";
        NATIONAL_ID: "NATIONAL_ID";
        DRIVERS_LICENSE: "DRIVERS_LICENSE";
        ALIEN_CARD: "ALIEN_CARD";
        KRA_PIN: "KRA_PIN";
    }>>;
    id_number: z.ZodOptional<z.ZodString>;
    tax_number_type: z.ZodOptional<z.ZodEnum<{
        OTHER: "OTHER";
        KRA_PIN: "KRA_PIN";
        PIN: "PIN";
        TIN: "TIN";
        SSN: "SSN";
    }>>;
    tax_number: z.ZodOptional<z.ZodString>;
    reg_number: z.ZodOptional<z.ZodString>;
    occupation_id: z.ZodOptional<z.ZodString>;
    industry_id: z.ZodOptional<z.ZodString>;
    organisation_id: z.ZodString;
}, z.core.$strip>;
export declare const updateBeneficiarySchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<{
        INDIVIDUAL: "INDIVIDUAL";
        CORPORATE: "CORPORATE";
        BUSINESS: "BUSINESS";
    }>>;
    risk_contribution: z.ZodOptional<z.ZodNumber>;
    risk_contribution_details: z.ZodOptional<z.ZodAny>;
    name: z.ZodOptional<z.ZodString>;
    date_of_birth: z.ZodOptional<z.ZodString>;
    nationality_id: z.ZodOptional<z.ZodString>;
    residence_country_id: z.ZodOptional<z.ZodString>;
    incorporation_country_id: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    id_type: z.ZodOptional<z.ZodEnum<{
        OTHER: "OTHER";
        PASSPORT: "PASSPORT";
        NATIONAL_ID: "NATIONAL_ID";
        DRIVERS_LICENSE: "DRIVERS_LICENSE";
        ALIEN_CARD: "ALIEN_CARD";
        KRA_PIN: "KRA_PIN";
    }>>;
    id_number: z.ZodOptional<z.ZodString>;
    tax_number_type: z.ZodOptional<z.ZodEnum<{
        OTHER: "OTHER";
        KRA_PIN: "KRA_PIN";
        PIN: "PIN";
        TIN: "TIN";
        SSN: "SSN";
    }>>;
    tax_number: z.ZodOptional<z.ZodString>;
    reg_number: z.ZodOptional<z.ZodString>;
    occupation_id: z.ZodOptional<z.ZodString>;
    industry_id: z.ZodOptional<z.ZodString>;
    organisation_id: z.ZodString;
}, z.core.$strip>;
export declare const beneficiaryFiltersSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    limit: z.ZodDefault<z.ZodPipe<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>, z.ZodNumber>>;
    search: z.ZodOptional<z.ZodString>;
    customer_id: z.ZodOptional<z.ZodString>;
    organisation_id: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodEnum<{
        INDIVIDUAL: "INDIVIDUAL";
        CORPORATE: "CORPORATE";
        BUSINESS: "BUSINESS";
    }>>;
    nationality_id: z.ZodOptional<z.ZodString>;
    residence_country_id: z.ZodOptional<z.ZodString>;
    occupation_id: z.ZodOptional<z.ZodString>;
    industry_id: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=beneficiaries.validation.d.ts.map