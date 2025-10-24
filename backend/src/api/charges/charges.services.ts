import { prisma } from "../../lib/prisma.lib";
import type {
  ICharge,
  CreateChargeRequest,
  UpdateChargeRequest,
  ChargeFilters,
  ChargeListResponse,
  ChargeResponse,
  ChargeStats,
  ChargeStatsFilters,
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
      if (
        data?.origin_share_percentage &&
        data?.destination_share_percentage &&
        data?.internal_share_percentage
      ) {
        if (
          data?.origin_share_percentage +
            data?.destination_share_percentage +
            data?.internal_share_percentage !==
          100
        ) {
          throw new AppError(
            "Origin, destination and internal share percentages must add up to 100",
            400
          );
        }
      } else {
        if (data?.type === "COMMISSION") {
          data.internal_share_percentage = 30;
          data.origin_share_percentage = 40;
          data.destination_share_percentage = 30;
        } else if (data?.type === "TAX") {
          data.internal_share_percentage = 100;
          data.origin_share_percentage = 0;
          data.destination_share_percentage = 0;
        } else if (data?.type === "INTERNAL_FEE") {
          data.internal_share_percentage = 100;
          data.origin_share_percentage = 0;
          data.destination_share_percentage = 0;
        } else {
          data.internal_share_percentage = 0;
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
    console.log("filters", filters);
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

    if (organisation_id) {
      where.OR = [
        { origin_organisation_id: organisation_id },
        { destination_organisation_id: organisation_id },
      ];
    } else {
      if (origin_organisation_id) {
        where.origin_organisation_id = origin_organisation_id;
      }

      if (destination_organisation_id) {
        where.destination_organisation_id = destination_organisation_id;
      }
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
    return await prisma.$transaction(async (tx) => {
      const charge = await tx.charge.findUnique({
        where: { id },
      });
      if (!charge) {
        throw new NotFoundError("Charge not found");
      }

      let isStandard = false;
      if (
        charge.origin_organisation_id === null &&
        charge.destination_organisation_id === null
      ) {
        isStandard = true;
      }

      // Validate source and destination organisations if they are being updated
      if (data.origin_organisation_id && data.destination_organisation_id) {
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
      }

      // Validate share percentages if they are being updated
      if (
        data?.origin_share_percentage !== undefined &&
        data?.destination_share_percentage !== undefined &&
        data?.internal_share_percentage !== undefined
      ) {
        if (
          data.origin_share_percentage +
            data.destination_share_percentage +
            data.internal_share_percentage !==
          100
        ) {
          throw new AppError(
            "Origin, destination and internal share percentages must add up to 100",
            400
          );
        }
      }

      const updatedCharge = await tx.charge.update({
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

      // If this is a standard charge, update all child charges
      if (isStandard) {
        // Get all child charges that reference this standard charge with organisation details
        const childCharges = await tx.charge.findMany({
          where: {
            standard_charge_id: id,
          },
          include: {
            origin_organisation: {
              select: {
                name: true,
              },
            },
            destination_organisation: {
              select: {
                name: true,
              },
            },
          },
        });

        // Update each child charge with the same data (excluding org details)
        const updateData = { ...data };
        // Remove organisation-specific fields that shouldn't be updated in child charges
        delete updateData.origin_organisation_id;
        delete updateData.destination_organisation_id;

        // Update all child charges
        await Promise.all(
          childCharges.map(async (childCharge) => {
            await tx.charge.update({
              where: { id: childCharge.id },
              data: {
                ...updateData,
                // Update the name to maintain the organisation-specific naming
                name: `${data.name || charge.name} - ${
                  childCharge.origin_organisation?.name || "Unknown"
                } to ${
                  childCharge.destination_organisation?.name || "Unknown"
                }`,
              },
            });
          })
        );
      }

      return {
        success: true,
        message: isStandard
          ? "Standard charge and all child charges updated successfully"
          : "Charge updated successfully",
        data: updatedCharge as ICharge,
      };
    });
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

  async getChargeStats(filters: ChargeStatsFilters): Promise<{
    success: boolean;
    message: string;
    data: ChargeStats;
  }> {
    const { organisation_id } = filters;
    const where: any = {};
    if (organisation_id) {
      where.OR = [
        { origin_organisation_id: organisation_id },
        { destination_organisation_id: organisation_id },
      ];
    }
    const [total, active, inactive, pending, blocked, tax, fee, commission] =
      await Promise.all([
        prisma.charge.count({
          where,
        }),
        prisma.charge.count({ where: { ...where, status: "ACTIVE" } }),
        prisma.charge.count({ where: { ...where, status: "INACTIVE" } }),
        prisma.charge.count({ where: { ...where, status: "PENDING" } }),
        prisma.charge.count({ where: { ...where, status: "BLOCKED" } }),
        prisma.charge.count({ where: { ...where, type: "TAX" } }),
        prisma.charge.count({ where: { ...where, type: "INTERNAL_FEE" } }),
        prisma.charge.count({ where: { ...where, type: "COMMISSION" } }),
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

  async createStandardCharge(
    data: CreateChargeRequest,
    userId: string
  ): Promise<ChargeResponse> {
    return await prisma.$transaction(async (tx) => {
      // Validate share percentages
      if (
        data?.origin_share_percentage &&
        data?.destination_share_percentage &&
        data?.internal_share_percentage
      ) {
        if (
          data?.origin_share_percentage +
            data?.destination_share_percentage +
            data?.internal_share_percentage !==
          100
        ) {
          throw new AppError(
            "Origin, destination and internal share percentages must add up to 100",
            400
          );
        }
      } else {
        if (data?.type === "COMMISSION") {
          data.internal_share_percentage = 30;
          data.origin_share_percentage = 40;
          data.destination_share_percentage = 30;
        } else if (data?.type === "TAX") {
          data.internal_share_percentage = 100;
          data.origin_share_percentage = 0;
          data.destination_share_percentage = 0;
        } else if (data?.type === "INTERNAL_FEE") {
          data.internal_share_percentage = 100;
          data.origin_share_percentage = 0;
          data.destination_share_percentage = 0;
        } else {
          data.internal_share_percentage = 0;
          data.origin_share_percentage = 0;
          data.destination_share_percentage = 0;
        }
      }

      // Fetch all active organisations
      const activeOrganisations = await tx.organisation.findMany({
        where: {
          status: "ACTIVE",
        },
        select: {
          id: true,
          name: true,
          type: true,
        },
      });

      // First, create the standard charge (without organisation-specific data)
      const standardCharge = await tx.charge.create({
        data: {
          ...data,
          origin_organisation_id: null,
          destination_organisation_id: null,
          direction: data.direction,
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

      const createdCharges = [standardCharge];

      // Then create organisation-specific charges if there are multiple organisations
      if (activeOrganisations.length > 1) {
        // Create charges for all organisation combinations with the same direction
        for (let i = 0; i < activeOrganisations.length; i++) {
          for (let j = 0; j < activeOrganisations.length; j++) {
            if (i !== j) {
              const originOrg = activeOrganisations[i];
              const destinationOrg = activeOrganisations[j];

              // Create charge with the same direction as the original data
              const organisationCharge = await tx.charge.create({
                data: {
                  ...data,
                  name: `${data.name} - ${originOrg.name} to ${destinationOrg.name}`,
                  origin_organisation_id: originOrg.id,
                  destination_organisation_id: destinationOrg.id,
                  direction: data.direction,
                  standard_charge_id: standardCharge.id,
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

              createdCharges.push(organisationCharge);
            }
          }
        }
      }

      return {
        success: true,
        message: `Standard charges created successfully for ${activeOrganisations.length} organisations (${createdCharges.length} charges created)`,
        data: createdCharges[0] as ICharge, // Return the first charge as an example
      };
    });
  }

  async getStandardCharges(
    filters: ChargeFilters
  ): Promise<ChargeListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      type,
      status,
      application_method,
      direction,
      currency_id,
      created_by,
    } = filters;

    const skip = (page - 1) * limit;

    const where: any = {
      origin_organisation_id: null,
      destination_organisation_id: null,
    };

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
      message: "Standard charges retrieved successfully",
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
}
