export interface Beneficiary {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  id_type:
    | "PASSPORT"
    | "NATIONAL_ID"
    | "DRIVERS_LICENSE"
    | "ALIEN_CARD"
    | "KRA_PIN"
    | "OTHER";
  id_number: string;
  date_of_birth?: Date | null;
  nationality_id?: string | null;
  nationality?: {
    id: string;
    name: string;
    code: string;
  } | null;
  address?: string | null;
  customer_id: string;
  customer: {
    id: string;
    full_name: string;
    email?: string | null;
  };
  organisation_id: string;
  organisation: {
    id: string;
    name: string;
    type: string;
  };
  created_at: Date;
  updated_at: Date;
  created_by?: string | null;
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  is_active: boolean;
}

export interface CreateBeneficiaryRequest {
  name: string;
  email?: string;
  phone?: string;
  id_type:
    | "PASSPORT"
    | "NATIONAL_ID"
    | "DRIVERS_LICENSE"
    | "ALIEN_CARD"
    | "KRA_PIN"
    | "OTHER";
  id_number: string;
  date_of_birth?: string;
  nationality_id?: string;
  address?: string;
  customer_id: string;
  organisation_id: string;
}

export interface UpdateBeneficiaryRequest {
  name?: string;
  email?: string;
  phone?: string;
  id_type?:
    | "PASSPORT"
    | "NATIONAL_ID"
    | "DRIVERS_LICENSE"
    | "ALIEN_CARD"
    | "KRA_PIN"
    | "OTHER";
  id_number?: string;
  date_of_birth?: string;
  nationality_id?: string;
  address?: string;
}

export interface BeneficiaryFilters {
  page?: number;
  limit?: number;
  search?: string;
  customer_id?: string;
  organisation_id?: string;
  nationality_id?: string;
  id_type?: string;
  is_active?: boolean;
  created_by?: string;
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
