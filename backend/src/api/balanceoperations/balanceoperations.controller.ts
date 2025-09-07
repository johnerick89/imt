import { Response } from "express";
import { BalanceOperationService } from "./balanceoperations.services";
import {
  orgBalanceOperationSchema,
  tillBalanceOperationSchema,
  vaultBalanceOperationSchema,
  orgBalanceFiltersSchema,
} from "./balanceoperations.validation";
import type CustomRequest from "../../types/CustomReq.type";

const balanceOperationService = new BalanceOperationService();

export class BalanceOperationController {
  // Organisation Balance Operations
  async prefundOrganisation(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { orgId } = req.params;
      if (!orgId) {
        res.status(400).json({
          success: false,
          message: "Organisation ID is required",
        });
        return;
      }

      const validation = orgBalanceOperationSchema.safeParse(req.body);
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

      const result = await balanceOperationService.prefundOrganisation(
        orgId,
        validation.data,
        userId
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to prefund organisation",
      });
    }
  }

  // Till Balance Operations
  async topupTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { tillId } = req.params;
      if (!tillId) {
        res.status(400).json({
          success: false,
          message: "Till ID is required",
        });
        return;
      }

      const validation = tillBalanceOperationSchema.safeParse(req.body);
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

      const result = await balanceOperationService.topupTill(
        tillId,
        validation.data,
        userId
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to top up till",
      });
    }
  }

  // Vault Balance Operations
  async topupVault(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { vaultId } = req.params;
      if (!vaultId) {
        res.status(400).json({
          success: false,
          message: "Vault ID is required",
        });
        return;
      }

      const validation = vaultBalanceOperationSchema.safeParse(req.body);
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

      const result = await balanceOperationService.topupVault(
        vaultId,
        validation.data,
        userId
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to top up vault",
      });
    }
  }

  // Till Withdrawal Operations
  async withdrawTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { tillId } = req.params;
      if (!tillId) {
        res.status(400).json({
          success: false,
          message: "Till ID is required",
        });
        return;
      }

      const validation = tillBalanceOperationSchema.safeParse(req.body);
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

      const result = await balanceOperationService.withdrawTill(
        tillId,
        validation.data,
        userId
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to withdraw from till",
      });
    }
  }

  // Vault Withdrawal Operations
  async withdrawVault(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { vaultId } = req.params;
      if (!vaultId) {
        res.status(400).json({
          success: false,
          message: "Vault ID is required",
        });
        return;
      }

      const validation = vaultBalanceOperationSchema.safeParse(req.body);
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

      const result = await balanceOperationService.withdrawVault(
        vaultId,
        validation.data,
        userId
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to withdraw from vault",
      });
    }
  }

  // Get Organisation Balances
  async getOrgBalances(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = orgBalanceFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation error",
          error: validation.error.issues,
        });
        return;
      }

      const result = await balanceOperationService.getOrgBalances(
        validation.data
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch organisation balances",
      });
    }
  }

  // Get Organisation Balance Stats
  async getOrgBalanceStats(req: CustomRequest, res: Response): Promise<void> {
    try {
      const organisationId = req.query.organisation_id as string;
      const result = await balanceOperationService.getOrgBalanceStats(
        organisationId
      );
      res.json(result);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch organisation balance stats",
      });
    }
  }
}
