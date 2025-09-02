import { PrismaClient } from "@prisma/client";
import type {
  IIndustry,
  CreateIndustryRequest,
  UpdateIndustryRequest,
  IndustryFilters,
  IndustryListResponse,
  IndustryResponse,
  IndustryStats,
} from "./industries.interfaces";

const prisma = new PrismaClient();

export class IndustryService {
  async createIndustry(
    data: CreateIndustryRequest,
    userId: string
  ): Promise<IndustryResponse> {
    try {
      const industry = await prisma.industry.create({
        data: {
          ...data,
        },
      });

      return {
        success: true,
        message: "Industry created successfully",
        data: industry as IIndustry,
      };
    } catch (error) {
      console.error("Error creating industry:", error);
      throw new Error("Failed to create industry");
    }
  }

  async getIndustries(filters: IndustryFilters): Promise<IndustryListResponse> {
    try {
      const { page = 1, limit = 10, search } = filters;

      const skip = (page - 1) * limit;

      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      const [industries, total] = await Promise.all([
        prisma.industry.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        prisma.industry.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Industries retrieved successfully",
        data: {
          industries: industries as IIndustry[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching industries:", error);
      throw new Error("Failed to fetch industries");
    }
  }

  async getIndustryById(id: string): Promise<IndustryResponse> {
    try {
      const industry = await prisma.industry.findUnique({
        where: { id },
      });

      if (!industry) {
        throw new Error("Industry not found");
      }

      return {
        success: true,
        message: "Industry retrieved successfully",
        data: industry as IIndustry,
      };
    } catch (error) {
      console.error("Error fetching industry:", error);
      throw new Error("Failed to fetch industry");
    }
  }

  async updateIndustry(
    id: string,
    data: UpdateIndustryRequest
  ): Promise<IndustryResponse> {
    try {
      const industry = await prisma.industry.update({
        where: { id },
        data,
      });

      return {
        success: true,
        message: "Industry updated successfully",
        data: industry as IIndustry,
      };
    } catch (error) {
      console.error("Error updating industry:", error);
      throw new Error("Failed to update industry");
    }
  }

  async deleteIndustry(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.industry.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Industry deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting industry:", error);
      throw new Error("Failed to delete industry");
    }
  }

  async getIndustryStats(): Promise<{
    success: boolean;
    message: string;
    data: IndustryStats;
  }> {
    try {
      const total = await prisma.industry.count();

      return {
        success: true,
        message: "Industry stats retrieved successfully",
        data: {
          totalIndustries: total,
        },
      };
    } catch (error) {
      console.error("Error fetching industry stats:", error);
      throw new Error("Failed to fetch industry stats");
    }
  }
}
