import {
  CustomerStatus,
  CustomerType,
  IndividualIDType,
  TaxNumberType,
} from "@prisma/client";
export interface IBeneficiary {
  id: string;
  customer_id: string;
  customer: {
    id: string;
    full_name: string;
  };
  organisation_id: string;
  organisation: {
    id: string;
    name: string;
    type: string;
  };
  type: CustomerType;
  risk_contribution?: number | null;
  risk_contribution_details?: any;
  name: string;
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
  incorporation_country_id?: string | null;
  incorporation_country?: {
    id: string;
    name: string;
    code: string;
  } | null;
  address?: string | null;
  id_type?: IndividualIDType | null;
  id_number?: string | null;
  tax_number_type?: TaxNumberType | null;
  tax_number?: string | null;
  reg_number?: string | null;
  occupation_id?: string | null;
  occupation?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
  industry_id?: string | null;
  industry?: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
  status?: CustomerStatus | null;
}

export interface CreateBeneficiaryRequest {
  customer_id: string;
  type: CustomerType;
  risk_contribution?: number;
  risk_contribution_details?: any;
  name: string;
  date_of_birth?: string;
  nationality_id?: string;
  residence_country_id?: string;
  incorporation_country_id?: string;
  address?: string;
  id_type?: IndividualIDType | null;
  id_number?: string;
  tax_number_type?: TaxNumberType | null;
  tax_number?: string;
  reg_number?: string;
  occupation_id?: string;
  industry_id?: string;
  organisation_id: string;
  status?: CustomerStatus | null;
}

export interface UpdateBeneficiaryRequest {
  type?: CustomerType | null;
  risk_contribution?: number;
  risk_contribution_details?: any;
  name?: string;
  date_of_birth?: string;
  nationality_id?: string;
  residence_country_id?: string;
  incorporation_country_id?: string;
  address?: string;
  id_type?: IndividualIDType | null;
  id_number?: string;
  tax_number_type?: TaxNumberType | null;
  tax_number?: string;
  reg_number?: string;
  occupation_id?: string;
  industry_id?: string;
  status?: CustomerStatus | null;
}

export interface BeneficiaryFilters {
  page?: number;
  limit?: number;
  search?: string;
  customer_id?: string;
  organisation_id?: string;
  type?: CustomerType | null;
  nationality_id?: string;
  residence_country_id?: string;
  occupation_id?: string;
  industry_id?: string;
  status?: CustomerStatus | null;
}

export interface BeneficiaryListResponse {
  success: boolean;
  message: string;
  data: {
    beneficiaries: IBeneficiary[];
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
  data: IBeneficiary;
  error?: string;
}

export interface BeneficiaryStats {
  totalBeneficiaries: number;
  individualBeneficiaries: number;
  corporateBeneficiaries: number;
  businessBeneficiaries: number;
}

export interface BeneficiaryStatsResponse {
  success: boolean;
  message: string;
  data: BeneficiaryStats;
  error?: string;
}
