import { Request, Response } from "express";
import { CorridorService } from "./corridors.services";
import {
  createCorridorSchema,
  updateCorridorSchema,
  corridorFiltersSchema,
  corridorStatsFiltersSchema,
} from "./corridors.validation";
import type CustomRequest from "../../types/CustomReq.type";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../middlewares/error.middleware";

export class CorridorController {
  private corridorService: CorridorService;

  constructor() {
    this.corridorService = new CorridorService();
  }

  createCorridor = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      console.log("req.body", req.body);

      const validatedData = createCorridorSchema.parse(req.body);

      const result = await this.corridorService.createCorridor(
        validatedData,
        userId
      );
      res.status(201).json(result);
    }
  );

  getCorridors = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      console.log(req.query);
      const validatedFilters = corridorFiltersSchema.parse(req.query);
      const result = await this.corridorService.getCorridors(validatedFilters);
      res.status(200).json(result);
    }
  );

  getCorridorById = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const result = await this.corridorService.getCorridorById(id);
      res.status(200).json(result);
    }
  );

  updateCorridor = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const validatedData = updateCorridorSchema.parse(req.body);
      const result = await this.corridorService.updateCorridor(
        id,
        validatedData
      );
      res.status(200).json(result);
    }
  );

  deleteCorridor = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const { id } = req.params;
      const result = await this.corridorService.deleteCorridor(id);
      res.status(200).json(result);
    }
  );

  getCorridorStats = asyncHandler(
    async (req: Request, res: Response): Promise<void> => {
      const statsFilters = corridorStatsFiltersSchema.parse(req.query);
      const result = await this.corridorService.getCorridorStats(statsFilters);
      res.status(200).json(result);
    }
  );
}
