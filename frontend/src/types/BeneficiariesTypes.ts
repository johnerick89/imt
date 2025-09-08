import {
  CustomerStatus,
  CustomerType,
  IdType,
  TaxNumberType,
  type Customer,
} from "./CustomersTypes";
import type { Occupation } from "./OccupationsTypes";
import type { Industry } from "./IndustriesTypes";
import type { Country } from "./CountriesTypes";
import type { Organisation } from "./OrganisationsTypes";
import type { User } from "./UsersTypes";

export interface Beneficiary {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  id_type: IdType;
  id_number: string;
  date_of_birth?: Date | null;
  nationality_id?: string | null;
  nationality?: Country | null;
  address?: string | null;
  customer_id: string;
  customer: Customer;
  organisation_id: string;
  organisation: Organisation;
  created_at: Date;
  updated_at: Date;
  created_by?: string | null;
  created_by_user?: User | null;
  status: CustomerStatus;
  tax_number_type: TaxNumberType;
  tax_number: string;
  reg_number: string;
  occupation_id: string;
  occupation: Occupation;
  industry_id: string;
  industry: Industry;
  bank_name?: string | null;
  bank_address?: string | null;
  bank_city?: string | null;
  bank_state?: string | null;
  bank_zip?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
}

export interface CreateBeneficiaryRequest {
  name: string;
  email?: string;
  phone?: string;
  id_type: IdType;
  id_number: string;
  date_of_birth?: string;
  nationality_id?: string;
  address?: string;
  customer_id: string;
  organisation_id: string;
  type: CustomerType;
  tax_number_type: TaxNumberType;
  tax_number: string;
  reg_number: string;
  occupation_id: string;
  industry_id: string;
  residence_country_id?: string;
  incorporation_country_id?: string;
  bank_name?: string;
  bank_address?: string;
  bank_city?: string;
  bank_state?: string;
  bank_zip?: string;
  bank_account_number?: string;
  bank_account_name?: string;
}

export interface UpdateBeneficiaryRequest {
  name?: string;
  email?: string;
  phone?: string;
  id_type?: IdType;
  id_number?: string;
  date_of_birth?: string;
  nationality_id?: string;
  address?: string;
  type?: CustomerType;
  tax_number_type?: TaxNumberType;
  tax_number?: string;
  reg_number?: string;
  occupation_id?: string;
  industry_id?: string;
  residence_country_id?: string;
  incorporation_country_id?: string;
  status?: CustomerStatus;
  bank_name?: string;
  bank_address?: string;
  bank_city?: string;
  bank_state?: string;
  bank_zip?: string;
  bank_account_number?: string;
  bank_account_name?: string;
}

export interface BeneficiaryFilters {
  page?: number;
  limit?: number;
  search?: string;
  customer_id?: string;
  organisation_id?: string;
  nationality_id?: string;
  id_type?: IdType;
  created_by?: string;
  type?: CustomerType;
  tax_number_type?: TaxNumberType;
  reg_number?: string;
  occupation_id?: string;
  industry_id?: string;
  residence_country_id?: string;
  status?: CustomerStatus;
  bank_name?: string;
  email?: string;
  phone?: string;
  bank_account_name?: string;
}

export interface BeneficiaryListResponse {
  success: boolean;
  message: string;
  data: {
    beneficiaries: Beneficiary[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface BeneficiaryResponse {
  success: boolean;
  message: string;
  data: Beneficiary;
  error?: string;
}

export interface BeneficiaryStats {
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  inactiveBeneficiaries: number;
  beneficiariesByType: { [key: string]: number };
  beneficiariesByNationality: { [key: string]: number };
}

export interface BeneficiaryStatsResponse {
  success: boolean;
  message: string;
  data: BeneficiaryStats;
  error?: string;
}
