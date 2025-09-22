import { prisma } from "../../lib/prisma.lib";
import type {
  IParameter,
  ParameterFilters,
  ParameterListResponse,
  ParameterResponse,
  CreateParameterRequest,
  UpdateParameterRequest,
  ParameterStats,
  ParameterStatsResponse,
} from "./parameters.interfaces";

export class ParameterService {
  // Get Parameters
  async getParameters(
    filters: ParameterFilters
  ): Promise<ParameterListResponse> {
    try {
      const { page = 1, limit = 10, search } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { value: { contains: search, mode: "insensitive" } },
          { value_2: { contains: search, mode: "insensitive" } },
        ];
      }

      // Get total count
      const total = await prisma.parameter.count({ where });

      // Get parameters
      const parameters = await prisma.parameter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: "desc" },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Parameters retrieved successfully",
        data: {
          parameters: parameters.map((param) => ({
            ...param,
            created_at: param.created_at.toISOString(),
            updated_at: param.updated_at.toISOString(),
          })) as IParameter[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to retrieve parameters",
        data: {
          parameters: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        },
      };
    }
  }

  // Get Parameter by ID
  async getParameterById(id: string): Promise<ParameterResponse> {
    try {
      const parameter = await prisma.parameter.findUnique({
        where: { id },
      });

      if (!parameter) {
        return {
          success: false,
          message: "Parameter not found",
          data: {} as IParameter,
        };
      }

      return {
        success: true,
        message: "Parameter retrieved successfully",
        data: {
          ...parameter,
          created_at: parameter.created_at.toISOString(),
          updated_at: parameter.updated_at.toISOString(),
        } as IParameter,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to retrieve parameter",
        data: {} as IParameter,
      };
    }
  }

  // Create Parameter
  async createParameter(
    data: CreateParameterRequest
  ): Promise<ParameterResponse> {
    try {
      // Check if parameter with same name already exists
      const existingParameter = await prisma.parameter.findFirst({
        where: { name: data.name },
      });

      if (existingParameter) {
        return {
          success: false,
          message: "Parameter with this name already exists",
          data: {} as IParameter,
        };
      }

      const parameter = await prisma.parameter.create({
        data: {
          name: data.name,
          value: data.value,
          value_2: data.value_2,
        },
      });

      return {
        success: true,
        message: "Parameter created successfully",
        data: {
          ...parameter,
          created_at: parameter.created_at.toISOString(),
          updated_at: parameter.updated_at.toISOString(),
        } as IParameter,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to create parameter",
        data: {} as IParameter,
      };
    }
  }

  // Update Parameter
  async updateParameter(
    id: string,
    data: UpdateParameterRequest
  ): Promise<ParameterResponse> {
    try {
      // Check if parameter exists
      const existingParameter = await prisma.parameter.findUnique({
        where: { id },
      });

      if (!existingParameter) {
        return {
          success: false,
          message: "Parameter not found",
          data: {} as IParameter,
        };
      }

      // Check if name is being updated and if it conflicts
      if (data.name && data.name !== existingParameter.name) {
        const nameConflict = await prisma.parameter.findFirst({
          where: {
            name: data.name,
            id: { not: id },
          },
        });

        if (nameConflict) {
          return {
            success: false,
            message: "Parameter with this name already exists",
            data: {} as IParameter,
          };
        }
      }

      const parameter = await prisma.parameter.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.value && { value: data.value }),
          ...(data.value_2 !== undefined && { value_2: data.value_2 }),
        },
      });

      return {
        success: true,
        message: "Parameter updated successfully",
        data: {
          ...parameter,
          created_at: parameter.created_at.toISOString(),
          updated_at: parameter.updated_at.toISOString(),
        } as IParameter,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update parameter",
        data: {} as IParameter,
      };
    }
  }

  // Delete Parameter
  async deleteParameter(id: string): Promise<ParameterResponse> {
    try {
      // Check if parameter exists
      const existingParameter = await prisma.parameter.findUnique({
        where: { id },
      });

      if (!existingParameter) {
        return {
          success: false,
          message: "Parameter not found",
          data: {} as IParameter,
        };
      }

      const parameter = await prisma.parameter.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Parameter deleted successfully",
        data: {
          ...parameter,
          created_at: parameter.created_at.toISOString(),
          updated_at: parameter.updated_at.toISOString(),
        } as IParameter,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to delete parameter",
        data: {} as IParameter,
      };
    }
  }

  // Get Parameter Stats
  async getParameterStats(): Promise<ParameterStatsResponse> {
    try {
      const totalParameters = await prisma.parameter.count();

      // Get parameters grouped by name prefix (category)
      const parameters = await prisma.parameter.findMany({
        select: { name: true },
      });

      const categoryMap = new Map<string, number>();
      parameters.forEach((param) => {
        const category = param.name.split(".")[0] || "other";
        categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
      });

      const byCategory = Array.from(categoryMap.entries()).map(
        ([category, count]) => ({ category, count })
      );

      return {
        success: true,
        message: "Parameter stats retrieved successfully",
        data: {
          totalParameters,
          byCategory,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to retrieve parameter stats",
        data: {
          totalParameters: 0,
          byCategory: [],
        },
      };
    }
  }
}

export const parameterService = new ParameterService();
