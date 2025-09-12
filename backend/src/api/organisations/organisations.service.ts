import { OrganisationStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.lib";
import {
  ICreateOrganisationRequest,
  IUpdateOrganisationRequest,
  IOrganisationFilters,
  IOrganisationResponse,
  IOrganisationsListResponse,
  IOrganisationStatsResponse,
  IOrganisation,
} from "./organisations.interfaces";

export class OrganisationsService {
  async createOrganisation(
    organisationData: ICreateOrganisationRequest,
    createdBy: string
  ): Promise<IOrganisationResponse> {
    try {
      console.log(organisationData);
      const organisation = await prisma.organisation.create({
        data: {
          ...organisationData,
          created_by: createdBy,
          status: OrganisationStatus.PENDING,
        },
        include: {
          base_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Organisation created successfully",
        data: organisation,
      };
    } catch (error) {
      console.error("Error creating organisation:", error);
      return {
        success: false,
        message: "Failed to create organisation",
        error: "ORGANISATION_CREATE_ERROR",
      };
    }
  }

  async getOrganisations(
    filters: IOrganisationFilters = {}
  ): Promise<IOrganisationsListResponse> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
          { contact_person: { contains: filters.search, mode: "insensitive" } },
          { contact_email: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      if (filters.type) {
        where.type = filters.type;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      if (filters.integration_mode) {
        where.integration_mode = filters.integration_mode;
      }

      if (filters.country_id) {
        where.country_id = filters.country_id;
      }

      if (filters.base_currency_id) {
        where.base_currency_id = filters.base_currency_id;
      }

      // Get organisations with pagination
      const [organisations, total] = await Promise.all([
        prisma.organisation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            base_currency: {
              select: {
                id: true,
                currency_name: true,
                currency_code: true,
                currency_symbol: true,
              },
            },
            country: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            created_by_user: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
              },
            },
            users: {
              select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                status: true,
              },
            },
            integrations: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true,
              },
            },
          },
        }),
        prisma.organisation.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Organisations retrieved successfully",
        data: {
          organisations,
          total,
          page,
          limit,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Error retrieving organisations:", error);
      return {
        success: false,
        message: "Failed to retrieve organisations",
        error: "ORGANISATIONS_RETRIEVE_ERROR",
      };
    }
  }

  async getOrganisationById(id: string): Promise<IOrganisationResponse> {
    try {
      const organisation = await prisma.organisation.findUnique({
        where: { id },
        include: {
          base_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          users: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              role: true,
              status: true,
            },
          },
          integrations: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
            },
          },
        },
      });

      if (!organisation) {
        return {
          success: false,
          message: "Organisation not found",
          error: "ORGANISATION_NOT_FOUND",
        };
      }

      return {
        success: true,
        message: "Organisation retrieved successfully",
        data: organisation,
      };
    } catch (error) {
      console.error("Error retrieving organisation:", error);
      return {
        success: false,
        message: "Failed to retrieve organisation",
        error: "ORGANISATION_RETRIEVE_ERROR",
      };
    }
  }

  async updateOrganisation(
    id: string,
    organisationData: IUpdateOrganisationRequest
  ): Promise<IOrganisationResponse> {
    try {
      const organisation = await prisma.organisation.update({
        where: { id },
        data: organisationData,
        include: {
          base_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          users: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              role: true,
              status: true,
            },
          },
          integrations: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Organisation updated successfully",
        data: organisation,
      };
    } catch (error) {
      console.error("Error updating organisation:", error);
      return {
        success: false,
        message: "Failed to update organisation",
        error: "ORGANISATION_UPDATE_ERROR",
      };
    }
  }

  async deleteOrganisation(id: string): Promise<IOrganisationResponse> {
    try {
      const organisation = await prisma.organisation.delete({
        where: { id },
        include: {
          base_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Organisation deleted successfully",
        data: organisation,
      };
    } catch (error) {
      console.error("Error deleting organisation:", error);
      return {
        success: false,
        message: "Failed to delete organisation",
        error: "ORGANISATION_DELETE_ERROR",
      };
    }
  }

  async toggleOrganisationStatus(
    id: string,
    status: OrganisationStatus
  ): Promise<IOrganisationResponse> {
    try {
      const organisation = await prisma.organisation.update({
        where: { id },
        data: { status },
        include: {
          base_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
          users: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
              role: true,
              status: true,
            },
          },
          integrations: {
            select: {
              id: true,
              name: true,
              type: true,
              status: true,
            },
          },
        },
      });

      return {
        success: true,
        message: `Organisation status updated to ${status}`,
        data: organisation,
      };
    } catch (error) {
      console.error("Error updating organisation status:", error);
      return {
        success: false,
        message: "Failed to update organisation status",
        error: "ORGANISATION_STATUS_UPDATE_ERROR",
      };
    }
  }

  async getOrganisationStats(): Promise<IOrganisationStatsResponse> {
    try {
      const [
        total,
        active,
        inactive,
        pending,
        blocked,
        partners,
        agencies,
        customers,
      ] = await Promise.all([
        prisma.organisation.count(),
        prisma.organisation.count({ where: { status: "ACTIVE" } }),
        prisma.organisation.count({ where: { status: "INACTIVE" } }),
        prisma.organisation.count({ where: { status: "PENDING" } }),
        prisma.organisation.count({ where: { status: "BLOCKED" } }),
        prisma.organisation.count({ where: { type: "PARTNER" } }),
        prisma.organisation.count({ where: { type: "AGENCY" } }),
        prisma.organisation.count({ where: { type: "CUSTOMER" } }),
      ]);

      return {
        success: true,
        message: "Organisation stats retrieved successfully",
        data: {
          total,
          active,
          inactive,
          pending,
          blocked,
          partners,
          agencies,
          customers,
        },
      };
    } catch (error) {
      console.error("Error retrieving organisation stats:", error);
      return {
        success: false,
        message: "Failed to retrieve organisation stats",
        error: "ORGANISATION_STATS_ERROR",
      };
    }
  }

  async getAllOrganisations(): Promise<IOrganisation[]> {
    try {
      const organisations = await prisma.organisation.findMany({
        orderBy: { name: "asc" },
      });
      return organisations;
    } catch (error) {
      console.error("Error retrieving all organisations:", error);
      return [] as IOrganisation[];
    }
  }
}
