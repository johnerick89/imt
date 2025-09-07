import { Response } from "express";
import { ExchangeRateService } from "./exchangerates.services";
import {
  createExchangeRateSchema,
  updateExchangeRateSchema,
  exchangeRateFiltersSchema,
  approveExchangeRateSchema,
} from "./exchangerates.validation";
import type CustomRequest from "../../types/CustomReq.type";

const exchangeRateService = new ExchangeRateService();

export class ExchangeRateController {
  async createExchangeRate(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = createExchangeRateSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
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

      const result = await exchangeRateService.createExchangeRate(
        validation.data,
        userId
      );
      res.status(201).json(result);
    } catch (error: any) {
      console.error("Error in createExchangeRate:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getExchangeRates(req: CustomRequest, res: Response): Promise<void> {
    try {
      const validation = exchangeRateFiltersSchema.safeParse(req.query);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const result = await exchangeRateService.getExchangeRates(
        validation.data
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error in getExchangeRates:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getExchangeRateById(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Exchange rate ID is required",
        });
        return;
      }

      const result = await exchangeRateService.getExchangeRateById(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in getExchangeRateById:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async updateExchangeRate(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const validation = updateExchangeRateSchema.safeParse(req.body);

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
          message: "Exchange rate ID is required",
        });
        return;
      }

      const result = await exchangeRateService.updateExchangeRate(
        id,
        validation.data
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error in updateExchangeRate:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async deleteExchangeRate(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Exchange rate ID is required",
        });
        return;
      }

      const result = await exchangeRateService.deleteExchangeRate(id);
      res.json(result);
    } catch (error: any) {
      console.error("Error in deleteExchangeRate:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getExchangeRateStats(req: CustomRequest, res: Response): Promise<void> {
    try {
      const result = await exchangeRateService.getExchangeRateStats();
      res.json(result);
    } catch (error: any) {
      console.error("Error in getExchangeRateStats:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async approveExchangeRate(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: "Exchange rate ID is required",
        });
        return;
      }

      const validation = approveExchangeRateSchema.safeParse(req.body);

      if (!validation.success) {
        res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.issues,
        });
        return;
      }

      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User authentication required",
        });
        return;
      }

      const result = await exchangeRateService.approveExchangeRate(
        id,
        validation.data,
        userId
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error in approveExchangeRate:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
