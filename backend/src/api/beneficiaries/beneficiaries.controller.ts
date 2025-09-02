import { Request, Response } from "express";
import { BeneficiaryService } from "./beneficiaries.services";
import {
  createBeneficiarySchema,
  updateBeneficiarySchema,
  beneficiaryFiltersSchema,
} from "./beneficiaries.validation";
import type CustomRequest from "../../types/CustomReq.type";

export class BeneficiaryController {
  private beneficiaryService: BeneficiaryService;

  constructor() {
    this.beneficiaryService = new BeneficiaryService();
  }

  async createBeneficiary(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
      }
      console.log("req.body", req.body);
      const validatedData = createBeneficiarySchema.parse(req.body);
      console.log(validatedData);

      const result = await this.beneficiaryService.createBeneficiary(
        validatedData,
        userId
      );
      console.log(result);
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

  async getBeneficiaries(req: Request, res: Response) {
    try {
      const validatedFilters = beneficiaryFiltersSchema.parse(req.query);
      const result = await this.beneficiaryService.getBeneficiaries(
        validatedFilters
      );
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

  async getBeneficiaryById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.beneficiaryService.getBeneficiaryById(id);
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

  async updateBeneficiary(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateBeneficiarySchema.parse(req.body);
      const result = await this.beneficiaryService.updateBeneficiary(
        id,
        validatedData
      );
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

  async deleteBeneficiary(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await this.beneficiaryService.deleteBeneficiary(id);
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

  async getBeneficiaryStats(req: Request, res: Response) {
    try {
      const result = await this.beneficiaryService.getBeneficiaryStats();
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
