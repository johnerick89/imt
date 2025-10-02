import { OrganisationStatus, IntegrationMethod } from "@prisma/client";
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
import { createContactPerson } from "./organisations.utils";

export class OrganisationsService {
  async createOrganisation(
    organisationData: ICreateOrganisationRequest,
    createdBy: string
  ): Promise<IOrganisationResponse> {
    return await prisma.$transaction(async (tx) => {
      console.log(organisationData);
      const integrationMode = organisationData.integration_mode;
      const { base_currency_id, country_id, contact_password, ...rest } =
        organisationData;
      const organisation = await tx.organisation.create({
        //@ts-ignore
        data: {
          ...rest,
          base_currency: base_currency_id
            ? {
                connect: {
                  id: base_currency_id,
                },
              }
            : undefined,
          country: country_id
            ? {
                connect: {
                  id: country_id,
                },
              }
            : undefined,

          status: OrganisationStatus.ACTIVE,
          created_by: createdBy,
        },
        include: {
          base_currency: true,
          country: true,
          created_by_user: true,
        },
      });

      if (integrationMode === IntegrationMethod.INTERNAL) {
        await createContactPerson(organisationData, organisation.id, tx);
      }

      return {
        success: true,
        message: "Organisation created successfully",
        data: organisation,
      };
    });
  }

  async getOrganisations(
    filters: IOrganisationFilters = {}
  ): Promise<IOrganisationsListResponse> {
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
          base_currency: true,
          country: true,
          created_by_user: true,
          users: true,
          integrations: true,
          origin_transactions: {
            select: {
              id: true,
              direction: true,
              created_at: true,
              status: true,
            },
          },
          destination_transactions: {
            select: {
              id: true,
              direction: true,
              created_at: true,
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
  }

  async getOrganisationById(id: string): Promise<IOrganisationResponse> {
    const organisation = await prisma.organisation.findUnique({
      where: { id },
      include: {
        base_currency: true,
        country: true,
        created_by_user: true,
        users: true,
        integrations: true,
        origin_transactions: {
          select: {
            id: true,
            direction: true,
            created_at: true,
            status: true,
          },
        },
        destination_transactions: {
          select: {
            id: true,
            direction: true,
            created_at: true,
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
  }

  async updateOrganisation(
    id: string,
    organisationData: IUpdateOrganisationRequest
  ): Promise<IOrganisationResponse> {
    const organisation = await prisma.organisation.update({
      where: { id },
      data: organisationData,
      include: {
        base_currency: true,
        country: true,
        created_by_user: true,
        users: true,
        integrations: true,
      },
    });

    return {
      success: true,
      message: "Organisation updated successfully",
      data: organisation,
    };
  }

  async deleteOrganisation(id: string): Promise<IOrganisationResponse> {
    const organisation = await prisma.organisation.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Organisation deleted successfully",
      data: organisation,
    };
  }

  async toggleOrganisationStatus(
    id: string,
    status: OrganisationStatus
  ): Promise<IOrganisationResponse> {
    const organisation = await prisma.organisation.update({
      where: { id },
      data: { status },
      include: {
        base_currency: true,

        country: true,
        created_by_user: true,
        users: true,
        integrations: true,
      },
    });

    return {
      success: true,
      message: `Organisation status updated to ${status}`,
      data: organisation,
    };
  }

  async getOrganisationStats(): Promise<IOrganisationStatsResponse> {
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
  }

  async getAllOrganisations(): Promise<IOrganisation[]> {
    const organisations = await prisma.organisation.findMany({
      orderBy: { name: "asc" },
    });
    return organisations;
  }
}
