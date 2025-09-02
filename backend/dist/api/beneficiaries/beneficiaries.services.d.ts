import type { CreateBeneficiaryRequest, UpdateBeneficiaryRequest, BeneficiaryFilters, BeneficiaryListResponse, BeneficiaryResponse, BeneficiaryStats } from "./beneficiaries.interfaces";
export declare class BeneficiaryService {
    createBeneficiary(data: CreateBeneficiaryRequest, userId: string): Promise<BeneficiaryResponse>;
    getBeneficiaries(filters: BeneficiaryFilters): Promise<BeneficiaryListResponse>;
    getBeneficiaryById(id: string): Promise<BeneficiaryResponse>;
    updateBeneficiary(id: string, data: UpdateBeneficiaryRequest): Promise<BeneficiaryResponse>;
    deleteBeneficiary(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getBeneficiaryStats(): Promise<{
        success: boolean;
        message: string;
        data: BeneficiaryStats;
    }>;
}
//# sourceMappingURL=beneficiaries.services.d.ts.map