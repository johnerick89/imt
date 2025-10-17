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
    if (data.origin_organisation_id) {
      const originOrganisation = await prisma.organisation.findUnique({
        where: { id: data.origin_organisation_id },
      });
      if (!originOrganisation) {
        throw new Error("Origin organisation not found");
      }
    }

    if (data.destination_organisation_id) {
      const destinationOrganisation = await prisma.organisation.findUnique({
        where: { id: data.destination_organisation_id },
      });
      if (!destinationOrganisation) {
        throw new Error("Destination organisation not found");
      }
    }

    const existingCorridor = await prisma.corridor.findFirst({
      where: {
        origin_organisation_id: data.origin_organisation_id,
        destination_organisation_id: data.destination_organisation_id,
        origin_country_id: data.origin_country_id,
        destination_country_id: data.destination_country_id,
      },
    });
    if (existingCorridor) {
      return await this.updateCorridor(existingCorridor.id, data);
    }
    const corridor = await prisma.corridor.create({
      data: {
        ...data,
        created_by: userId,
        base_country_id: data.base_country_id || data.origin_country_id,
      },
      include: {
        base_country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        origin_country: {
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
        origin_currency: {
          select: {
            id: true,
            currency_name: true,
            currency_code: true,
            currency_symbol: true,
          },
        },
        destination_currency: {
          select: {
            id: true,
            currency_name: true,
            currency_code: true,
            currency_symbol: true,
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
        origin_organisation: {
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
      country_id,
      currency_id,
      organisation_id,
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

    // Use OR condition for country_id (match either origin or destination)
    if (country_id) {
      where.OR = where.OR || [];
      where.OR.push(
        { origin_country_id: country_id },
        { destination_country_id: country_id },
        { base_country_id: country_id }
      );
    }

    // Use OR condition for currency_id (match either origin or destination)
    if (currency_id) {
      const currencyConditions = [
        { origin_currency_id: currency_id },
        { destination_currency_id: currency_id },
        { base_currency_id: currency_id },
      ];

      if (where.OR && where.OR.length > 0) {
        // If we already have OR conditions (from search or country_id), we need to combine them with AND
        where.AND = [{ OR: where.OR }, { OR: currencyConditions }];
        delete where.OR;
      } else {
        where.OR = currencyConditions;
      }
    }

    // Use OR condition for organisation_id (match either origin or destination)
    if (organisation_id) {
      const orgConditions = [
        { origin_organisation_id: organisation_id },
        { destination_organisation_id: organisation_id },
        { organisation_id: organisation_id },
      ];

      if (where.AND) {
        // If we have AND conditions, add this as another AND clause
        where.AND.push({ OR: orgConditions });
      } else if (where.OR && where.OR.length > 0) {
        // If we have OR conditions but no AND, convert to AND with both OR clauses
        where.AND = [{ OR: where.OR }, { OR: orgConditions }];
        delete where.OR;
      } else {
        where.OR = orgConditions;
      }
    }

    console.log(JSON.stringify(where, null, 2));

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
          origin_country: {
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
          origin_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
            },
          },
          destination_currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
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
          origin_organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          destination_organisation: {
            select: {
              id: true,
              name: true,
              type: true,
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
        origin_country: {
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
        origin_currency: {
          select: {
            id: true,
            currency_name: true,
            currency_code: true,
            currency_symbol: true,
          },
        },
        destination_currency: {
          select: {
            id: true,
            currency_name: true,
            currency_code: true,
            currency_symbol: true,
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
        origin_organisation: {
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
        destination_organisation: {
          select: {
            id: true,
            name: true,
            type: true,
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
        origin_country: {
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
        origin_currency: true,
        destination_currency: true,
        base_currency: true,
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
        destination_organisation: true,
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

  async getCorridorsForTransaction({
    origin_organisation_id,
    destination_organisation_id,
  }: {
    origin_organisation_id: string;
    destination_organisation_id: string;
  }): Promise<CorridorListResponse> {
    const corridors = await prisma.corridor.findMany({
      where: {
        origin_organisation_id: origin_organisation_id,
        destination_organisation_id: destination_organisation_id,
        status: "ACTIVE", // Only return active corridors for transactions
      },
      include: {
        base_country: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        origin_country: {
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
        origin_currency: true,
        destination_currency: true,
        base_currency: true,
        organisation: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        origin_organisation: true,
        destination_organisation: true,
      },
      orderBy: { created_at: "desc" },
    });

    return {
      success: true,
      message: "Corridors for transaction retrieved successfully",
      data: {
        corridors: corridors as ICorridor[],
        pagination: {
          page: 1,
          limit: corridors.length,
          total: corridors.length,
          totalPages: 1,
        },
      },
    };
  }
}
