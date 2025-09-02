"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const audit_service_1 = require("../../services/audit.service");
const auditService = new audit_service_1.AuditService();
class AuditController {
    async getAuditLogs(req, res) {
        try {
            const filters = {
                userId: req.query.userId,
                entityType: req.query.entityType,
                entityId: req.query.entityId,
                action: req.query.action,
                organisationId: req.query.organisationId,
                startDate: req.query.startDate
                    ? new Date(req.query.startDate)
                    : undefined,
                endDate: req.query.endDate
                    ? new Date(req.query.endDate)
                    : undefined,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit
                    ? parseInt(req.query.limit)
                    : undefined,
            };
            const result = await auditService.getAuditLogs(filters);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in getAuditLogs controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            });
        }
    }
    async getAuditLogById(req, res) {
        try {
            const { id } = req.params;
            const result = await auditService.getAuditLogById(id);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(404).json(result);
            }
        }
        catch (error) {
            console.error("Error in getAuditLogById controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            });
        }
    }
    async getUserAuditHistory(req, res) {
        try {
            const { userId } = req.params;
            const filters = {
                entityType: req.query.entityType,
                action: req.query.action,
                startDate: req.query.startDate
                    ? new Date(req.query.startDate)
                    : undefined,
                endDate: req.query.endDate
                    ? new Date(req.query.endDate)
                    : undefined,
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit
                    ? parseInt(req.query.limit)
                    : undefined,
            };
            const result = await auditService.getUserAuditHistory(userId, filters);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in getUserAuditHistory controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            });
        }
    }
    async getEntityAuditHistory(req, res) {
        try {
            const { entityType, entityId } = req.params;
            const result = await auditService.getEntityAuditHistory(entityType, entityId);
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in getEntityAuditHistory controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            });
        }
    }
    async getAuditStats(req, res) {
        try {
            const result = await auditService.getAuditStats();
            if (result.success) {
                res.status(200).json(result);
            }
            else {
                res.status(400).json(result);
            }
        }
        catch (error) {
            console.error("Error in getAuditStats controller:", error);
            res.status(500).json({
                success: false,
                message: "Internal server error",
                error: "INTERNAL_ERROR",
            });
        }
    }
}
exports.AuditController = AuditController;
//# sourceMappingURL=audit.controller.js.map