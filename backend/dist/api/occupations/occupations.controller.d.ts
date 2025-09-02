import { Request, Response } from "express";
import type CustomRequest from "../../types/CustomReq.type";
export declare class OccupationController {
    private occupationService;
    constructor();
    createOccupation(req: CustomRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getOccupations(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getOccupationById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateOccupation(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteOccupation(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getOccupationStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=occupations.controller.d.ts.map