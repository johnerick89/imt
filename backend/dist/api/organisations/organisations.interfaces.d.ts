import { OrganisationType, OrganisationStatus, IntegrationMethod } from "@prisma/client";
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
export interface ICreateOrganisationRequest {
    name: string;
    description?: string;
    type: OrganisationType;
    integration_mode?: IntegrationMethod;
    contact_person?: string;
    contact_email?: string;
    contact_phone?: string;
    contact_address?: string;
    contact_city?: string;
    contact_state?: string;
    contact_zip?: string;
    base_currency_id?: string | null | undefined;
    country_id?: string | null | undefined;
}
export interface IUpdateOrganisationRequest {
    name?: string;
    description?: string;
    type?: OrganisationType;
    integration_mode?: IntegrationMethod;
    contact_person?: string;
    contact_email?: string;
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
//# sourceMappingURL=organisations.interfaces.d.ts.map