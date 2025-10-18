import { Request, Response } from "express";
import { ChargeService } from "./charges.services";
import {
  createChargeSchema,
  updateChargeSchema,
  chargeFiltersSchema,
  chargeStatsFiltersSchema,
} from "./charges.validation";
import type CustomRequest from "../../types/CustomReq.type";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../middlewares/error.middleware";

export class ChargeController {
  private chargeService: ChargeService;

  constructor() {
    this.chargeService = new ChargeService();
  }

  createCharge = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }
      console.log("req.body", req.body);
      const validatedData = createChargeSchema.parse(req.body);

      const result = await this.chargeService.createCharge(
        validatedData,
        userId
      );
      res.status(201).json(result);
    }
  );

  getCharges = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const validatedFilters = chargeFiltersSchema.parse(req.query);
      const result = await this.chargeService.getCharges(validatedFilters);
      res.status(200).json(result);
    }
  );

  getChargeById = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const result = await this.chargeService.getChargeById(id);
      res.status(200).json(result);
    }
  );

  updateCharge = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const validatedData = updateChargeSchema.parse(req.body);
      const result = await this.chargeService.updateCharge(id, validatedData);
      res.status(200).json(result);
    }
  );

  deleteCharge = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const result = await this.chargeService.deleteCharge(id);
      res.status(200).json(result);
    }
  );

  getChargeStats = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const validatedFilters = chargeStatsFiltersSchema.safeParse(req.query);
      if (!validatedFilters.success) {
        throw new AppError("Validation error", 400);
      }
      const result = await this.chargeService.getChargeStats(
        validatedFilters.data
      );
      res.status(200).json(result);
    }
  );

  createStandardCharge = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }
      console.log("req.body", req.body);
      const validatedData = createChargeSchema.parse(req.body);

      const result = await this.chargeService.createStandardCharge(
        validatedData,
        userId
      );
      res.status(201).json(result);
    }
  );

  getStandardCharges = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const validatedFilters = chargeFiltersSchema.parse(req.query);
      const result = await this.chargeService.getStandardCharges(
        validatedFilters
      );
      res.status(200).json(result);
    }
  );
}
