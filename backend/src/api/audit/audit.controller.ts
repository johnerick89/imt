import { Request, Response } from "express";
import { AuditService } from "../../services/audit.service";

const auditService = new AuditService();

export class AuditController {
  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const filters = {
        userId: req.query.userId as string,
        entityType: req.query.entityType as string,
        entityId: req.query.entityId as string,
        action: req.query.action as string,
        organisationId: req.query.organisationId as string,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
      };

      const result = await auditService.getAuditLogs(filters);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in getAuditLogs controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      });
    }
  }

  async getAuditLogById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const result = await auditService.getAuditLogById(id);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error("Error in getAuditLogById controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      });
    }
  }

  async getUserAuditHistory(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const filters = {
        entityType: req.query.entityType as string,
        action: req.query.action as string,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
      };

      const result = await auditService.getUserAuditHistory(userId, filters);

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in getUserAuditHistory controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      });
    }
  }

  async getEntityAuditHistory(req: Request, res: Response): Promise<void> {
    try {
      const { entityType, entityId } = req.params;
      const result = await auditService.getEntityAuditHistory(
        entityType,
        entityId
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in getEntityAuditHistory controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      });
    }
  }

  async getAuditStats(req: Request, res: Response): Promise<void> {
    try {
      const result = await auditService.getAuditStats();

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Error in getAuditStats controller:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: "INTERNAL_ERROR",
      });
    }
  }
}
