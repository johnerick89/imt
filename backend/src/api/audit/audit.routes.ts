import { Router } from "express";
import { AuditController } from "./audit.controller";

const router = Router();
const auditController = new AuditController();

// Get all audit logs with filters
router.get("/", auditController.getAuditLogs.bind(auditController));

// Get audit stats
router.get("/stats", auditController.getAuditStats.bind(auditController));

// Get audit log by ID
router.get("/:id", auditController.getAuditLogById.bind(auditController));

// Get user audit history
router.get(
  "/user/:userId",
  auditController.getUserAuditHistory.bind(auditController)
);

// Get entity audit history
router.get(
  "/entity/:entityType/:entityId",
  auditController.getEntityAuditHistory.bind(auditController)
);

export default router;
