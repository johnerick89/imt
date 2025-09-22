import { Response } from "express";
import { TillService } from "./tills.services";
import {
  createTillSchema,
  updateTillSchema,
  tillFiltersSchema,
} from "./tills.validation";
import type CustomRequest from "../../types/CustomReq.type";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../middlewares/error.middleware";

const tillService = new TillService();

export class TillController {
  createTill = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const validation = createTillSchema.safeParse(req.body);
      console.log(
        "validation.data",
        validation.data,
        "req.body",
        req.body,
        "req.user",
        req.user
      );
      if (!validation.success) {
        throw new AppError(
          validation.error.issues[0]?.message || "Invalid input",
          400
        );
      }

      const result = await tillService.createTill({
        data: validation.data,
        userId: req.user?.id,
      });
      res.status(201).json(result);
    }
  );

  getTills = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const validation = tillFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        throw new AppError(
          validation.error.issues[0]?.message || "Invalid input",
          400
        );
      }
      console.log("req.query", req.query);
      console.log("validation.data", validation.data);

      const result = await tillService.getTills(validation.data);
      res.json(result);
    }
  );

  getTillById = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        throw new AppError("Till ID is required", 400);
      }

      const result = await tillService.getTillById(id);
      res.json(result);
    }
  );

  updateTill = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const validation = updateTillSchema.safeParse(req.body);

      if (!validation.success) {
        throw new AppError(
          validation.error.issues[0]?.message || "Invalid input",
          400
        );
      }

      if (!id) {
        throw new AppError("Till ID is required", 400);
      }

      const result = await tillService.updateTill(id, validation.data);
      res.json(result);
    }
  );

  deleteTill = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        throw new AppError("Till ID is required", 400);
      }

      const result = await tillService.deleteTill(id);
      res.json(result);
    }
  );

  getTillStats = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const result = await tillService.getTillStats();
      res.json(result);
    }
  );

  openTill = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id) {
        throw new AppError("Till ID is required", 400);
      }

      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await tillService.openTill(id, userId);
      res.json(result);
    }
  );

  closeTill = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        throw new AppError("Till ID is required", 400);
      }

      const result = await tillService.closeTill(id);
      res.json(result);
    }
  );

  blockTill = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        throw new AppError("Till ID is required", 400);
      }

      const result = await tillService.blockTill(id);
      res.json(result);
    }
  );

  deactivateTill = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      if (!id) {
        throw new AppError("Till ID is required", 400);
      }

      const result = await tillService.deactivateTill(id);
      res.json(result);
    }
  );
}
