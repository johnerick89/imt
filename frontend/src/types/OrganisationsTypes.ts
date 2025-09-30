export const OrganisationType = {
  PARTNER: "PARTNER",
  AGENCY: "AGENCY",
  CUSTOMER: "CUSTOMER",
} as const;
export type OrganisationType = keyof typeof OrganisationType;
export const IntegrationMode = {
  INTERNAL: "INTERNAL",
  EXTERNAL: "EXTERNAL",
} as const;
export type IntegrationMode = keyof typeof IntegrationMode;
export const OrganisationStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  PENDING: "PENDING",
  BLOCKED: "BLOCKED",
} as const;
export type OrganisationStatus = keyof typeof OrganisationStatus;
export interface Organisation {
  id: string;
  name: string;
  description: string | null;
  type: OrganisationType;
  integration_mode: IntegrationMode;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_address: string | null;
  contact_city: string | null;
  contact_state: string | null;
  contact_zip: string | null;
  status: OrganisationStatus;
  base_currency_id: string | null;
  country_id: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Relations
  base_currency?: {
    id: string;
    currency_name: string;
    currency_code: string;
    currency_symbol: string;
  } | null;
  country?: {
    id: string;
    name: string;
    code: string;
  } | null;
  created_by_user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  users?: Array<{
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    status: string;
  }>;
  integrations?: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
  }>;
}

export interface CreateOrganisationRequest {
  name: string;
  description?: string;
  type: OrganisationType;
  integration_mode?: IntegrationMode;
  contact_person?: string;
  contact_email?: string;
  contact_password?: string;
  contact_phone?: string;
  contact_address?: string;
  contact_city?: string;
  contact_state?: string;
  contact_zip?: string;
  base_currency_id?: string;
  country_id?: string;
}

export interface UpdateOrganisationRequest {
  name?: string;
  description?: string;
  type?: OrganisationType;
  integration_mode?: IntegrationMode;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_address?: string;
  contact_city?: string;
  contact_state?: string;
  contact_zip?: string;
  status?: OrganisationStatus;
  base_currency_id?: string;
  country_id?: string;
}

export interface OrganisationFilters {
  search?: string;
  type?: OrganisationType;
  status?: OrganisationStatus;
  integration_mode?: IntegrationMode;
  country_id?: string;
  base_currency_id?: string;
  page?: number;
  limit?: number;
}

export interface OrganisationsListResponse {
  success: boolean;
  message: string;
  data?: {
    organisations: Organisation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface OrganisationResponse {
  success: boolean;
  message: string;
  data?: Organisation;
  error?: string;
}

export interface OrganisationStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  blocked: number;
  partners: number;
  agencies: number;
  customers: number;
}

export interface OrganisationStatsResponse {
  success: boolean;
  message: string;
  data?: OrganisationStats;
  error?: string;
}
