"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OccupationService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class OccupationService {
    async createOccupation(data, userId) {
        try {
            const occupation = await prisma.occupation.create({
                data: {
                    ...data,
                },
            });
            return {
                success: true,
                message: "Occupation created successfully",
                data: occupation,
            };
        }
        catch (error) {
            console.error("Error creating occupation:", error);
            throw new Error("Failed to create occupation");
        }
    }
    async getOccupations(filters) {
        try {
            const { page = 1, limit = 10, search } = filters;
            const skip = (page - 1) * limit;
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ];
            }
            const [occupations, total] = await Promise.all([
                prisma.occupation.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { created_at: "desc" },
                }),
                prisma.occupation.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "Occupations retrieved successfully",
                data: {
                    occupations: occupations,
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
            console.error("Error fetching occupations:", error);
            throw new Error("Failed to fetch occupations");
        }
    }
    async getOccupationById(id) {
        try {
            const occupation = await prisma.occupation.findUnique({
                where: { id },
            });
            if (!occupation) {
                throw new Error("Occupation not found");
            }
            return {
                success: true,
                message: "Occupation retrieved successfully",
                data: occupation,
            };
        }
        catch (error) {
            console.error("Error fetching occupation:", error);
            throw new Error("Failed to fetch occupation");
        }
    }
    async updateOccupation(id, data) {
        try {
            const occupation = await prisma.occupation.update({
                where: { id },
                data,
            });
            return {
                success: true,
                message: "Occupation updated successfully",
                data: occupation,
            };
        }
        catch (error) {
            console.error("Error updating occupation:", error);
            throw new Error("Failed to update occupation");
        }
    }
    async deleteOccupation(id) {
        try {
            await prisma.occupation.delete({
                where: { id },
            });
            return {
                success: true,
                message: "Occupation deleted successfully",
            };
        }
        catch (error) {
            console.error("Error deleting occupation:", error);
            throw new Error("Failed to delete occupation");
        }
    }
    async getOccupationStats() {
        try {
            const total = await prisma.occupation.count();
            return {
                success: true,
                message: "Occupation stats retrieved successfully",
                data: {
                    totalOccupations: total,
                },
            };
        }
        catch (error) {
            console.error("Error fetching occupation stats:", error);
            throw new Error("Failed to fetch occupation stats");
        }
    }
}
exports.OccupationService = OccupationService;
//# sourceMappingURL=occupations.services.js.map