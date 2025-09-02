import { Request, Response } from "express";
import type { CustomRequest } from "../../types/CustomReq.type";
export declare class BranchController {
    createBranch(req: CustomRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getBranches(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBranchById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateBranch(req: CustomRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteBranch(req: CustomRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getBranchStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=branches.controller.d.ts.map