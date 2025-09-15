import { IntegrationStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.lib";
import type {
  IIntegration,
  CreateIntegrationRequest,
  UpdateIntegrationRequest,
  IntegrationFilters,
  IntegrationListResponse,
  IntegrationResponse,
  IntegrationStats,
  IntegrationStatsFilters,
} from "./integrations.interfaces";

export class IntegrationService {
  async createIntegration(
    data: CreateIntegrationRequest,
    userId: string
  ): Promise<IntegrationResponse> {
    try {
      // Validate origin organisation exists
      const originOrganisation = await prisma.organisation.findUnique({
        where: { id: data.origin_organisation_id },
      });
      if (!originOrganisation) {
        throw new Error("Origin organisation not found");
      }

      // Validate destination organisation exists
      const destinationOrganisation = await prisma.organisation.findUnique({
        where: { id: data.organisation_id },
      });
      if (!destinationOrganisation) {
        throw new Error("Destination organisation not found");
      }

      // Check if integration already exists
      const existingIntegration = await prisma.integration.findFirst({
        where: {
          origin_organisation_id: data.origin_organisation_id,
          organisation_id: data.organisation_id,
          name: data.name,
        },
      });
      if (existingIntegration) {
        throw new Error("Integration already exists");
      }

      const integration = await prisma.integration.create({
        data: {
          ...data,
          created_by: userId,
        },
        include: {
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          origin_organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Integration created successfully",
        data: integration as IIntegration,
      };
    } catch (error) {
      console.error("Error creating integration:", error);
      throw new Error("Failed to create integration");
    }
  }

  async getIntegrations(
    filters: IntegrationFilters
  ): Promise<IntegrationListResponse> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        type,
        status,
        organisation_id,
        origin_organisation_id,
        created_by,
      } = filters;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (type) where.type = type;
      if (status) where.status = status;
      if (organisation_id) where.organisation_id = organisation_id;
      if (origin_organisation_id)
        where.origin_organisation_id = origin_organisation_id;
      if (created_by) where.created_by = created_by;

      const [integrations, total] = await Promise.all([
        prisma.integration.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            created_by_user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            organisation: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            origin_organisation: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
          },
        }),
        prisma.integration.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Integrations retrieved successfully",
        data: {
          integrations: integrations as IIntegration[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching integrations:", error);
      throw new Error("Failed to fetch integrations");
    }
  }

  async getIntegrationById(id: string): Promise<IntegrationResponse> {
    try {
      const integration = await prisma.integration.findUnique({
        where: { id },
        include: {
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          origin_organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      if (!integration) {
        throw new Error("Integration not found");
      }

      return {
        success: true,
        message: "Integration retrieved successfully",
        data: integration as IIntegration,
      };
    } catch (error) {
      console.error("Error fetching integration:", error);
      throw new Error("Failed to fetch integration");
    }
  }

  async updateIntegration(
    id: string,
    data: UpdateIntegrationRequest
  ): Promise<IntegrationResponse> {
    try {
      const integration = await prisma.integration.update({
        where: { id },
        data: {
          ...data,
          updated_at: new Date(),
        },
        include: {
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          origin_organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Integration updated successfully",
        data: integration as IIntegration,
      };
    } catch (error) {
      console.error("Error updating integration:", error);
      throw new Error("Failed to update integration");
    }
  }

  async deleteIntegration(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.integration.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Integration deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting integration:", error);
      throw new Error("Failed to delete integration");
    }
  }

  async getIntegrationStats(
    filters: IntegrationStatsFilters
  ): Promise<IntegrationStats> {
    try {
      const { origin_organisation_id } = filters;

      const where: any = {};
      if (origin_organisation_id) {
        where.origin_organisation_id = origin_organisation_id;
      }

      const [total, active, inactive, pending, blocked] = await Promise.all([
        prisma.integration.count({ where }),
        prisma.integration.count({
          where: { ...where, status: IntegrationStatus.ACTIVE },
        }),
        prisma.integration.count({
          where: { ...where, status: IntegrationStatus.INACTIVE },
        }),
        prisma.integration.count({
          where: { ...where, status: IntegrationStatus.PENDING },
        }),
        prisma.integration.count({
          where: { ...where, status: IntegrationStatus.BLOCKED },
        }),
      ]);

      return {
        total,
        active,
        inactive,
        pending,
        blocked,
      };
    } catch (error) {
      console.error("Error fetching integration stats:", error);
      throw new Error("Failed to fetch integration stats");
    }
  }
}
