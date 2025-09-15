import { prisma } from "../../lib/prisma.lib";
import type {
  ICorridor,
  CreateCorridorRequest,
  UpdateCorridorRequest,
  CorridorFilters,
  CorridorListResponse,
  CorridorResponse,
  CorridorStats,
  CorridorStatsFilters,
} from "./corridors.interfaces";
export class CorridorService {
  async createCorridor(
    data: CreateCorridorRequest,
    userId: string
  ): Promise<CorridorResponse> {
    const originOrganisation = await prisma.organisation.findUnique({
      where: { id: data.origin_organisation_id },
    });
    if (!originOrganisation) {
      throw new Error("Origin organisation not found");
    }

    const destinationOrganisation = await prisma.organisation.findUnique({
      where: { id: data.organisation_id },
    });
    if (!destinationOrganisation) {
      throw new Error("Destination organisation not found");
    }

    const existingCorridor = await prisma.corridor.findFirst({
      where: {
        origin_organisation_id: data.origin_organisation_id,
        organisation_id: data.organisation_id,
        base_currency_id: data.base_currency_id,
        base_country_id: data.base_country_id,
        destination_country_id: data.destination_country_id,
      },
    });
    if (existingCorridor) {
      throw new Error("Corridor already exists");
    }
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
  }

  async getCorridors(filters: CorridorFilters): Promise<CorridorListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      base_country_id,
      destination_country_id,
      base_currency_id,
      organisation_id,
      origin_organisation_id,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }
    if (origin_organisation_id) {
      where.origin_organisation_id = origin_organisation_id;
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

    console.log(where);

    const [corridors, total] = await Promise.all([
      prisma.corridor.findMany({
        where,
        skip,
        take: Number(limit),
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
          origin_organisation: true,
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
  }

  async getCorridorById(id: string): Promise<CorridorResponse> {
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
        origin_organisation: true,
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
  }

  async updateCorridor(
    id: string,
    data: UpdateCorridorRequest
  ): Promise<CorridorResponse> {
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
        origin_organisation: true,
      },
    });

    return {
      success: true,
      message: "Corridor updated successfully",
      data: corridor as ICorridor,
    };
  }

  async deleteCorridor(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    await prisma.corridor.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Corridor deleted successfully",
    };
  }

  async getCorridorStats(filters: CorridorStatsFilters): Promise<{
    success: boolean;
    message: string;
    data: CorridorStats;
  }> {
    const { origin_organisation_id } = filters;
    const [total, active, inactive, pending, blocked] = await Promise.all([
      prisma.corridor.count({
        where: { origin_organisation_id: origin_organisation_id },
      }),
      prisma.corridor.count({
        where: {
          origin_organisation_id: origin_organisation_id,
          status: "ACTIVE",
        },
      }),
      prisma.corridor.count({
        where: {
          origin_organisation_id: origin_organisation_id,
          status: "INACTIVE",
        },
      }),
      prisma.corridor.count({
        where: {
          origin_organisation_id: origin_organisation_id,
          status: "PENDING",
        },
      }),
      prisma.corridor.count({
        where: {
          origin_organisation_id: origin_organisation_id,
          status: "BLOCKED",
        },
      }),
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
  }
}
