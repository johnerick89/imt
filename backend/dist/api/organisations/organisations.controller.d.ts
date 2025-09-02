import { Request, Response } from "express";
export declare class OrganisationsController {
    createOrganisation(req: Request, res: Response): Promise<void>;
    getOrganisations(req: Request, res: Response): Promise<void>;
    getOrganisationById(req: Request, res: Response): Promise<void>;
    updateOrganisation(req: Request, res: Response): Promise<void>;
    deleteOrganisation(req: Request, res: Response): Promise<void>;
    toggleOrganisationStatus(req: Request, res: Response): Promise<void>;
    getOrganisationStats(req: Request, res: Response): Promise<void>;
    getAllOrganisations(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=organisations.controller.d.ts.map