import { Request, Response } from "express";
import type CustomRequest from "../../types/CustomReq.type";
export declare class IndustryController {
    private industryService;
    constructor();
    createIndustry(req: CustomRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getIndustries(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getIndustryById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateIndustry(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteIndustry(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getIndustryStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=industries.controller.d.ts.map