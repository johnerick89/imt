import { Response } from "express";
import userTillService from "./usertills.services";
import {
  createUserTillSchema,
  updateUserTillSchema,
  userTillFiltersSchema,
} from "./usertills.validation";
import type CustomRequest from "../../types/CustomReq.type";

export class UserTillController {
  async createUserTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = createUserTillSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const result = await userTillService.createUserTill(validation.data);
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Error in createUserTill:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getUserTills(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = userTillFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const result = await userTillService.getUserTills(validation.data);
      res.json(result);
    } catch (error: any) {
      console.error("Error in getUserTills:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getUserTillById(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "User till ID is required",
        });
        return;
      }

      const result = await userTillService.getUserTillById(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in getUserTillById:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async updateUserTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = updateUserTillSchema.safeParse(req.body);

      if (!id) {
        res.status(400).json({
          success: false,
          message: "User till ID is required",
        });
        return;
      }

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const result = await userTillService.updateUserTill(id, validation.data);
      res.json(result);
    } catch (error: any) {
      console.error("Error in updateUserTill:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async deleteUserTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "User till ID is required",
        });
        return;
      }

      const result = await userTillService.deleteUserTill(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in deleteUserTill:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getUserTillStats(req: CustomRequest, res: Response): Promise<void> {
    try {
      const result = await userTillService.getUserTillStats();
      res.json(result);
    } catch (error: any) {
      console.error("Error in getUserTillStats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async closeUserTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "User till ID is required",
        });
        return;
      }

      const result = await userTillService.closeUserTill(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in closeUserTill:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async blockUserTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "User till ID is required",
        });
        return;
      }

      const result = await userTillService.blockUserTill(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in blockUserTill:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
