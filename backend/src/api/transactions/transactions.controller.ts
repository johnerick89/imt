import { Response } from "express";
import { TransactionService } from "./transactions.services";
import {
  createOutboundTransactionSchema,
  createInboundTransactionSchema,
  updateTransactionSchema,
  transactionFiltersSchema,
  cancelTransactionSchema,
  approveTransactionSchema,
  reverseTransactionSchema,
} from "./transactions.validation";
import type CustomRequest from "../../types/CustomReq.type";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../middlewares/error.middleware";

const transactionService = new TransactionService();

export class TransactionController {
  // Create Outbound Transaction
  createOutboundTransaction = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { orgId } = req.params;
      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      const validation = createOutboundTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await transactionService.createOutboundTransaction(
        orgId,
        validation.data,
        userId,
        req.ip || ""
      );
      res.status(201).json({
        success: true,
        message: "Outbound transaction created successfully",
        data: result,
      });
    }
  );

  // Cancel Transaction
  cancelTransaction = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { transactionId } = req.params;
      if (!transactionId) {
        throw new AppError("Transaction ID is required", 400);
      }

      const validation = cancelTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await transactionService.cancelTransaction(
        transactionId,
        validation.data,
        userId,
        req.ip || ""
      );
      res.json(result);
    }
  );

  // Approve Transaction
  approveTransaction = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { transactionId } = req.params;
      if (!transactionId) {
        throw new AppError("Transaction ID is required", 400);
      }

      const validation = approveTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await transactionService.approveTransaction(
        transactionId,
        validation.data,
        userId,
        req.ip || ""
      );
      res.json(result);
    }
  );

  // Reverse Transaction
  reverseTransaction = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { transactionId } = req.params;
      if (!transactionId) {
        throw new AppError("Transaction ID is required", 400);
      }

      const validation = reverseTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await transactionService.reverseTransaction(
        transactionId,
        validation.data,
        userId,
        req.ip || ""
      );
      res.json(result);
    }
  );

  // Get Transactions
  getTransactions = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { orgId } = req.params;
      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      const validation = transactionFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const result = await transactionService.getTransactions(
        orgId,
        validation.data
      );
      res.json(result);
    }
  );

  // Get Transaction by ID
  getTransactionById = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { transactionId } = req.params;
      if (!transactionId) {
        throw new AppError("Transaction ID is required", 400);
      }

      const result = await transactionService.getTransactionById(transactionId);
      res.json(result);
    }
  );

  // Get Transaction Stats
  getTransactionStats = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { orgId } = req.params;
      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      const result = await transactionService.getTransactionStats(orgId);
      res.json(result);
    }
  );

  // Get Inbound Transactions
  getInboundTransactions = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { orgId } = req.params;
      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      const validation = transactionFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const result = await transactionService.getInboundTransactions(
        orgId,
        validation.data
      );

      res.status(200).json(result);
    }
  );

  // Get Inbound Transaction by ID
  getInboundTransactionById = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { transactionId } = req.params;
      if (!transactionId) {
        throw new AppError("Transaction ID is required", 400);
      }

      const result = await transactionService.getInboundTransactionById(
        transactionId
      );

      res.status(200).json(result);
    }
  );

  // Approve Inbound Transaction
  approveInboundTransaction = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { transactionId } = req.params;
      if (!transactionId) {
        throw new AppError("Transaction ID is required", 400);
      }

      const validation = approveTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await transactionService.approveInboundTransaction(
        transactionId,
        validation.data,
        userId,
        req.ip || ""
      );

      res.status(200).json(result);
    }
  );

  // Reverse Inbound Transaction
  reverseInboundTransaction = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { transactionId } = req.params;
      if (!transactionId) {
        throw new AppError("Transaction ID is required", 400);
      }

      const validation = reverseTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        throw new AppError("Validation error", 400);
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      const result = await transactionService.reverseInboundTransaction(
        transactionId,
        validation.data,
        userId,
        req.ip || ""
      );

      res.status(200).json(result);
    }
  );

  // Get Inbound Transaction Stats
  getInboundTransactionStats = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const { orgId } = req.params;
      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      const result = await transactionService.getInboundTransactionStats(orgId);
      res.status(200).json(result);
    }
  );
}
