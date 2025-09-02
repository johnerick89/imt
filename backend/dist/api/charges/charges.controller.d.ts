import { Request, Response } from "express";
import type CustomRequest from "../../types/CustomReq.type";
export declare class ChargeController {
    private chargeService;
    constructor();
    createCharge(req: CustomRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getCharges(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getChargeById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateCharge(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteCharge(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getChargeStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=charges.controller.d.ts.map