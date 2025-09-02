import { Request, Response } from "express";
export declare class AuditController {
    getAuditLogs(req: Request, res: Response): Promise<void>;
    getAuditLogById(req: Request, res: Response): Promise<void>;
    getUserAuditHistory(req: Request, res: Response): Promise<void>;
    getEntityAuditHistory(req: Request, res: Response): Promise<void>;
    getAuditStats(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=audit.controller.d.ts.map