import { Response } from "express";
import { transactionChannelService } from "./transactionchannels.services";
import {
  transactionChannelFiltersSchema,
  createTransactionChannelSchema,
  updateTransactionChannelSchema,
  transactionChannelIdSchema,
} from "./transactionchannels.validation";
import { asyncHandler } from "../../middlewares/error.middleware";
import type CustomRequest from "../../types/CustomReq.type";

export class TransactionChannelController {
  // Get Transaction Channels
  getTransactionChannels = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const filters = {
        search: req.query.search as string,
        direction: req.query.direction as string,
        created_by: req.query.created_by as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 10,
      };

      const validationResult =
        transactionChannelFiltersSchema.safeParse(filters);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: validationResult.error.issues[0]?.message || "Invalid input",
        });
        return;
      }

      const result = await transactionChannelService.getTransactionChannels(
        validationResult.data
      );
      res.status(200).json(result);
    }
  );

  // Get Transaction Channel by ID
  getTransactionChannelById = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      const validationResult = transactionChannelIdSchema.safeParse({ id });
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message:
            validationResult.error.issues[0]?.message ||
            "Invalid transaction channel ID",
        });
        return;
      }

      const result = await transactionChannelService.getTransactionChannelById(
        id
      );
      res.status(200).json(result);
    }
  );

  // Create Transaction Channel
  createTransactionChannel = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const validationResult = createTransactionChannelSchema.safeParse(
        req.body
      );
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: validationResult.error.issues[0]?.message || "Invalid input",
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await transactionChannelService.createTransactionChannel(
        validationResult.data,
        userId
      );
      res.status(201).json(result);
    }
  );

  // Update Transaction Channel
  updateTransactionChannel = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      const idValidation = transactionChannelIdSchema.safeParse({ id });
      if (!idValidation.success) {
        res.status(400).json({
          success: false,
          message:
            idValidation.error.issues[0]?.message ||
            "Invalid transaction channel ID",
        });
        return;
      }

      const validationResult = updateTransactionChannelSchema.safeParse(
        req.body
      );
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message: validationResult.error.issues[0]?.message || "Invalid input",
        });
        return;
      }

      const result = await transactionChannelService.updateTransactionChannel(
        id,
        validationResult.data
      );
      res.status(200).json(result);
    }
  );

  // Delete Transaction Channel
  deleteTransactionChannel = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { id } = req.params;

      const validationResult = transactionChannelIdSchema.safeParse({ id });
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          message:
            validationResult.error.issues[0]?.message ||
            "Invalid transaction channel ID",
        });
        return;
      }

      const result = await transactionChannelService.deleteTransactionChannel(
        id
      );
      res.status(200).json(result);
    }
  );

  // Get Transaction Channel Stats
  getTransactionChannelStats = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const result =
        await transactionChannelService.getTransactionChannelStats();
      res.status(200).json(result);
    }
  );
}

export const transactionChannelController = new TransactionChannelController();
