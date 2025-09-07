import { Response } from "express";
import { VaultService } from "./vaults.services";
import {
  createVaultSchema,
  updateVaultSchema,
  vaultFiltersSchema,
} from "./vaults.validation";
import type CustomRequest from "../../types/CustomReq.type";

const vaultService = new VaultService();

export class VaultController {
  async createVault(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = createVaultSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const result = await vaultService.createVault(validation.data);
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Error in createVault:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getVaults(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = vaultFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const result = await vaultService.getVaults(validation.data);
      res.json(result);
    } catch (error: any) {
      console.error("Error in getVaults:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getVaultById(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Vault ID is required",
        });
        return;
      }

      const result = await vaultService.getVaultById(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in getVaultById:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async updateVault(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = updateVaultSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Vault ID is required",
        });
        return;
      }

      const result = await vaultService.updateVault(id, validation.data);
      res.json(result);
    } catch (error: any) {
      console.error("Error in updateVault:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async deleteVault(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Vault ID is required",
        });
        return;
      }

      const result = await vaultService.deleteVault(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in deleteVault:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getVaultStats(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = vaultFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const result = await vaultService.getVaultStats(validation.data);
      res.json(result);
    } catch (error: any) {
      console.error("Error in getVaultStats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
