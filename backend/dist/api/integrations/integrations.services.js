"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class IntegrationService {
    async createIntegration(data, userId) {
        try {
            const integration = await prisma.integration.create({
                data: {
                    ...data,
                    created_by: userId,
                },
                include: {
                    created_by_user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                        },
                    },
                    organisation: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        },
                    },
                },
            });
            return {
                success: true,
                message: "Integration created successfully",
                data: integration,
            };
        }
        catch (error) {
            console.error("Error creating integration:", error);
            throw new Error("Failed to create integration");
        }
    }
    async getIntegrations(filters) {
        try {
            const { page = 1, limit = 10, search, type, status, organisation_id, created_by, } = filters;
            const skip = (page - 1) * limit;
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ];
            }
            if (type)
                where.type = type;
            if (status)
                where.status = status;
            if (organisation_id)
                where.organisation_id = organisation_id;
            if (created_by)
                where.created_by = created_by;
            const [integrations, total] = await Promise.all([
                prisma.integration.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { created_at: "desc" },
                    include: {
                        created_by_user: {
                            select: {
                                id: true,
                                first_name: true,
                                last_name: true,
                                email: true,
                            },
                        },
                        organisation: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                            },
                        },
                    },
                }),
                prisma.integration.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "Integrations retrieved successfully",
                data: {
                    integrations: integrations,
                    pagination: {
                        page,
                        limit,
                        total,
                        totalPages,
                    },
                },
            };
        }
        catch (error) {
            console.error("Error fetching integrations:", error);
            throw new Error("Failed to fetch integrations");
        }
    }
    async getIntegrationById(id) {
        try {
            const integration = await prisma.integration.findUnique({
                where: { id },
                include: {
                    created_by_user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                        },
                    },
                    organisation: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        },
                    },
                },
            });
            if (!integration) {
                throw new Error("Integration not found");
            }
            return {
                success: true,
                message: "Integration retrieved successfully",
                data: integration,
            };
        }
        catch (error) {
            console.error("Error fetching integration:", error);
            throw new Error("Failed to fetch integration");
        }
    }
    async updateIntegration(id, data) {
        try {
            const integration = await prisma.integration.update({
                where: { id },
                data: {
                    ...data,
                    updated_at: new Date(),
                },
                include: {
                    created_by_user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                        },
                    },
                    organisation: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        },
                    },
                },
            });
            return {
                success: true,
                message: "Integration updated successfully",
                data: integration,
            };
        }
        catch (error) {
            console.error("Error updating integration:", error);
            throw new Error("Failed to update integration");
        }
    }
    async deleteIntegration(id) {
        try {
            await prisma.integration.delete({
                where: { id },
            });
            return {
                success: true,
                message: "Integration deleted successfully",
            };
        }
        catch (error) {
            console.error("Error deleting integration:", error);
            throw new Error("Failed to delete integration");
        }
    }
    async getIntegrationStats() {
        try {
            const [totalIntegrations, activeIntegrations, inactiveIntegrations, pendingIntegrations, blockedIntegrations,] = await Promise.all([
                prisma.integration.count(),
                prisma.integration.count({
                    where: { status: client_1.IntegrationStatus.ACTIVE },
                }),
                prisma.integration.count({
                    where: { status: client_1.IntegrationStatus.INACTIVE },
                }),
                prisma.integration.count({
                    where: { status: client_1.IntegrationStatus.PENDING },
                }),
                prisma.integration.count({
                    where: { status: client_1.IntegrationStatus.BLOCKED },
                }),
            ]);
            return {
                totalIntegrations,
                activeIntegrations,
                inactiveIntegrations,
                pendingIntegrations,
                blockedIntegrations,
            };
        }
        catch (error) {
            console.error("Error fetching integration stats:", error);
            throw new Error("Failed to fetch integration stats");
        }
    }
}
exports.IntegrationService = IntegrationService;
//# sourceMappingURL=integrations.services.js.map