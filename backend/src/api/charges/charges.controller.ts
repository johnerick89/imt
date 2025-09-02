import { Request, Response } from "express";
import { ChargeService } from "./charges.services";
import {
  createChargeSchema,
  updateChargeSchema,
  chargeFiltersSchema,
} from "./charges.validation";
import type CustomRequest from "../../types/CustomReq.type";

export class ChargeController {
  private chargeService: ChargeService;

  constructor() {
    this.chargeService = new ChargeService();
  }

  async createCharge(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }
      console.log("req.body", req.body);
      const validatedData = createChargeSchema.parse(req.body);

      const result = await this.chargeService.createCharge(
        validatedData,
        userId
      );
      return res.status(201).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getCharges(req: Request, res: Response) {
    try {
      const validatedFilters = chargeFiltersSchema.parse(req.query);
      const result = await this.chargeService.getCharges(validatedFilters);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getChargeById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.chargeService.getChargeById(id);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async updateCharge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateChargeSchema.parse(req.body);
      const result = await this.chargeService.updateCharge(id, validatedData);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async deleteCharge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.chargeService.deleteCharge(id);
      return res.status(200).json(result);
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  async getChargeStats(req: Request, res: Response) {
    try {
      const result = await this.chargeService.getChargeStats();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
