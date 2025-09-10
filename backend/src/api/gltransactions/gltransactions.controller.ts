import { Request, Response } from "express";
import { GlTransactionService } from "./gltransactions.services";
import {
  glTransactionFiltersSchema,
  reverseGlTransactionSchema,
} from "./gltransactions.validation";
import type CustomRequest from "../../types/CustomReq.type";

const glTransactionService = new GlTransactionService();

export class GlTransactionController {
  // Get GL Transactions
  async getGlTransactions(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id: organisationId } = req.params;
      const validatedFilters = glTransactionFiltersSchema.parse(req.query);

      const result = await glTransactionService.getGlTransactions(
        organisationId,
        validatedFilters
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in getGlTransactions controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: {
          glTransactions: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        },
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get GL Transaction by ID
  async getGlTransactionById(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id: organisationId, transactionId } = req.params;
      const result = await glTransactionService.getGlTransactionById(
        organisationId,
        transactionId
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Error in getGlTransactionById controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: {} as any,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get GL Transaction Stats
  async getGlTransactionStats(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id: organisationId } = req.params;
      const result = await glTransactionService.getGlTransactionStats(
        organisationId
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in getGlTransactionStats controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: {
          totalTransactions: 0,
          totalAmount: 0,
          byStatus: [],
          byType: [],
          byCurrency: [],
        },
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Reverse GL Transaction
  async reverseGlTransaction(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id: organisationId, transactionId } = req.params;
      const validatedData = reverseGlTransactionSchema.parse(req.body);
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
          data: {
            original_transaction: {} as any,
            reversal_transaction: {} as any,
          },
          error: "Authentication required",
        });
        return;
      }

      const result = await glTransactionService.reverseGlTransaction(
        organisationId,
        transactionId,
        validatedData,
        userId
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in reverseGlTransaction controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        data: {
          original_transaction: {} as any,
          reversal_transaction: {} as any,
        },
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
