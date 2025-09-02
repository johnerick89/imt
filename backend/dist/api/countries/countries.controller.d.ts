import { Request, Response } from "express";
export declare class CountryController {
    createCountry(req: Request, res: Response): Promise<void>;
    getCountries(req: Request, res: Response): Promise<void>;
    getCountryById(req: Request, res: Response): Promise<void>;
    updateCountry(req: Request, res: Response): Promise<void>;
    deleteCountry(req: Request, res: Response): Promise<void>;
    getCountryStats(req: Request, res: Response): Promise<void>;
    getAllCountries(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=countries.controller.d.ts.map