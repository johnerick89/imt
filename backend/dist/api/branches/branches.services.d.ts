import type { IBranch, CreateBranchRequest, UpdateBranchRequest, BranchFilters, BranchStats } from "./branches.interfaces";
export declare class BranchService {
    createBranch(data: CreateBranchRequest, userId: string): Promise<IBranch>;
    getBranches(filters?: BranchFilters): Promise<{
        branches: IBranch[];
        pagination: {
            page: number;
            limit: number;
            total: any;
            totalPages: number;
        };
    }>;
    getBranchById(id: string): Promise<IBranch | null>;
    updateBranch(id: string, data: UpdateBranchRequest): Promise<IBranch | null>;
    deleteBranch(id: string): Promise<void>;
    getBranchStats(): Promise<BranchStats>;
}
//# sourceMappingURL=branches.services.d.ts.map