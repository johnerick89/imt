"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class AuditService {
    async getAuditLogs(filters = {}) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (filters.userId) {
            where.user_id = filters.userId;
        }
        if (filters.entityType) {
            where.entity_type = filters.entityType;
        }
        if (filters.entityId) {
            where.entity_id = filters.entityId;
        }
        if (filters.action) {
            where.action = filters.action;
        }
        if (filters.organisationId) {
            where.organisation_id = filters.organisationId;
        }
        if (filters.startDate || filters.endDate) {
            where.created_at = {};
            if (filters.startDate) {
                where.created_at.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.created_at.lte = filters.endDate;
            }
        }
        const [auditLogs, total] = await Promise.all([
            prisma.userActivity.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            first_name: true,
                            last_name: true,
                        },
                    },
                    organisation: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            prisma.userActivity.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            success: true,
            message: "Audit logs retrieved successfully",
            data: {
                auditLogs,
                total,
                page,
                limit,
                totalPages,
            },
        };
    }
    async getAuditLogById(id) {
        const auditLog = await prisma.userActivity.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                organisation: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        if (!auditLog) {
            return {
                success: false,
                message: "Audit log not found",
                error: "AUDIT_LOG_NOT_FOUND",
            };
        }
        return {
            success: true,
            message: "Audit log retrieved successfully",
            data: auditLog,
        };
    }
    async getEntityAuditHistory(entityType, entityId) {
        const auditLogs = await prisma.userActivity.findMany({
            where: {
                entity_type: entityType,
                entity_id: entityId,
            },
            orderBy: { created_at: "desc" },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                    },
                },
                organisation: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        return {
            success: true,
            message: "Entity audit history retrieved successfully",
            data: auditLogs,
        };
    }
    async getUserAuditHistory(userId, filters = {}) {
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const skip = (page - 1) * limit;
        const where = { user_id: userId };
        if (filters.entityType) {
            where.entity_type = filters.entityType;
        }
        if (filters.action) {
            where.action = filters.action;
        }
        if (filters.startDate || filters.endDate) {
            where.created_at = {};
            if (filters.startDate) {
                where.created_at.gte = filters.startDate;
            }
            if (filters.endDate) {
                where.created_at.lte = filters.endDate;
            }
        }
        console.log("filters", filters);
        console.log("where", where);
        const [auditLogs, total] = await Promise.all([
            prisma.userActivity.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: "desc" },
                include: {
                    organisation: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            prisma.userActivity.count({ where }),
        ]);
        const totalPages = Math.ceil(total / limit);
        return {
            success: true,
            message: "User audit history retrieved successfully",
            data: {
                auditLogs,
                total,
                page,
                limit,
                totalPages,
            },
        };
    }
    async getAuditStats() {
        const [totalLogs, todayLogs, uniqueUsers, topActions] = await Promise.all([
            prisma.userActivity.count(),
            prisma.userActivity.count({
                where: {
                    created_at: {
                        gte: new Date(new Date().setHours(0, 0, 0, 0)),
                    },
                },
            }),
            prisma.userActivity.groupBy({
                by: ["user_id"],
                _count: true,
            }),
            prisma.userActivity.groupBy({
                by: ["action"],
                _count: true,
                orderBy: {
                    _count: {
                        action: "desc",
                    },
                },
                take: 5,
            }),
        ]);
        return {
            success: true,
            message: "Audit stats retrieved successfully",
            data: {
                totalLogs,
                todayLogs,
                uniqueUsers: uniqueUsers.length,
                topActions: topActions.map((action) => ({
                    action: action.action,
                    count: action._count,
                })),
            },
        };
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=audit.service.js.map