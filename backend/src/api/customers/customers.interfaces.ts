import { CustomerStatus, Beneficiary } from "@prisma/client";

export interface ICustomer {
  id: string;
  full_name: string;
  date_of_birth?: Date | null;
  nationality_id?: string | null;
  nationality?: {
    id: string;
    name: string;
    code: string;
  } | null;
  residence_country_id?: string | null;
  residence_country?: {
    id: string;
    name: string;
    code: string;
  } | null;
  id_type?:
    | "PASSPORT"
    | "NATIONAL_ID"
    | "DRIVERS_LICENSE"
    | "ALIEN_CARD"
    | "KRA_PIN"
    | "OTHER"
    | null;
  id_number?: string | null;
  address?: string | null;
  email?: string | null;
  phone_number?: string | null;
  occupation_id?: string | null;
  occupation?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
  registration_date: Date;
  risk_rating: number;
  risk_reasons?: string | null;
  organisation_id: string;
  organisation: {
    id: string;
    name: string;
    type: string;
  };
  branch_id: string;
  branch: {
    id: string;
    name: string;
  };
  created_at: Date;
  updated_at: Date;
  tax_number_type?: "PIN" | "TIN" | "SSN" | "KRA_PIN" | "OTHER" | null;
  tax_number?: string | null;
  gender?: "MALE" | "FEMALE" | "OTHER" | null;
  customer_type: "INDIVIDUAL" | "CORPORATE" | "BUSINESS";
  incorporation_country_id?: string | null;
  incorporation_country?: {
    id: string;
    name: string;
    code: string;
  } | null;
  incoporated_date?: Date | null;
  estimated_monthly_income?: number | null;
  org_reg_number?: string | null;
  current_age?: number | null;
  first_name?: string | null;
  last_name?: string | null;
  currency_id?: string | null;
  currency?: {
    id: string;
    currency_name: string;
    currency_code: string;
    currency_symbol: string;
  } | null;
  industry_id?: string | null;
  industry?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
  legacy_customer_id?: string | null;
  has_adverse_media?: boolean | null;
  adverse_media_reason?: string | null;
  deleted_at?: Date | null;
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  status: CustomerStatus;
  beneficiaries?: Beneficiary[];
}

export interface CreateCustomerRequest {
  full_name: string;
  date_of_birth?: string;
  nationality_id?: string;
  residence_country_id?: string;
  id_type?:
    | "PASSPORT"
    | "NATIONAL_ID"
    | "DRIVERS_LICENSE"
    | "ALIEN_CARD"
    | "KRA_PIN"
    | "OTHER";
  id_number?: string;
  address?: string;
  email?: string;
  phone_number?: string;
  occupation_id?: string;
  risk_rating?: number;
  risk_reasons?: string;
  organisation_id: string;
  branch_id?: string;
  tax_number_type?: "PIN" | "TIN" | "SSN" | "KRA_PIN" | "OTHER";
  tax_number?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  customer_type: "INDIVIDUAL" | "CORPORATE" | "BUSINESS";
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

export interface UpdateCustomerRequest {
  full_name?: string;
  date_of_birth?: string;
  nationality_id?: string;
  residence_country_id?: string;
  id_type?:
    | "PASSPORT"
    | "NATIONAL_ID"
    | "DRIVERS_LICENSE"
    | "ALIEN_CARD"
    | "KRA_PIN"
    | "OTHER";
  id_number?: string;
  address?: string;
  email?: string;
  phone_number?: string;
  occupation_id?: string;
  risk_rating?: number;
  risk_reasons?: string;
  branch_id?: string | null;
  tax_number_type?: "PIN" | "TIN" | "SSN" | "KRA_PIN" | "OTHER";
  tax_number?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  customer_type?: "INDIVIDUAL" | "CORPORATE" | "BUSINESS";
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
  customer_type?: "INDIVIDUAL" | "CORPORATE" | "BUSINESS";
  organisation_id?: string;
  branch_id?: string;
  nationality_id?: string;
  residence_country_id?: string;
  occupation_id?: string;
  industry_id?: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  has_adverse_media?: boolean;
  created_by?: string;
  status?: CustomerStatus;
}

export interface CustomerListResponse {
  success: boolean;
  message: string;
  data: {
    customers: ICustomer[];
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
  data: ICustomer;
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
