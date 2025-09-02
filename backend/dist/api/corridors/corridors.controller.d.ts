import { Request, Response } from "express";
import type CustomRequest from "../../types/CustomReq.type";
export declare class CorridorController {
    private corridorService;
    constructor();
    createCorridor(req: CustomRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getCorridors(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCorridorById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateCorridor(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteCorridor(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getCorridorStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=corridors.controller.d.ts.map