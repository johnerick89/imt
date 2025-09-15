import { Request, Response } from "express";
import { IntegrationService } from "./integrations.services";
import {
  createIntegrationSchema,
  updateIntegrationSchema,
  integrationFiltersSchema,
  integrationStatsFiltersSchema,
} from "./integrations.validation";
import type CustomRequest from "../../types/CustomReq.type";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../middlewares/error.middleware";

export class IntegrationController {
  private integrationService: IntegrationService;

  constructor() {
    this.integrationService = new IntegrationService();
  }

  createIntegration = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const validatedData = createIntegrationSchema.parse(req.body);

      const result = await this.integrationService.createIntegration(
        validatedData,
        userId
      );
      res.status(201).json(result);
    }
  );

  getIntegrations = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const validatedFilters = integrationFiltersSchema.parse(req.query);
      // Convert null values to undefined for compatibility
      const filters = {
        ...validatedFilters,
        organisation_id: validatedFilters.organisation_id || undefined,
        origin_organisation_id:
          validatedFilters.origin_organisation_id || undefined,
        created_by: validatedFilters.created_by || undefined,
      };
      const result = await this.integrationService.getIntegrations(filters);
      res.status(200).json(result);
    }
  );

  getIntegrationById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const result = await this.integrationService.getIntegrationById(id);
      res.status(200).json(result);
    }
  );

  updateIntegration = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const validatedData = updateIntegrationSchema.parse(req.body);
      const result = await this.integrationService.updateIntegration(
        id,
        validatedData
      );
      res.status(200).json(result);
    }
  );

  deleteIntegration = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const result = await this.integrationService.deleteIntegration(id);
      res.status(200).json(result);
    }
  );

  getIntegrationStats = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const statsFilters = integrationStatsFiltersSchema.parse(req.query);
      // Convert null values to undefined for compatibility
      const filters = {
        ...statsFilters,
        origin_organisation_id:
          statsFilters.origin_organisation_id || undefined,
      };
      const result = await this.integrationService.getIntegrationStats(filters);
      res.status(200).json({
        success: true,
        message: "Integration stats retrieved successfully",
        data: result,
      });
    }
  );
}
