import { Request, Response } from "express";
import type CustomRequest from "../../types/CustomReq.type";
export declare class IntegrationController {
    private integrationService;
    constructor();
    createIntegration(req: CustomRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    getIntegrations(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getIntegrationById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    updateIntegration(req: CustomRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    deleteIntegration(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    getIntegrationStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=integrations.controller.d.ts.map