import { Response } from "express";
import { prisma } from "../../lib/prisma.lib";
import { DashboardService } from "./dashboard.services";
import type CustomRequest from "../../types/CustomReq.type";

const dashboardService = new DashboardService();

export class DashboardController {
  async getDashboardData(req: CustomRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      // Verify user has access to this organisation
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { organisation_id: true },
      });

      const { orgId } = req.params;
      const organisationId = req.user?.organisation_id || orgId;

      if (!orgId) {
        res.status(400).json({
          success: false,
          message: "Organisation ID is required",
        });
        return;
      }

      if (!user || user.organisation_id !== orgId) {
        res.status(403).json({
          success: false,
          message: "Access denied to this organisation",
        });
        return;
      }

      const dashboardData = await dashboardService.getDashboardData(
        organisationId
      );

      res.json({
        success: true,
        message: "Dashboard data retrieved successfully",
        data: dashboardData,
      });
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch dashboard data",
      });
    }
  }
}
