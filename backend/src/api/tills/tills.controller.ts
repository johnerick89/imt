import { Response } from "express";
import { TillService } from "./tills.services";
import {
  createTillSchema,
  updateTillSchema,
  tillFiltersSchema,
} from "./tills.validation";
import type CustomRequest from "../../types/CustomReq.type";

const tillService = new TillService();

export class TillController {
  async createTill(req: CustomRequest, res: Response) {
    try {
      const validation = createTillSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
      }

      const result = await tillService.createTill({
        data: validation.data,
        userId: req.user?.id,
      });
      return res.status(201).json(result);
    } catch (error: any) {
      console.error("Error in createTill:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getTills(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = tillFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const result = await tillService.getTills(validation.data);
      res.json(result);
    } catch (error: any) {
      console.error("Error in getTills:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getTillById(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Till ID is required",
        });
        return;
      }

      const result = await tillService.getTillById(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in getTillById:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async updateTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = updateTillSchema.safeParse(req.body);

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
          message: "Till ID is required",
        });
        return;
      }

      const result = await tillService.updateTill(id, validation.data);
      res.json(result);
    } catch (error: any) {
      console.error("Error in updateTill:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async deleteTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Till ID is required",
        });
        return;
      }

      const result = await tillService.deleteTill(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in deleteTill:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getTillStats(req: CustomRequest, res: Response): Promise<void> {
    try {
      const result = await tillService.getTillStats();
      res.json(result);
    } catch (error: any) {
      console.error("Error in getTillStats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async openTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Till ID is required",
        });
        return;
      }

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      const result = await tillService.openTill(id, userId);
      res.json(result);
    } catch (error: any) {
      console.error("Error in openTill:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async closeTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Till ID is required",
        });
        return;
      }

      const result = await tillService.closeTill(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in closeTill:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async blockTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Till ID is required",
        });
        return;
      }

      const result = await tillService.blockTill(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in blockTill:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async deactivateTill(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Till ID is required",
        });
        return;
      }

      const result = await tillService.deactivateTill(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in deactivateTill:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
