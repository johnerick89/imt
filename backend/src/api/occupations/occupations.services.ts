import { prisma } from "../../lib/prisma.lib";
import type {
  IOccupation,
  CreateOccupationRequest,
  UpdateOccupationRequest,
  OccupationFilters,
  OccupationListResponse,
  OccupationResponse,
  OccupationStats,
} from "./occupations.interfaces";

export class OccupationService {
  async createOccupation(
    data: CreateOccupationRequest,
    userId: string
  ): Promise<OccupationResponse> {
    try {
      const occupation = await prisma.occupation.create({
        data: {
          ...data,
        },
      });

      return {
        success: true,
        message: "Occupation created successfully",
        data: occupation as IOccupation,
      };
    } catch (error) {
      console.error("Error creating occupation:", error);
      throw new Error("Failed to create occupation");
    }
  }

  async getOccupations(
    filters: OccupationFilters
  ): Promise<OccupationListResponse> {
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

      const [occupations, total] = await Promise.all([
        prisma.occupation.findMany({
          where,
          skip,
          take: limit,
          orderBy: { created_at: "desc" },
        }),
        prisma.occupation.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Occupations retrieved successfully",
        data: {
          occupations: occupations as IOccupation[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching occupations:", error);
      throw new Error("Failed to fetch occupations");
    }
  }

  async getOccupationById(id: string): Promise<OccupationResponse> {
    try {
      const occupation = await prisma.occupation.findUnique({
        where: { id },
      });

      if (!occupation) {
        throw new Error("Occupation not found");
      }

      return {
        success: true,
        message: "Occupation retrieved successfully",
        data: occupation as IOccupation,
      };
    } catch (error) {
      console.error("Error fetching occupation:", error);
      throw new Error("Failed to fetch occupation");
    }
  }

  async updateOccupation(
    id: string,
    data: UpdateOccupationRequest
  ): Promise<OccupationResponse> {
    try {
      const occupation = await prisma.occupation.update({
        where: { id },
        data,
      });

      return {
        success: true,
        message: "Occupation updated successfully",
        data: occupation as IOccupation,
      };
    } catch (error) {
      console.error("Error updating occupation:", error);
      throw new Error("Failed to update occupation");
    }
  }

  async deleteOccupation(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.occupation.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Occupation deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting occupation:", error);
      throw new Error("Failed to delete occupation");
    }
  }

  async getOccupationStats(): Promise<{
    success: boolean;
    message: string;
    data: OccupationStats;
  }> {
    try {
      const total = await prisma.occupation.count();

      return {
        success: true,
        message: "Occupation stats retrieved successfully",
        data: {
          totalOccupations: total,
        },
      };
    } catch (error) {
      console.error("Error fetching occupation stats:", error);
      throw new Error("Failed to fetch occupation stats");
    }
  }
}
