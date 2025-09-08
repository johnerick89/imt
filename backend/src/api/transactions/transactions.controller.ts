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

const transactionService = new TransactionService();

export class TransactionController {
  // Create Outbound Transaction
  async createOutboundTransaction(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        res.status(400).json({
          success: false,
          message: "Organisation ID is required",
        });
        return;
      }

      const validation = createOutboundTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
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

      const result = await transactionService.createOutboundTransaction(
        orgId,
        validation.data,
        userId
      );
      res.status(201).json({
        success: true,
        message: "Outbound transaction created successfully",
        data: result,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create outbound transaction",
      });
    }
  }

  // Update Transaction
  async updateTransaction(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      if (!transactionId) {
        res.status(400).json({
          success: false,
          message: "Transaction ID is required",
        });
        return;
      }

      const validation = updateTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
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

      // TODO: Implement update transaction logic
      res.status(501).json({
        success: false,
        message: "Update transaction not implemented yet",
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update transaction",
      });
    }
  }

  // Cancel Transaction
  async cancelTransaction(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      if (!transactionId) {
        res.status(400).json({
          success: false,
          message: "Transaction ID is required",
        });
        return;
      }

      const validation = cancelTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
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

      const result = await transactionService.cancelTransaction(
        transactionId,
        validation.data,
        userId
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to cancel transaction",
      });
    }
  }

  // Approve Transaction
  async approveTransaction(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      if (!transactionId) {
        res.status(400).json({
          success: false,
          message: "Transaction ID is required",
        });
        return;
      }

      const validation = approveTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
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

      const result = await transactionService.approveTransaction(
        transactionId,
        validation.data,
        userId
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to approve transaction",
      });
    }
  }

  // Reverse Transaction
  async reverseTransaction(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      if (!transactionId) {
        res.status(400).json({
          success: false,
          message: "Transaction ID is required",
        });
        return;
      }

      const validation = reverseTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
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

      const result = await transactionService.reverseTransaction(
        transactionId,
        validation.data,
        userId
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to reverse transaction",
      });
    }
  }

  // Get Transactions
  async getTransactions(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        res.status(400).json({
          success: false,
          message: "Organisation ID is required",
        });
        return;
      }

      const validation = transactionFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
        });
        return;
      }

      const result = await transactionService.getTransactions(
        orgId,
        validation.data
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch transactions",
      });
    }
  }

  // Get Transaction by ID
  async getTransactionById(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { transactionId } = req.params;
      if (!transactionId) {
        res.status(400).json({
          success: false,
          message: "Transaction ID is required",
        });
        return;
      }

      const result = await transactionService.getTransactionById(transactionId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch transaction",
      });
    }
  }

  // Get Transaction Stats
  async getTransactionStats(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        res.status(400).json({
          success: false,
          message: "Organisation ID is required",
        });
        return;
      }

      const result = await transactionService.getTransactionStats(orgId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch transaction stats",
      });
    }
  }

  // Get Inbound Transactions
  async getInboundTransactions(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        res.status(400).json({
          success: false,
          message: "Organisation ID is required",
        });
        return;
      }

      const validation = transactionFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
        });
        return;
      }

      const result = await transactionService.getInboundTransactions(
        orgId,
        validation.data
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error fetching inbound transactions:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch inbound transactions",
      });
    }
  }

  // Get Inbound Transaction by ID
  async getInboundTransactionById(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { transactionId } = req.params;
      if (!transactionId) {
        res.status(400).json({
          success: false,
          message: "Transaction ID is required",
        });
        return;
      }

      const result = await transactionService.getInboundTransactionById(
        transactionId
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error fetching inbound transaction:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch inbound transaction",
      });
    }
  }

  // Approve Inbound Transaction
  async approveInboundTransaction(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { transactionId } = req.params;
      if (!transactionId) {
        res.status(400).json({
          success: false,
          message: "Transaction ID is required",
        });
        return;
      }

      const validation = approveTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
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

      const result = await transactionService.approveInboundTransaction(
        transactionId,
        validation.data,
        userId
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error approving inbound transaction:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to approve inbound transaction",
      });
    }
  }

  // Reverse Inbound Transaction
  async reverseInboundTransaction(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { transactionId } = req.params;
      if (!transactionId) {
        res.status(400).json({
          success: false,
          message: "Transaction ID is required",
        });
        return;
      }

      const validation = reverseTransactionSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
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

      const result = await transactionService.reverseInboundTransaction(
        transactionId,
        validation.data,
        userId
      );

      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error reversing inbound transaction:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to reverse inbound transaction",
      });
    }
  }

  // Get Inbound Transaction Stats
  async getInboundTransactionStats(
    req: CustomRequest,
    res: Response
  ): Promise<void> {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        res.status(400).json({
          success: false,
          message: "Organisation ID is required",
        });
        return;
      }

      const result = await transactionService.getInboundTransactionStats(orgId);
      res.status(200).json(result);
    } catch (error: any) {
      console.error("Error fetching inbound transaction stats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch inbound transaction stats",
      });
    }
  }
}
