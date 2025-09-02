import type { CreateIndustryRequest, UpdateIndustryRequest, IndustryFilters, IndustryListResponse, IndustryResponse, IndustryStats } from "./industries.interfaces";
export declare class IndustryService {
    createIndustry(data: CreateIndustryRequest, userId: string): Promise<IndustryResponse>;
    getIndustries(filters: IndustryFilters): Promise<IndustryListResponse>;
    getIndustryById(id: string): Promise<IndustryResponse>;
    updateIndustry(id: string, data: UpdateIndustryRequest): Promise<IndustryResponse>;
    deleteIndustry(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getIndustryStats(): Promise<{
        success: boolean;
        message: string;
        data: IndustryStats;
    }>;
}
//# sourceMappingURL=industries.services.d.ts.map