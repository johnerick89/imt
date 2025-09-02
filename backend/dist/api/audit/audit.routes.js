"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const audit_controller_1 = require("./audit.controller");
const router = (0, express_1.Router)();
const auditController = new audit_controller_1.AuditController();
router.get("/", auditController.getAuditLogs.bind(auditController));
router.get("/stats", auditController.getAuditStats.bind(auditController));
router.get("/:id", auditController.getAuditLogById.bind(auditController));
router.get("/user/:userId", auditController.getUserAuditHistory.bind(auditController));
router.get("/entity/:entityType/:entityId", auditController.getEntityAuditHistory.bind(auditController));
exports.default = router;
//# sourceMappingURL=audit.routes.js.map