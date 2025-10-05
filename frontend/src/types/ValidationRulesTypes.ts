export interface ValidationRule {
  id: number;
  entity: string;
  config: Record<string, boolean>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ValidationRuleFilters {
  page?: number;
  limit?: number;
  search?: string;
  entity?: string;
}

export interface ValidationRuleListResponse {
  success: boolean;
  message: string;
  data: {
    validationRules: ValidationRule[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ValidationRuleResponse {
  success: boolean;
  message: string;
  data: ValidationRule;
}

export interface UpdateValidationRuleRequest {
  config: Record<string, boolean>;
}

export interface ValidationRuleStats {
  totalValidationRules: number;
  byEntity: Array<{
    entity: string;
    count: number;
  }>;
}

export interface ValidationRuleStatsResponse {
  success: boolean;
  message: string;
  data: ValidationRuleStats;
}

// Entity field configurations for different entities
export interface EntityFieldConfig {
  [key: string]: {
    label: string;
    description?: string;
    required?: boolean;
  };
}

export const ENTITY_FIELD_CONFIGS: Record<string, EntityFieldConfig> = {
  customer: {
    full_name: { label: "Full Name", required: true },
    date_of_birth: { label: "Date of Birth" },
    nationality_id: { label: "Nationality" },
    residence_country_id: { label: "Residence Country" },
    id_type: { label: "ID Type" },
    id_number: { label: "ID Number" },
    address: { label: "Address" },
    email: { label: "Email", required: true },
    phone_number: { label: "Phone Number", required: true },
    occupation_id: { label: "Occupation" },
    tax_number_type: { label: "Tax Number Type" },
    tax_number: { label: "Tax Number" },
    gender: { label: "Gender" },
    incorporation_country_id: { label: "Incorporation Country" },
    incoporated_date: { label: "Incorporated Date" },
    estimated_monthly_income: { label: "Estimated Monthly Income" },
    org_reg_number: { label: "Organization Registration Number" },
    industry_id: { label: "Industry" },
  },
  beneficiary: {
    name: { label: "Name", required: true },
    date_of_birth: { label: "Date of Birth" },
    nationality_id: { label: "Nationality" },
    residence_country_id: { label: "Residence Country" },
    incorporation_country_id: { label: "Incorporation Country" },
    address: { label: "Address" },
    id_type: { label: "ID Type" },
    id_number: { label: "ID Number" },
    tax_number_type: { label: "Tax Number Type" },
    tax_number: { label: "Tax Number" },
    reg_number: { label: "Registration Number" },
    occupation_id: { label: "Occupation" },
    industry_id: { label: "Industry" },
    email: { label: "Email", required: true },
    phone: { label: "Phone", required: true },
    bank_name: { label: "Bank Name" },
    bank_address: { label: "Bank Address" },
    bank_city: { label: "Bank City" },
    bank_state: { label: "Bank State" },
    bank_zip: { label: "Bank ZIP" },
    bank_account_number: { label: "Bank Account Number" },
    bank_account_name: { label: "Bank Account Name" },
  },
};
