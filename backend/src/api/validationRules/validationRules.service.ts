import { prisma } from "../../lib/prisma.lib";
import type {
  IValidationRule,
  ValidationRuleFilters,
  ValidationRuleListResponse,
  ValidationRuleResponse,
  UpdateValidationRuleRequest,
  ValidationRuleStats,
  ValidationRuleStatsResponse,
} from "./validationRules.interfaces";

export class ValidationRuleService {
  // Get Validation Rules
  async getValidationRules(
    filters: ValidationRuleFilters
  ): Promise<ValidationRuleListResponse> {
    try {
      const { page = 1, limit = 10, search, entity } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [{ entity: { contains: search, mode: "insensitive" } }];
      }

      if (entity) {
        where.entity = entity;
      }

      // Get total count
      const total = await prisma.validationRule.count({ where });

      // Get validation rules
      const validationRules = await prisma.validationRule.findMany({
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
        },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Validation rules retrieved successfully",
        data: {
          validationRules: validationRules.map((rule) => ({
            id: rule.id,
            entity: rule.entity,
            config: rule.config as Record<string, boolean>,
            created_at: rule.created_at.toISOString(),
            updated_at: rule.updated_at.toISOString(),
            created_by: rule.created_by || undefined,
          })) as IValidationRule[],
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
        message: error.message || "Failed to retrieve validation rules",
        data: {
          validationRules: [],
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

  // Get Validation Rule by ID
  async getValidationRuleById(id: number): Promise<ValidationRuleResponse> {
    try {
      const validationRule = await prisma.validationRule.findUnique({
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
        },
      });

      if (!validationRule) {
        return {
          success: false,
          message: "Validation rule not found",
          data: {} as IValidationRule,
        };
      }

      return {
        success: true,
        message: "Validation rule retrieved successfully",
        data: {
          id: validationRule.id,
          entity: validationRule.entity,
          config: validationRule.config as Record<string, boolean>,
          created_at: validationRule.created_at.toISOString(),
          updated_at: validationRule.updated_at.toISOString(),
          created_by: validationRule.created_by || undefined,
        } as IValidationRule,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to retrieve validation rule",
        data: {} as IValidationRule,
      };
    }
  }

  // Get Validation Rule by Entity
  async getValidationRuleByEntity(
    entity: string
  ): Promise<ValidationRuleResponse> {
    try {
      const validationRule = await prisma.validationRule.findUnique({
        where: { entity },
        include: {
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

      if (!validationRule) {
        return {
          success: false,
          message: "Validation rule not found for this entity",
          data: {} as IValidationRule,
        };
      }

      return {
        success: true,
        message: "Validation rule retrieved successfully",
        data: {
          id: validationRule.id,
          entity: validationRule.entity,
          config: validationRule.config as Record<string, boolean>,
          created_at: validationRule.created_at.toISOString(),
          updated_at: validationRule.updated_at.toISOString(),
          created_by: validationRule.created_by || undefined,
        } as IValidationRule,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to retrieve validation rule",
        data: {} as IValidationRule,
      };
    }
  }

  // Update Validation Rule
  async updateValidationRule(
    id: number,
    data: UpdateValidationRuleRequest,
    userId?: string
  ): Promise<ValidationRuleResponse> {
    try {
      // Check if validation rule exists
      const existingRule = await prisma.validationRule.findUnique({
        where: { id },
      });

      if (!existingRule) {
        return {
          success: false,
          message: "Validation rule not found",
          data: {} as IValidationRule,
        };
      }

      const validationRule = await prisma.validationRule.update({
        where: { id },
        data: {
          config: data.config,
          ...(userId && { created_by: userId }),
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
        },
      });

      return {
        success: true,
        message: "Validation rule updated successfully",
        data: {
          id: validationRule.id,
          entity: validationRule.entity,
          config: validationRule.config as Record<string, boolean>,
          created_at: validationRule.created_at.toISOString(),
          updated_at: validationRule.updated_at.toISOString(),
          created_by: validationRule.created_by || undefined,
        } as IValidationRule,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update validation rule",
        data: {} as IValidationRule,
      };
    }
  }

  // Get Validation Rule Stats
  async getValidationRuleStats(): Promise<ValidationRuleStatsResponse> {
    try {
      const totalValidationRules = await prisma.validationRule.count();

      // Get validation rules grouped by entity
      const validationRules = await prisma.validationRule.findMany({
        select: { entity: true },
      });

      const entityMap = new Map<string, number>();
      validationRules.forEach((rule) => {
        entityMap.set(rule.entity, (entityMap.get(rule.entity) || 0) + 1);
      });

      const byEntity = Array.from(entityMap.entries()).map(
        ([entity, count]) => ({ entity, count })
      );

      return {
        success: true,
        message: "Validation rule stats retrieved successfully",
        data: {
          totalValidationRules,
          byEntity,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to retrieve validation rule stats",
        data: {
          totalValidationRules: 0,
          byEntity: [],
        },
      };
    }
  }
}

export const validationRuleService = new ValidationRuleService();
