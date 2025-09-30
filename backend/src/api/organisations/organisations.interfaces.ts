import {
  OrganisationType,
  OrganisationStatus,
  IntegrationMethod,
  Currency,
  Country,
  User,
  Integration,
} from "@prisma/client";

export interface IOrganisation {
  id: string;
  name: string;
  description: string | null;
  type: OrganisationType;
  integration_mode: IntegrationMethod;
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
  created_at: Date;
  updated_at: Date;
  // Relations
  base_currency?: Currency | null;
  country?: Country | null;
  created_by_user?: User | null;
  users?: User[] | null;
  integrations?: Integration[] | null;
}

export interface ICreateOrganisationRequest {
  name: string;
  description?: string;
  type: OrganisationType;
  integration_mode?: IntegrationMethod;
  contact_person: string;
  contact_email: string;
  contact_phone?: string;
  contact_address?: string;
  contact_city?: string;
  contact_state?: string;
  contact_zip?: string;
  base_currency_id?: string | null | undefined;
  country_id?: string | null | undefined;
  contact_password: string;
}

export interface IUpdateOrganisationRequest {
  name?: string;
  description?: string;
  type?: OrganisationType;
  integration_mode?: IntegrationMethod;
  contact_person: string;
  contact_email: string;
  contact_phone?: string;
  contact_address?: string;
  contact_city?: string;
  contact_state?: string;
  contact_zip?: string;
  status?: OrganisationStatus;
  base_currency_id?: string | null | undefined;
  country_id?: string | null | undefined;
}

export interface IOrganisationFilters {
  search?: string;
  type?: OrganisationType;
  status?: OrganisationStatus;
  integration_mode?: IntegrationMethod;
  country_id?: string;
  base_currency_id?: string;
  page?: number;
  limit?: number;
}

export interface IOrganisationResponse {
  success: boolean;
  message: string;
  data?: IOrganisation;
  error?: string;
}

export interface IOrganisationsListResponse {
  success: boolean;
  message: string;
  data?: {
    organisations: IOrganisation[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface IOrganisationStats {
  total: number;
  active: number;
  inactive: number;
  pending: number;
  blocked: number;
  partners: number;
  agencies: number;
  customers: number;
}

export interface IOrganisationStatsResponse {
  success: boolean;
  message: string;
  data?: IOrganisationStats;
  error?: string;
}
