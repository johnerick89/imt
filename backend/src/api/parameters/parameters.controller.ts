import { Response } from "express";
import { parameterService } from "./parameters.service";
import { asyncHandler } from "../../middlewares/error.middleware";
import type CustomRequest from "../../types/CustomReq.type";
import {
  parameterFiltersSchema,
  createParameterSchema,
  updateParameterSchema,
  parameterIdSchema,
} from "./parameters.validation";

export class ParameterController {
  getParameters = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const filters = {
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const validationResult = parameterFiltersSchema.safeParse(filters);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: validationResult.error.issues[0]?.message || "Invalid input",
        });
        return;
      }

      const result = await parameterService.getParameters(
        validationResult.data
      );
      res.status(200).json(result);
    }
  );

  getParameterById = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      const validationResult = parameterIdSchema.safeParse({ id });
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message:
            validationResult.error.issues[0]?.message || "Invalid parameter ID",
        });
        return;
      }

      const result = await parameterService.getParameterById(id);
      res.status(200).json(result);
    }
  );

  createParameter = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const validationResult = createParameterSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: validationResult.error.issues[0]?.message || "Invalid input",
        });
        return;
      }

      const result = await parameterService.createParameter(
        validationResult.data
      );
      res.status(201).json(result);
    }
  );

  updateParameter = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      const idValidation = parameterIdSchema.safeParse({ id });
      if (!idValidation.success) {
        res.status(400).json({
          success: false,
          message:
            idValidation.error.issues[0]?.message || "Invalid parameter ID",
        });
        return;
      }

      const validationResult = updateParameterSchema.safeParse(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: validationResult.error.issues[0]?.message || "Invalid input",
        });
        return;
      }

      const result = await parameterService.updateParameter(
        id,
        validationResult.data
      );
      res.status(200).json(result);
    }
  );

  deleteParameter = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      const validationResult = parameterIdSchema.safeParse({ id });
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message:
            validationResult.error.issues[0]?.message || "Invalid parameter ID",
        });
        return;
      }

      const result = await parameterService.deleteParameter(id);
      res.status(200).json(result);
    }
  );

  getParameterStats = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const result = await parameterService.getParameterStats();
      res.status(200).json(result);
    }
  );
}
