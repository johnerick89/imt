import { Response } from "express";
import { BankAccountService } from "./bankaccounts.services";
import {
  createBankAccountSchema,
  updateBankAccountSchema,
  bankAccountFiltersSchema,
  topupSchema,
  withdrawalSchema,
} from "./bankaccounts.validation";
import type CustomRequest from "../../types/CustomReq.type";

const bankAccountService = new BankAccountService();

export class BankAccountController {
  async createBankAccount(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = createBankAccountSchema.safeParse(req.body);
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

      const result = await bankAccountService.createBankAccount(
        validation.data,
        userId
      );
      res.status(201).json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create bank account",
      });
    }
  }

  async getBankAccounts(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = bankAccountFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
        });
        return;
      }

      const result = await bankAccountService.getBankAccounts(validation.data);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch bank accounts",
      });
    }
  }

  async getBankAccountById(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Bank account ID is required",
        });
        return;
      }

      const result = await bankAccountService.getBankAccountById(id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch bank account",
      });
    }
  }

  async updateBankAccount(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Bank account ID is required",
        });
        return;
      }

      const validation = updateBankAccountSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
        });
        return;
      }

      const result = await bankAccountService.updateBankAccount(
        id,
        validation.data
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to update bank account",
      });
    }
  }

  async deleteBankAccount(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Bank account ID is required",
        });
        return;
      }

      const result = await bankAccountService.deleteBankAccount(id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to delete bank account",
      });
    }
  }

  async getBankAccountStats(req: CustomRequest, res: Response): Promise<void> {
    try {
      const organisationId = req.query.organisation_id as string;
      const result = await bankAccountService.getBankAccountStats(organisationId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch bank account stats",
      });
    }
  }

  async topupBankAccount(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Bank account ID is required",
        });
        return;
      }

      const validation = topupSchema.safeParse(req.body);
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

      const result = await bankAccountService.topupBankAccount(
        id,
        validation.data,
        userId
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to top up bank account",
      });
    }
  }

  async withdrawFromBankAccount(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: "Bank account ID is required",
        });
        return;
      }

      const validation = withdrawalSchema.safeParse(req.body);
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

      const result = await bankAccountService.withdrawFromBankAccount(
        id,
        validation.data,
        userId
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to withdraw from bank account",
      });
    }
  }
}
