import { Request, Response } from "express";
import { IntegrationService } from "./integrations.services";
import {
  createIntegrationSchema,
  updateIntegrationSchema,
  integrationFiltersSchema,
} from "./integrations.validation";
import type CustomRequest from "../../types/CustomReq.type";

export class IntegrationController {
  private integrationService: IntegrationService;

  constructor() {
    this.integrationService = new IntegrationService();
  }

  async createIntegration(req: CustomRequest, res: Response) {
    try {
      const validatedData = createIntegrationSchema.parse(req.body);
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const result = await this.integrationService.createIntegration(
        validatedData,
        userId
      );
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getIntegrations(req: Request, res: Response) {
    try {
      const validatedFilters = integrationFiltersSchema.parse(req.query);
      const result = await this.integrationService.getIntegrations(
        validatedFilters
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getIntegrationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.integrationService.getIntegrationById(id);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Integration not found") {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async updateIntegration(req: CustomRequest, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateIntegrationSchema.parse(req.body);
      const result = await this.integrationService.updateIntegration(
        id,
        validatedData
      );
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Integration not found") {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async deleteIntegration(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.integrationService.deleteIntegration(id);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "Integration not found") {
          return res.status(404).json({
            success: false,
            message: error.message,
          });
        }
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getIntegrationStats(req: Request, res: Response) {
    try {
      const result = await this.integrationService.getIntegrationStats();
      return res.status(200).json({
        success: true,
        message: "Integration stats retrieved successfully",
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
