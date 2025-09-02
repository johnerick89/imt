import type { CreateCorridorRequest, UpdateCorridorRequest, CorridorFilters, CorridorListResponse, CorridorResponse, CorridorStats } from "./corridors.interfaces";
export declare class CorridorService {
    createCorridor(data: CreateCorridorRequest, userId: string): Promise<CorridorResponse>;
    getCorridors(filters: CorridorFilters): Promise<CorridorListResponse>;
    getCorridorById(id: string): Promise<CorridorResponse>;
    updateCorridor(id: string, data: UpdateCorridorRequest): Promise<CorridorResponse>;
    deleteCorridor(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getCorridorStats(): Promise<{
        success: boolean;
        message: string;
        data: CorridorStats;
    }>;
}
//# sourceMappingURL=corridors.services.d.ts.map