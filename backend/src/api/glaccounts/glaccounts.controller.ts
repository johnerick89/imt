import { Request, Response } from "express";
import { GlAccountService } from "./glaccounts.services";
import {
  createGlAccountSchema,
  updateGlAccountSchema,
  glAccountFiltersSchema,
  generateAccountsSchema,
} from "./glaccounts.validation";
import { GlAccountType } from "@prisma/client";

const glAccountService = new GlAccountService();

export class GlAccountController {
  // Create GL Account
  async createGlAccount(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createGlAccountSchema.parse(req.body);
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
          error: "Authentication required",
        });
        return;
      }

      const result = await glAccountService.createGlAccount(
        { ...validatedData, type: validatedData.type as GlAccountType },
        userId
      );

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in createGlAccount controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get GL Accounts
  async getGlAccounts(req: Request, res: Response): Promise<void> {
    try {
      const validatedFilters = glAccountFiltersSchema.parse(req.query);
      const result = await glAccountService.getGlAccounts(validatedFilters);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in getGlAccounts controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get GL Account by ID
  async getGlAccountById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await glAccountService.getGlAccountById(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Error in getGlAccountById controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Update GL Account
  async updateGlAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateGlAccountSchema.parse(req.body);
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
          error: "Authentication required",
        });
        return;
      }

      // Ensure 'type' is cast to GlAccountType if present to satisfy type requirements
      const dataToUpdate = {
        ...validatedData,
        type: validatedData.type as GlAccountType | undefined,
      };

      const result = await glAccountService.updateGlAccount(
        id,
        dataToUpdate,
        userId
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in updateGlAccount controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Delete GL Account
  async deleteGlAccount(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await glAccountService.deleteGlAccount(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in deleteGlAccount controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Get GL Account Stats
  async getGlAccountStats(req: Request, res: Response): Promise<void> {
    try {
      const { organisation_id } = req.query;
      const result = await glAccountService.getGlAccountStats(
        organisation_id as string
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in getGlAccountStats controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Generate GL Accounts
  async generateGlAccounts(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = generateAccountsSchema.parse(req.body);
      const userId = (req as any).user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
          error: "Authentication required",
        });
        return;
      }

      const result = await glAccountService.generateGlAccounts(
        validatedData,
        userId
      );

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in generateGlAccounts controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
