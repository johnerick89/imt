import { CustomerStatus, PrismaClient } from "@prisma/client";
import type {
  IBeneficiary,
  CreateBeneficiaryRequest,
  UpdateBeneficiaryRequest,
  BeneficiaryFilters,
  BeneficiaryListResponse,
  BeneficiaryResponse,
  BeneficiaryStats,
} from "./beneficiaries.interfaces";

const prisma = new PrismaClient();

export class BeneficiaryService {
  async createBeneficiary(
    data: CreateBeneficiaryRequest,
    userId: string
  ): Promise<BeneficiaryResponse> {
    try {
      const beneficiary = await prisma.beneficiary.create({
        data: {
          ...data,
          created_by: userId,
          status: data.status || CustomerStatus.ACTIVE,
        },
        include: {
          customer: {
            select: {
              id: true,
              full_name: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          nationality: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          residence_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          incorporation_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          occupation: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          industry: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Beneficiary created successfully",
        data: beneficiary as unknown as IBeneficiary,
      };
    } catch (error) {
      console.error("Error creating beneficiary:", error);
      throw new Error("Failed to create beneficiary");
    }
  }

  async getBeneficiaries(
    filters: BeneficiaryFilters
  ): Promise<BeneficiaryListResponse> {
    try {
      const { page = 1, limit = 10, search, ...otherFilters } = filters;

      const skip = (page - 1) * limit;

      const where: any = { deleted_at: null };

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          {
            customer: { full_name: { contains: search, mode: "insensitive" } },
          },
          { id_number: { contains: search, mode: "insensitive" } },
          { tax_number: { contains: search, mode: "insensitive" } },
          { reg_number: { contains: search, mode: "insensitive" } },
        ];
      }

      // Add other filters
      Object.keys(otherFilters).forEach((key) => {
        if (otherFilters[key as keyof typeof otherFilters] !== undefined) {
          where[key] = otherFilters[key as keyof typeof otherFilters];
        }
      });

      const [beneficiaries, total] = await Promise.all([
        prisma.beneficiary.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
          include: {
            customer: {
              select: {
                id: true,
                full_name: true,
              },
            },
            organisation: {
              select: {
                id: true,
                name: true,
                type: true,
              },
            },
            nationality: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            residence_country: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            incorporation_country: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            occupation: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
            industry: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        }),
        prisma.beneficiary.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Beneficiaries retrieved successfully",
        data: {
          beneficiaries: beneficiaries as IBeneficiary[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
      throw new Error("Failed to fetch beneficiaries");
    }
  }

  async getBeneficiaryById(id: string): Promise<BeneficiaryResponse> {
    try {
      const beneficiary = await prisma.beneficiary.findUnique({
        where: { id },
        include: {
          customer: {
            select: {
              id: true,
              full_name: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          nationality: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          residence_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          incorporation_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          occupation: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          industry: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      if (!beneficiary) {
        throw new Error("Beneficiary not found");
      }

      return {
        success: true,
        message: "Beneficiary retrieved successfully",
        data: beneficiary as IBeneficiary,
      };
    } catch (error) {
      console.error("Error fetching beneficiary:", error);
      throw new Error("Failed to fetch beneficiary");
    }
  }

  async updateBeneficiary(
    id: string,
    data: UpdateBeneficiaryRequest
  ): Promise<BeneficiaryResponse> {
    try {
      // Filter out undefined values and prepare update data
      const updateData: any = {};

      // Only include fields that have defined values
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof UpdateBeneficiaryRequest];
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      // Set default status if not provided
      if (updateData.status === undefined) {
        updateData.status = CustomerStatus.ACTIVE;
      }

      const beneficiary = await prisma.beneficiary.update({
        where: { id },
        data: updateData,
        include: {
          customer: {
            select: {
              id: true,
              full_name: true,
            },
          },
          organisation: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
          nationality: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          residence_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          incorporation_country: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          occupation: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          industry: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "Beneficiary updated successfully",
        data: beneficiary as unknown as IBeneficiary,
      };
    } catch (error) {
      console.error("Error updating beneficiary:", error);
      throw new Error("Failed to update beneficiary");
    }
  }

  async deleteBeneficiary(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Soft delete by setting deleted_at timestamp
      await prisma.beneficiary.update({
        where: { id },
        data: {
          deleted_at: new Date(),
        },
      });

      return {
        success: true,
        message: "Beneficiary deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting beneficiary:", error);
      throw new Error("Failed to delete beneficiary");
    }
  }

  async getBeneficiaryStats(): Promise<{
    success: boolean;
    message: string;
    data: BeneficiaryStats;
  }> {
    try {
      const [total, individual, corporate, business] = await Promise.all([
        prisma.beneficiary.count({ where: { deleted_at: null } }),
        prisma.beneficiary.count({
          where: { type: "INDIVIDUAL", deleted_at: null },
        }),
        prisma.beneficiary.count({
          where: { type: "CORPORATE", deleted_at: null },
        }),
        prisma.beneficiary.count({
          where: { type: "BUSINESS", deleted_at: null },
        }),
      ]);

      return {
        success: true,
        message: "Beneficiary stats retrieved successfully",
        data: {
          totalBeneficiaries: total,
          individualBeneficiaries: individual,
          corporateBeneficiaries: corporate,
          businessBeneficiaries: business,
        },
      };
    } catch (error) {
      console.error("Error fetching beneficiary stats:", error);
      throw new Error("Failed to fetch beneficiary stats");
    }
  }
}
