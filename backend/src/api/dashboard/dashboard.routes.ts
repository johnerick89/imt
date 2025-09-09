import express from "express";
import { DashboardController } from "./dashboard.controller";

const router = express.Router();
const dashboardController = new DashboardController();

// Dashboard routes
router.get(
  "/organisations/:orgId/dashboard",
  dashboardController.getDashboardData.bind(dashboardController)
);

export default router;
