import { Request, Response } from "express";
import { OccupationService } from "./occupations.services";
import {
  createOccupationSchema,
  updateOccupationSchema,
  occupationFiltersSchema,
} from "./occupations.validation";
import type CustomRequest from "../../types/CustomReq.type";

export class OccupationController {
  private occupationService: OccupationService;

  constructor() {
    this.occupationService = new OccupationService();
  }

  async createOccupation(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const validatedData = createOccupationSchema.parse(req.body);

      const result = await this.occupationService.createOccupation(
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

  async getOccupations(req: Request, res: Response) {
    try {
      const validatedFilters = occupationFiltersSchema.parse(req.query);
      const result = await this.occupationService.getOccupations(
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

  async getOccupationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.occupationService.getOccupationById(id);
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

  async updateOccupation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateOccupationSchema.parse(req.body);
      const result = await this.occupationService.updateOccupation(
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

  async deleteOccupation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.occupationService.deleteOccupation(id);
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

  async getOccupationStats(req: Request, res: Response) {
    try {
      const result = await this.occupationService.getOccupationStats();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
