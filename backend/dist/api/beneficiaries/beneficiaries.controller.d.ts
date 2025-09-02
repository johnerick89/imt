import { Request, Response } from "express";
import type CustomRequest from "../../types/CustomReq.type";
export declare class BeneficiaryController {
    private beneficiaryService;
    constructor();
    createBeneficiary(req: CustomRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getBeneficiaries(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBeneficiaryById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateBeneficiary(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteBeneficiary(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getBeneficiaryStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=beneficiaries.controller.d.ts.map