import type { CreateChargeRequest, UpdateChargeRequest, ChargeFilters, ChargeListResponse, ChargeResponse, ChargeStats } from "./charges.interfaces";
export declare class ChargeService {
    createCharge(data: CreateChargeRequest, userId: string): Promise<ChargeResponse>;
    getCharges(filters: ChargeFilters): Promise<ChargeListResponse>;
    getChargeById(id: string): Promise<ChargeResponse>;
    updateCharge(id: string, data: UpdateChargeRequest): Promise<ChargeResponse>;
    deleteCharge(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getChargeStats(): Promise<{
        success: boolean;
        message: string;
        data: ChargeStats;
    }>;
}
//# sourceMappingURL=charges.services.d.ts.map