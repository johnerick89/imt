import type { CreateOccupationRequest, UpdateOccupationRequest, OccupationFilters, OccupationListResponse, OccupationResponse, OccupationStats } from "./occupations.interfaces";
export declare class OccupationService {
    createOccupation(data: CreateOccupationRequest, userId: string): Promise<OccupationResponse>;
    getOccupations(filters: OccupationFilters): Promise<OccupationListResponse>;
    getOccupationById(id: string): Promise<OccupationResponse>;
    updateOccupation(id: string, data: UpdateOccupationRequest): Promise<OccupationResponse>;
    deleteOccupation(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getOccupationStats(): Promise<{
        success: boolean;
        message: string;
        data: OccupationStats;
    }>;
}
//# sourceMappingURL=occupations.services.d.ts.map