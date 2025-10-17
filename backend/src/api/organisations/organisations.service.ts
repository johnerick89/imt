import {
  OrganisationStatus,
  IntegrationMethod,
  ChargeStatus,
  CorridorStatus,
  Prisma,
} from "@prisma/client";
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
          created_by_user: createdBy
            ? {
                connect: {
                  id: createdBy,
                },
              }
            : undefined,
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

      // Get all standard charges (those with no origin and destination organisations)
      const standardCharges = await tx.charge.findMany({
        where: {
          origin_organisation_id: null,
          destination_organisation_id: null,
          status: "ACTIVE",
        },
      });

      // Get all existing active organisations (excluding the newly created one)
      const existingOrganisations = await tx.organisation.findMany({
        where: {
          id: { not: organisation.id },
          status: OrganisationStatus.ACTIVE,
        },
        include: {
          country: true,
          base_currency: true,
        },
      });

      // Build array of charges to create
      const chargesToCreate: Prisma.ChargeCreateManyInput[] = [];
      for (const standardCharge of standardCharges) {
        for (const existingOrg of existingOrganisations) {
          // Charge with new org as origin and existing org as destination
          chargesToCreate.push({
            name: `${standardCharge.name} (${organisation.name} → ${existingOrg.name})`,
            description: standardCharge.description,
            application_method: standardCharge.application_method,
            currency_id: standardCharge.currency_id,
            type: standardCharge.type,
            rate: standardCharge.rate,
            origin_organisation_id: organisation.id,
            destination_organisation_id: existingOrg.id,
            is_reversible: standardCharge.is_reversible,
            direction: standardCharge.direction,
            internal_share_percentage: standardCharge.internal_share_percentage,
            origin_share_percentage: standardCharge.origin_share_percentage,
            destination_share_percentage:
              standardCharge.destination_share_percentage,
            status: ChargeStatus.ACTIVE,
            min_amount: standardCharge.min_amount,
            max_amount: standardCharge.max_amount,
            payment_authority: standardCharge.payment_authority,
            created_by: createdBy,
          });

          // Charge with existing org as origin and new org as destination
          chargesToCreate.push({
            name: `${standardCharge.name} (${existingOrg.name} → ${organisation.name})`,
            description: standardCharge.description,
            application_method: standardCharge.application_method,
            currency_id: standardCharge.currency_id,
            type: standardCharge.type,
            rate: standardCharge.rate,
            origin_organisation_id: existingOrg.id,
            destination_organisation_id: organisation.id,
            is_reversible: standardCharge.is_reversible,
            direction: standardCharge.direction,
            internal_share_percentage: standardCharge.internal_share_percentage,
            origin_share_percentage: standardCharge.origin_share_percentage,
            destination_share_percentage:
              standardCharge.destination_share_percentage,
            status: ChargeStatus.ACTIVE,
            min_amount: standardCharge.min_amount,
            max_amount: standardCharge.max_amount,
            payment_authority: standardCharge.payment_authority,
            created_by: createdBy,
          });
        }
      }

      // Bulk insert all charges
      if (chargesToCreate.length > 0) {
        console.log("chargesToCreate", chargesToCreate);
        await tx.charge.createMany({
          data: chargesToCreate,
        });
      }

      // Build array of corridors to create
      const corridorsToCreate: Prisma.CorridorCreateManyInput[] = [];
      for (const existingOrg of existingOrganisations) {
        // Corridor from new org to existing org
        if (
          organisation.country_id &&
          organisation.base_currency_id &&
          existingOrg.country_id &&
          existingOrg.base_currency_id
        ) {
          corridorsToCreate.push({
            name: `${organisation.name} to ${existingOrg.name}`,
            description: `Corridor from ${organisation.name} to ${existingOrg.name}`,
            origin_country_id: organisation.country_id,
            origin_currency_id: organisation.base_currency_id,
            origin_organisation_id: organisation.id,
            destination_country_id: existingOrg.country_id,
            destination_currency_id: existingOrg.base_currency_id,
            destination_organisation_id: existingOrg.id,
            organisation_id: organisation.id,
            status: CorridorStatus.ACTIVE,
            created_by: createdBy,
            base_country_id: organisation.country_id,
          });
        }

        // Corridor from existing org to new org
        if (
          existingOrg.country_id &&
          existingOrg.base_currency_id &&
          organisation.country_id &&
          organisation.base_currency_id
        ) {
          corridorsToCreate.push({
            name: `${existingOrg.name} to ${organisation.name}`,
            description: `Corridor from ${existingOrg.name} to ${organisation.name}`,
            origin_country_id: existingOrg.country_id,
            origin_currency_id: existingOrg.base_currency_id,
            origin_organisation_id: existingOrg.id,
            destination_country_id: organisation.country_id,
            destination_currency_id: organisation.base_currency_id,
            destination_organisation_id: organisation.id,
            organisation_id: existingOrg.id,
            status: CorridorStatus.ACTIVE,
            created_by: createdBy,
            base_country_id: existingOrg.country_id,
          });
        }
      }

      // Bulk insert all corridors
      if (corridorsToCreate.length > 0) {
        console.log("corridorsToCreate", corridorsToCreate);
        await tx.corridor.createMany({
          data: corridorsToCreate,
        });
      }

      return {
        success: true,
        message: "Organisation created successfully with charges and corridors",
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
