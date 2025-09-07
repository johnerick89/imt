import { Request, Response } from "express";
import { transactionChannelService } from "./transactionchannels.services";
import { transactionChannelFiltersSchema } from "./transactionchannels.validation";

export class TransactionChannelController {
  // Get Transaction Channels
  async getTransactionChannels(req: Request, res: Response): Promise<void> {
    try {
      const validation = transactionChannelFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
        });
        return;
      }

      const result = await transactionChannelService.getTransactionChannels(
        validation.data
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve transaction channels",
      });
    }
  }

  // Get Transaction Channel by ID
  async getTransactionChannelById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Transaction channel ID is required",
        });
        return;
      }

      const result = await transactionChannelService.getTransactionChannelById(
        id
      );
      if (!result.success) {
        res.status(404).json(result);
        return;
      }

      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve transaction channel",
      });
    }
  }

  // Get Transaction Channel Stats
  async getTransactionChannelStats(req: Request, res: Response): Promise<void> {
    try {
      const result =
        await transactionChannelService.getTransactionChannelStats();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message:
          error.message || "Failed to retrieve transaction channel stats",
      });
    }
  }
}

export const transactionChannelController = new TransactionChannelController();
