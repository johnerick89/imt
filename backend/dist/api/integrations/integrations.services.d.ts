import type { CreateIntegrationRequest, UpdateIntegrationRequest, IntegrationFilters, IntegrationListResponse, IntegrationResponse, IntegrationStats } from "./integrations.interfaces";
export declare class IntegrationService {
    createIntegration(data: CreateIntegrationRequest, userId: string): Promise<IntegrationResponse>;
    getIntegrations(filters: IntegrationFilters): Promise<IntegrationListResponse>;
    getIntegrationById(id: string): Promise<IntegrationResponse>;
    updateIntegration(id: string, data: UpdateIntegrationRequest): Promise<IntegrationResponse>;
    deleteIntegration(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getIntegrationStats(): Promise<IntegrationStats>;
}
//# sourceMappingURL=integrations.services.d.ts.map