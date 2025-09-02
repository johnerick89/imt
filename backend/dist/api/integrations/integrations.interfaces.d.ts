import { IntegrationType, IntegrationStatus } from "@prisma/client";
export interface IIntegration {
    id: string;
    name: string;
    description?: string | null;
    organisation_id?: string | null;
    type: IntegrationType;
    status: IntegrationStatus;
    api_key?: string | null;
    api_secret?: string | null;
    endpoint_url?: string | null;
    webhook_secret?: string | null;
    configuration?: any | null;
    created_at: Date;
    updated_at: Date;
    created_by?: string | null;
    created_by_user?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    } | null;
    organisation?: {
        id: string;
        name: string;
        type: string;
    } | null;
}
export interface CreateIntegrationRequest {
    name: string;
    description?: string;
    organisation_id?: string;
    type: IntegrationType;
    status: IntegrationStatus;
    api_key?: string;
    api_secret?: string;
    endpoint_url?: string;
    webhook_secret?: string;
    configuration?: any;
}
export interface UpdateIntegrationRequest {
    name?: string;
    description?: string;
    organisation_id?: string;
    type?: IntegrationType;
    status?: IntegrationStatus;
    api_key?: string;
    api_secret?: string;
    endpoint_url?: string;
    webhook_secret?: string;
    configuration?: any;
}
export interface IntegrationFilters {
    page?: number;
    limit?: number;
    search?: string;
    type?: IntegrationType;
    status?: IntegrationStatus;
    organisation_id?: string;
    created_by?: string;
}
export interface IntegrationListResponse {
    success: boolean;
    message: string;
    data: {
        integrations: IIntegration[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    };
    error?: string;
}
export interface IntegrationResponse {
    success: boolean;
    message: string;
    data: IIntegration;
    error?: string;
}
export interface IntegrationStats {
    totalIntegrations: number;
    activeIntegrations: number;
    inactiveIntegrations: number;
    pendingIntegrations: number;
    blockedIntegrations: number;
}
export interface IntegrationStatsResponse {
    success: boolean;
    message: string;
    data: IntegrationStats;
    error?: string;
}
//# sourceMappingURL=integrations.interfaces.d.ts.map