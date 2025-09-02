import { Request, Response } from "express";
import { CorridorService } from "./corridors.services";
import {
  createCorridorSchema,
  updateCorridorSchema,
  corridorFiltersSchema,
} from "./corridors.validation";
import type CustomRequest from "../../types/CustomReq.type";

export class CorridorController {
  private corridorService: CorridorService;

  constructor() {
    this.corridorService = new CorridorService();
  }

  async createCorridor(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }

      const validatedData = createCorridorSchema.parse(req.body);

      const result = await this.corridorService.createCorridor(
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

  async getCorridors(req: Request, res: Response) {
    try {
      const validatedFilters = corridorFiltersSchema.parse(req.query);
      const result = await this.corridorService.getCorridors(validatedFilters);
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

  async getCorridorById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.corridorService.getCorridorById(id);
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

  async updateCorridor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateCorridorSchema.parse(req.body);
      const result = await this.corridorService.updateCorridor(
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

  async deleteCorridor(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.corridorService.deleteCorridor(id);
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

  async getCorridorStats(req: Request, res: Response) {
    try {
      const result = await this.corridorService.getCorridorStats();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
