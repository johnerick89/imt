import { prisma } from "../../lib/prisma.lib";
import type {
  ICharge,
  CreateChargeRequest,
  UpdateChargeRequest,
  ChargeFilters,
  ChargeListResponse,
  ChargeResponse,
  ChargeStats,
} from "./charges.interfaces";
import { AppError, NotFoundError } from "../../utils/AppError";

export class ChargeService {
  async createCharge(
    data: CreateChargeRequest,
    userId: string
  ): Promise<ChargeResponse> {
    return await prisma.$transaction(async (tx) => {
      //validate source and destination organisations
      if (data.origin_organisation_id === data.destination_organisation_id) {
        throw new AppError(
          "Source and destination organisations cannot be the same",
          400
        );
      }

      const sourceOrg = await tx.organisation.findUnique({
        where: { id: data.origin_organisation_id },
      });
      const destOrg = await tx.organisation.findUnique({
        where: { id: data.destination_organisation_id },
      });

      if (!sourceOrg) {
        throw new NotFoundError("Source organisation not found");
      }

      if (!destOrg) {
        throw new NotFoundError("Destination organisation not found");
      }
      if (data?.origin_share_percentage && data?.destination_share_percentage) {
        if (
          data?.origin_share_percentage + data?.destination_share_percentage !==
          100
        ) {
          throw new AppError(
            "Origin and destination share percentages must add up to 100",
            400
          );
        }
      } else {
        if (data?.type === "COMMISSION") {
          data.origin_share_percentage = 60;
          data.destination_share_percentage = 40;
        } else if (data?.type === "TAX") {
          data.origin_share_percentage = 0;
          data.destination_share_percentage = 100;
        } else if (data?.type === "INTERNAL_FEE") {
          data.origin_share_percentage = 100;
          data.destination_share_percentage = 0;
        } else {
          data.origin_share_percentage = 0;
          data.destination_share_percentage = 0;
        }
      }

      const charge = await tx.charge.create({
        data: {
          ...data,
          created_by: userId,
          status: "ACTIVE",
        },
        include: {
          currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
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
        message: "Charge created successfully",
        data: charge as ICharge,
      };
    });
  }

  async getCharges(filters: ChargeFilters): Promise<ChargeListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      application_method,
      direction,
      currency_id,
      origin_organisation_id,
      destination_organisation_id,
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

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (application_method) {
      where.application_method = application_method;
    }

    if (direction) {
      where.direction = direction;
    }

    if (currency_id) {
      where.currency_id = currency_id;
    }

    if (origin_organisation_id) {
      where.origin_organisation_id = origin_organisation_id;
    }

    if (destination_organisation_id) {
      where.destination_organisation_id = destination_organisation_id;
    }

    if (created_by) {
      where.created_by = created_by;
    }

    const [charges, total] = await Promise.all([
      prisma.charge.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          currency: {
            select: {
              id: true,
              currency_name: true,
              currency_code: true,
              currency_symbol: true,
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
      prisma.charge.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message: "Charges retrieved successfully",
      data: {
        charges: charges as ICharge[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };
  }

  async getChargeById(id: string): Promise<ChargeResponse> {
    const charge = await prisma.charge.findUnique({
      where: { id },
      include: {
        currency: {
          select: {
            id: true,
            currency_name: true,
            currency_code: true,
            currency_symbol: true,
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

    if (!charge) {
      throw new Error("Charge not found");
    }

    return {
      success: true,
      message: "Charge retrieved successfully",
      data: charge as ICharge,
    };
  }

  async updateCharge(
    id: string,
    data: UpdateChargeRequest
  ): Promise<ChargeResponse> {
    const charge = await prisma.charge.update({
      where: { id },
      data,
      include: {
        currency: {
          select: {
            id: true,
            currency_name: true,
            currency_code: true,
            currency_symbol: true,
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
      message: "Charge updated successfully",
      data: charge as ICharge,
    };
  }

  async deleteCharge(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    await prisma.charge.delete({
      where: { id },
    });

    return {
      success: true,
      message: "Charge deleted successfully",
    };
  }

  async getChargeStats(): Promise<{
    success: boolean;
    message: string;
    data: ChargeStats;
  }> {
    const [total, active, inactive, pending, blocked, tax, fee, commission] =
      await Promise.all([
        prisma.charge.count(),
        prisma.charge.count({ where: { status: "ACTIVE" } }),
        prisma.charge.count({ where: { status: "INACTIVE" } }),
        prisma.charge.count({ where: { status: "PENDING" } }),
        prisma.charge.count({ where: { status: "BLOCKED" } }),
        prisma.charge.count({ where: { type: "TAX" } }),
        prisma.charge.count({ where: { type: "INTERNAL_FEE" } }),
        prisma.charge.count({ where: { type: "COMMISSION" } }),
      ]);

    return {
      success: true,
      message: "Charge stats retrieved successfully",
      data: {
        totalCharges: total,
        activeCharges: active,
        inactiveCharges: inactive,
        pendingCharges: pending,
        blockedCharges: blocked,
        taxCharges: tax,
        feeCharges: fee,
        commissionCharges: commission,
      },
    };
  }
}
