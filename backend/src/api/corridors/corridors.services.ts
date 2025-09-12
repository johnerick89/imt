import { prisma } from "../../lib/prisma.lib";
import type {
  ICorridor,
  CreateCorridorRequest,
  UpdateCorridorRequest,
  CorridorFilters,
  CorridorListResponse,
  CorridorResponse,
  CorridorStats,
} from "./corridors.interfaces";
export class CorridorService {
  async createCorridor(
    data: CreateCorridorRequest,
    userId: string
  ): Promise<CorridorResponse> {
    try {
      const corridor = await prisma.corridor.create({
        data: {
          ...data,
          created_by: userId,
        },
        include: {
          base_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          destination_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          base_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Corridor created successfully",
        data: corridor as ICorridor,
      };
    } catch (error) {
      console.error("Error creating corridor:", error);
      throw new Error("Failed to create corridor");
    }
  }

  async getCorridors(filters: CorridorFilters): Promise<CorridorListResponse> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        status,
        base_country_id,
        destination_country_id,
        base_currency_id,
        organisation_id,
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

      if (status) {
        where.status = status;
      }

      if (base_country_id) {
        where.base_country_id = base_country_id;
      }

      if (destination_country_id) {
        where.destination_country_id = destination_country_id;
      }

      if (base_currency_id) {
        where.base_currency_id = base_currency_id;
      }

      if (organisation_id) {
        where.organisation_id = organisation_id;
      }

      if (created_by) {
        where.created_by = created_by;
      }

      const [corridors, total] = await Promise.all([
        prisma.corridor.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            base_country: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            destination_country: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            base_currency: {
              select: {
                id: true,
                currency_name: true,
                currency_code: true,
                currency_symbol: true,
              },
            },
            organisation: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            created_by_user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
          },
        }),
        prisma.corridor.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Corridors retrieved successfully",
        data: {
          corridors: corridors as ICorridor[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching corridors:", error);
      throw new Error("Failed to fetch corridors");
    }
  }

  async getCorridorById(id: string): Promise<CorridorResponse> {
    try {
      const corridor = await prisma.corridor.findUnique({
        where: { id },
        include: {
          base_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          destination_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          base_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      if (!corridor) {
        throw new Error("Corridor not found");
      }

      return {
        success: true,
        message: "Corridor retrieved successfully",
        data: corridor as ICorridor,
      };
    } catch (error) {
      console.error("Error fetching corridor:", error);
      throw new Error("Failed to fetch corridor");
    }
  }

  async updateCorridor(
    id: string,
    data: UpdateCorridorRequest
  ): Promise<CorridorResponse> {
    try {
      const corridor = await prisma.corridor.update({
        where: { id },
        data,
        include: {
          base_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          destination_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          base_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          created_by_user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Corridor updated successfully",
        data: corridor as ICorridor,
      };
    } catch (error) {
      console.error("Error updating corridor:", error);
      throw new Error("Failed to update corridor");
    }
  }

  async deleteCorridor(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.corridor.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Corridor deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting corridor:", error);
      throw new Error("Failed to delete corridor");
    }
  }

  async getCorridorStats(): Promise<{
    success: boolean;
    message: string;
    data: CorridorStats;
  }> {
    try {
      const [total, active, inactive, pending, blocked] = await Promise.all([
        prisma.corridor.count(),
        prisma.corridor.count({ where: { status: "ACTIVE" } }),
        prisma.corridor.count({ where: { status: "INACTIVE" } }),
        prisma.corridor.count({ where: { status: "PENDING" } }),
        prisma.corridor.count({ where: { status: "BLOCKED" } }),
      ]);

      return {
        success: true,
        message: "Corridor stats retrieved successfully",
        data: {
          totalCorridors: total,
          activeCorridors: active,
          inactiveCorridors: inactive,
          pendingCorridors: pending,
          blockedCorridors: blocked,
        },
      };
    } catch (error) {
      console.error("Error fetching corridor stats:", error);
      throw new Error("Failed to fetch corridor stats");
    }
  }
}
