import { Request, Response } from "express";
import { BranchService } from "./branches.services";
import {
  createBranchSchema,
  updateBranchSchema,
  branchFiltersSchema,
} from "./branches.validation";
import type CustomRequest from "../../types/CustomReq.type";

const branchService = new BranchService();

export class BranchController {
  async createBranch(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
          error: "AUTHENTICATION_REQUIRED",
        });
      }

      const validation = createBranchSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          error: validation.error.issues,
        });
      }

      const branch = await branchService.createBranch(validation.data, userId);

      return res.status(201).json({
        success: true,
        message: "Branch created successfully",
        data: branch,
      });
    } catch (error: any) {
      console.error("Error creating branch:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create branch",
        error: "CREATE_BRANCH_ERROR",
      });
    }
  }

  async getBranches(req: Request, res: Response) {
    try {
      const validation = branchFiltersSchema.safeParse(req.query);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          error: validation.error.issues,
        });
      }

      const result = await branchService.getBranches(validation.data);

      return res.status(200).json({
        success: true,
        message: "Branches retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      console.error("Error getting branches:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve branches",
        error: "GET_BRANCHES_ERROR",
      });
    }
  }

  async getBranchById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Branch ID is required",
          error: "BRANCH_ID_REQUIRED",
        });
      }

      const branch = await branchService.getBranchById(id);

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
          error: "BRANCH_NOT_FOUND",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Branch retrieved successfully",
        data: branch,
      });
    } catch (error: any) {
      console.error("Error getting branch:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve branch",
        error: "GET_BRANCH_ERROR",
      });
    }
  }

  async updateBranch(req: CustomRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Branch ID is required",
          error: "BRANCH_ID_REQUIRED",
        });
      }

      const validation = updateBranchSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          error: validation.error.issues,
        });
      }

      const branch = await branchService.updateBranch(id, validation.data);

      if (!branch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
          error: "BRANCH_NOT_FOUND",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Branch updated successfully",
        data: branch,
      });
    } catch (error: any) {
      console.error("Error updating branch:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update branch",
        error: "UPDATE_BRANCH_ERROR",
      });
    }
  }

  async deleteBranch(req: CustomRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          message: "Branch ID is required",
          error: "BRANCH_ID_REQUIRED",
        });
      }

      // Check if branch exists
      const existingBranch = await branchService.getBranchById(id);
      if (!existingBranch) {
        return res.status(404).json({
          success: false,
          message: "Branch not found",
          error: "BRANCH_NOT_FOUND",
        });
      }

      await branchService.deleteBranch(id);

      return res.status(200).json({
        success: true,
        message: "Branch deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting branch:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete branch",
        error: "DELETE_BRANCH_ERROR",
      });
    }
  }

  async getBranchStats(req: Request, res: Response) {
    try {
      const stats = await branchService.getBranchStats();

      return res.status(200).json({
        success: true,
        message: "Branch statistics retrieved successfully",
        data: stats,
      });
    } catch (error: any) {
      console.error("Error getting branch stats:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve branch statistics",
        error: "GET_BRANCH_STATS_ERROR",
      });
    }
  }
}
