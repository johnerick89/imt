import { Request, Response, NextFunction } from "express";
interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: string;
        organisation_id?: string;
    };
}
export declare const auditMiddleware: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=audit.middleware.d.ts.map