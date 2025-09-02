import { Request, Response } from "express";
import { IndustryService } from "./industries.services";
import {
  createIndustrySchema,
  updateIndustrySchema,
  industryFiltersSchema,
} from "./industries.validation";
import type CustomRequest from "../../types/CustomReq.type";

export class IndustryController {
  private industryService: IndustryService;

  constructor() {
    this.industryService = new IndustryService();
  }

  async createIndustry(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const validatedData = createIndustrySchema.parse(req.body);

      const result = await this.industryService.createIndustry(
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

  async getIndustries(req: Request, res: Response) {
    try {
      const validatedFilters = industryFiltersSchema.parse(req.query);
      const result = await this.industryService.getIndustries(validatedFilters);
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

  async getIndustryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.industryService.getIndustryById(id);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({
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

  async updateIndustry(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateIndustrySchema.parse(req.body);
      const result = await this.industryService.updateIndustry(
        id,
        validatedData
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

  async deleteIndustry(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.industryService.deleteIndustry(id);
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

  async getIndustryStats(req: Request, res: Response) {
    try {
      const result = await this.industryService.getIndustryStats();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
