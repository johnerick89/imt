import { Response } from "express";
import { prisma } from "../../lib/prisma.lib";
import { DashboardService } from "./dashboard.services";
import type CustomRequest from "../../types/CustomReq.type";
import { AppError } from "../../utils/AppError";
import { asyncHandler } from "../../middlewares/error.middleware";

const dashboardService = new DashboardService();

export class DashboardController {
  getDashboardData = asyncHandler(
    async (req: CustomRequest, res: Response): Promise<void> => {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError("User not authenticated", 401);
      }

      // Verify user has access to this organisation
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { organisation_id: true },
      });

      const { orgId } = req.params;
      const organisationId = req.user?.organisation_id || orgId;

      if (!orgId) {
        throw new AppError("Organisation ID is required", 400);
      }

      if (!user || user.organisation_id !== orgId) {
        throw new AppError("Access denied to this organisation", 403);
      }

      const dashboardData = await dashboardService.getDashboardData(
        organisationId
      );

      res.json({
        success: true,
        message: "Dashboard data retrieved successfully",
        data: dashboardData,
      });
    }
  );
}
