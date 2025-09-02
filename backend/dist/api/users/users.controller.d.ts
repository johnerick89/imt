import { Request, Response } from "express";
export declare class UsersController {
    createUser(req: Request, res: Response): Promise<void>;
    getUsers(req: Request, res: Response): Promise<void>;
    getUserById(req: Request, res: Response): Promise<void>;
    updateUser(req: Request, res: Response): Promise<void>;
    toggleUserStatus(req: Request, res: Response): Promise<void>;
    deleteUser(req: Request, res: Response): Promise<void>;
    getUserStats(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=users.controller.d.ts.map