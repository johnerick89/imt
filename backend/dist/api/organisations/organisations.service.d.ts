import { OrganisationStatus } from "@prisma/client";
import { ICreateOrganisationRequest, IUpdateOrganisationRequest, IOrganisationFilters, IOrganisationResponse, IOrganisationsListResponse, IOrganisationStatsResponse, IOrganisation } from "./organisations.interfaces";
export declare class OrganisationsService {
    createOrganisation(organisationData: ICreateOrganisationRequest, createdBy: string): Promise<IOrganisationResponse>;
    getOrganisations(filters?: IOrganisationFilters): Promise<IOrganisationsListResponse>;
    getOrganisationById(id: string): Promise<IOrganisationResponse>;
    updateOrganisation(id: string, organisationData: IUpdateOrganisationRequest): Promise<IOrganisationResponse>;
    deleteOrganisation(id: string): Promise<IOrganisationResponse>;
    toggleOrganisationStatus(id: string, status: OrganisationStatus): Promise<IOrganisationResponse>;
    getOrganisationStats(): Promise<IOrganisationStatsResponse>;
    getAllOrganisations(): Promise<IOrganisation[]>;
}
//# sourceMappingURL=organisations.service.d.ts.map