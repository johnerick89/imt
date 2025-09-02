import { Request, Response, NextFunction } from "express";
import { IAuthUser } from "../api/auth/auth.interfaces";
export interface AuthRequest extends Request {
    user?: IAuthUser;
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map