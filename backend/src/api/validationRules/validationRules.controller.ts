import { Request, Response } from "express";
import { validationRuleService } from "./validationRules.service";
import {
  updateValidationRuleSchema,
  validationRuleFiltersSchema,
  validationRuleParamsSchema,
} from "./validationRules.validation";
import { z } from "zod";

export class ValidationRuleController {
  // Get all validation rules
  async getValidationRules(req: Request, res: Response) {
    try {
      const filters = validationRuleFiltersSchema.parse(req.query);
      const result = await validationRuleService.getValidationRules(filters);

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors: error.issues,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get validation rule by ID
  async getValidationRuleById(req: Request, res: Response) {
    try {
      const { id } = validationRuleParamsSchema.parse(req.params);
      const result = await validationRuleService.getValidationRuleById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid validation rule ID",
          errors: error.issues,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get validation rule by entity
  async getValidationRuleByEntity(req: Request, res: Response) {
    try {
      const { entity } = req.params;

      if (!entity) {
        return res.status(400).json({
          success: false,
          message: "Entity parameter is required",
        });
      }

      const result = await validationRuleService.getValidationRuleByEntity(
        entity
      );

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Update validation rule
  async updateValidationRule(req: Request, res: Response) {
    try {
      const { id } = validationRuleParamsSchema.parse(req.params);
      const data = updateValidationRuleSchema.parse(req.body);
      const userId = (req as any).user?.id;

      const result = await validationRuleService.updateValidationRule(
        id,
        data,
        userId
      );

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Invalid request data",
          errors: error.issues,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  // Get validation rule stats
  async getValidationRuleStats(req: Request, res: Response) {
    try {
      const result = await validationRuleService.getValidationRuleStats();

      if (!result.success) {
        return res.status(400).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}

export const validationRuleController = new ValidationRuleController();
