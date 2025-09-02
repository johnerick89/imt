import { Request, Response } from "express";
export declare class CurrencyController {
    createCurrency(req: Request, res: Response): Promise<void>;
    getCurrencies(req: Request, res: Response): Promise<void>;
    getCurrencyById(req: Request, res: Response): Promise<void>;
    updateCurrency(req: Request, res: Response): Promise<void>;
    deleteCurrency(req: Request, res: Response): Promise<void>;
    getCurrencyStats(req: Request, res: Response): Promise<void>;
    getAllCurrencies(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=currencies.controller.d.ts.map