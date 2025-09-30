import type { Organisation } from "./OrganisationsTypes";
import type { Occupation } from "./OccupationsTypes";
import type { Industry } from "./IndustriesTypes";
import type { Currency } from "./CurrenciesTypes";
import type { Country } from "./CountriesTypes";
import type { User } from "./UsersTypes";
import type { Branch } from "./BranchesTypes";
import type { Beneficiary } from "./BeneficiariesTypes";

export const CustomerType = ["INDIVIDUAL", "CORPORATE", "BUSINESS"] as const;
export type CustomerType = (typeof CustomerType)[number];
export const Gender = ["MALE", "FEMALE", "OTHER"] as const;
export type Gender = (typeof Gender)[number];
export const IdType = [
  "PASSPORT",
  "NATIONAL_ID",
  "DRIVERS_LICENSE",
  "ALIEN_CARD",
  "KRA_PIN",
  "OTHER",
] as const;
export type IdType = (typeof IdType)[number];
export const TaxNumberType = ["PIN", "TIN", "SSN", "KRA_PIN", "OTHER"] as const;
export type TaxNumberType = (typeof TaxNumberType)[number];
export const OccupationType = ["INDIVIDUAL", "CORPORATE", "BUSINESS"] as const;
export type OccupationType = (typeof OccupationType)[number];
export const IndustryType = ["INDIVIDUAL", "CORPORATE", "BUSINESS"] as const;
export type IndustryType = (typeof IndustryType)[number];
export const CurrencyType = ["INDIVIDUAL", "CORPORATE", "BUSINESS"] as const;
export type CurrencyType = (typeof CurrencyType)[number];
export const IncorporationCountryType = [
  "INDIVIDUAL",
  "CORPORATE",
  "BUSINESS",
] as const;
export type IncorporationCountryType =
  (typeof IncorporationCountryType)[number];

export const CustomerStatus = [
  "ACTIVE",
  "INACTIVE",
  "PENDING",
  "BLOCKED",
] as const;
export type CustomerStatus = (typeof CustomerStatus)[number];

export interface Customer {
  id: string;
  full_name: string;
  date_of_birth?: Date | null;
  nationality_id?: string | null;
  nationality?: Country | null;
  residence_country_id?: string | null;
  residence_country?: Country | null;
  id_type?: IdType | null;
  id_number?: string | null;
  address?: string | null;
  email?: string | null;
  phone_number?: string | null;
  occupation_id?: string | null;
  occupation?: Occupation | null;
  registration_date: Date;
  risk_rating: number;
  risk_reasons?: string | null;
  organisation_id: string;
  organisation: Organisation;
  branch_id: string;
  branch: Branch;
  created_at: Date;
  updated_at: Date;
  tax_number_type?: TaxNumberType | null;
  tax_number?: string | null;
  gender?: Gender | null;
  customer_type: CustomerType;
  incorporation_country_id?: string | null;
  incorporation_country?: Country | null;
  incoporated_date?: Date | null;
  estimated_monthly_income?: number | null;
  org_reg_number?: string | null;
  current_age?: number | null;
  first_name?: string | null;
  last_name?: string | null;
  currency_id?: string | null;
  currency?: Currency | null;
  industry_id?: string | null;
  industry?: Industry | null;
  legacy_customer_id?: string | null;
  has_adverse_media?: boolean | null;
  adverse_media_reason?: string | null;
  deleted_at?: Date | null;
  created_by_user?: User | null;
  status: CustomerStatus;
  beneficiaries: Beneficiary[];
}

export interface CreateCustomerRequest {
  full_name: string;
  date_of_birth?: string;
  nationality_id?: string;
  residence_country_id?: string;
  id_type: IdType;
  id_number: string;
  address?: string;
  email?: string;
  phone_number?: string;
  occupation_id?: string;
  risk_rating?: number;
  risk_reasons?: string;
  organisation_id: string;
  branch_id: string;
  tax_number_type?: TaxNumberType;
  tax_number?: string;
  gender?: Gender;
  customer_type: CustomerType;
  incorporation_country_id?: string;
  incoporated_date?: string;
  estimated_monthly_income?: number;
  org_reg_number?: string;
  current_age?: number;
  first_name?: string;
  last_name?: string;
  currency_id?: string;
  industry_id?: string;
  legacy_customer_id?: string;
  has_adverse_media?: boolean;
  adverse_media_reason?: string;
  status: CustomerStatus;
}

export interface UpdateCustomerRequest {
  full_name?: string;
  date_of_birth?: string;
  nationality_id?: string;
  residence_country_id?: string;
  id_type: IdType;
  id_number: string;
  address?: string;
  email?: string;
  phone_number?: string;
  occupation_id?: string;
  risk_rating?: number;
  risk_reasons?: string;
  branch_id?: string;
  tax_number_type?: TaxNumberType;
  tax_number?: string;
  gender?: Gender;
  customer_type?: CustomerType;
  incorporation_country_id?: string;
  incoporated_date?: string;
  estimated_monthly_income?: number;
  org_reg_number?: string;
  current_age?: number;
  first_name?: string;
  last_name?: string;
  currency_id?: string;
  industry_id?: string;
  legacy_customer_id?: string;
  has_adverse_media?: boolean;
  adverse_media_reason?: string;
  status?: CustomerStatus;
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  customer_type?: CustomerType;
  organisation_id?: string;
  branch_id?: string;
  nationality_id?: string;
  residence_country_id?: string;
  occupation_id?: string;
  industry_id?: string;
  gender?: Gender;
  has_adverse_media?: boolean;
  created_by?: string;
  status?: CustomerStatus;
}

export interface CustomerListResponse {
  success: boolean;
  message: string;
  data: {
    customers: Customer[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface CustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
  error?: string;
}

export interface CustomerStats {
  totalCustomers: number;
  individualCustomers: number;
  corporateCustomers: number;
  businessCustomers: number;
  highRiskCustomers: number;
  adverseMediaCustomers: number;
}

export interface CustomerStatsResponse {
  success: boolean;
  message: string;
  data: CustomerStats;
  error?: string;
}

export interface CustomerStatsFilters {
  organisation_id?: string;
}
