"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BeneficiaryService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class BeneficiaryService {
    async createBeneficiary(data, userId) {
        try {
            const beneficiary = await prisma.beneficiary.create({
                data: {
                    ...data,
                    created_by: userId,
                },
                include: {
                    customer: {
                        select: {
                            id: true,
                            full_name: true,
                        },
                    },
                    organisation: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        },
                    },
                    nationality: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    residence_country: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    incorporation_country: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    occupation: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                    industry: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                },
            });
            return {
                success: true,
                message: "Beneficiary created successfully",
                data: beneficiary,
            };
        }
        catch (error) {
            console.error("Error creating beneficiary:", error);
            throw new Error("Failed to create beneficiary");
        }
    }
    async getBeneficiaries(filters) {
        try {
            const { page = 1, limit = 10, search, ...otherFilters } = filters;
            const skip = (page - 1) * limit;
            const where = { deleted_at: null };
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    {
                        customer: { full_name: { contains: search, mode: "insensitive" } },
                    },
                    { id_number: { contains: search, mode: "insensitive" } },
                    { tax_number: { contains: search, mode: "insensitive" } },
                    { reg_number: { contains: search, mode: "insensitive" } },
                ];
            }
            Object.keys(otherFilters).forEach((key) => {
                if (otherFilters[key] !== undefined) {
                    where[key] = otherFilters[key];
                }
            });
            const [beneficiaries, total] = await Promise.all([
                prisma.beneficiary.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { created_at: "desc" },
                    include: {
                        customer: {
                            select: {
                                id: true,
                                full_name: true,
                            },
                        },
                        organisation: {
                            select: {
                                id: true,
                                name: true,
                                type: true,
                            },
                        },
                        nationality: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                        residence_country: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                        incorporation_country: {
                            select: {
                                id: true,
                                name: true,
                                code: true,
                            },
                        },
                        occupation: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                        industry: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                            },
                        },
                    },
                }),
                prisma.beneficiary.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "Beneficiaries retrieved successfully",
                data: {
                    beneficiaries: beneficiaries,
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
            console.error("Error fetching beneficiaries:", error);
            throw new Error("Failed to fetch beneficiaries");
        }
    }
    async getBeneficiaryById(id) {
        try {
            const beneficiary = await prisma.beneficiary.findUnique({
                where: { id },
                include: {
                    customer: {
                        select: {
                            id: true,
                            full_name: true,
                        },
                    },
                    organisation: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        },
                    },
                    nationality: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    residence_country: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    incorporation_country: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    occupation: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                    industry: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                },
            });
            if (!beneficiary) {
                throw new Error("Beneficiary not found");
            }
            return {
                success: true,
                message: "Beneficiary retrieved successfully",
                data: beneficiary,
            };
        }
        catch (error) {
            console.error("Error fetching beneficiary:", error);
            throw new Error("Failed to fetch beneficiary");
        }
    }
    async updateBeneficiary(id, data) {
        try {
            const beneficiary = await prisma.beneficiary.update({
                where: { id },
                data,
                include: {
                    customer: {
                        select: {
                            id: true,
                            full_name: true,
                        },
                    },
                    organisation: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        },
                    },
                    nationality: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    residence_country: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    incorporation_country: {
                        select: {
                            id: true,
                            name: true,
                            code: true,
                        },
                    },
                    occupation: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                    industry: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                        },
                    },
                },
            });
            return {
                success: true,
                message: "Beneficiary updated successfully",
                data: beneficiary,
            };
        }
        catch (error) {
            console.error("Error updating beneficiary:", error);
            throw new Error("Failed to update beneficiary");
        }
    }
    async deleteBeneficiary(id) {
        try {
            await prisma.beneficiary.update({
                where: { id },
                data: {
                    deleted_at: new Date(),
                },
            });
            return {
                success: true,
                message: "Beneficiary deleted successfully",
            };
        }
        catch (error) {
            console.error("Error deleting beneficiary:", error);
            throw new Error("Failed to delete beneficiary");
        }
    }
    async getBeneficiaryStats() {
        try {
            const [total, individual, corporate, business] = await Promise.all([
                prisma.beneficiary.count({ where: { deleted_at: null } }),
                prisma.beneficiary.count({
                    where: { type: "INDIVIDUAL", deleted_at: null },
                }),
                prisma.beneficiary.count({
                    where: { type: "CORPORATE", deleted_at: null },
                }),
                prisma.beneficiary.count({
                    where: { type: "BUSINESS", deleted_at: null },
                }),
            ]);
            return {
                success: true,
                message: "Beneficiary stats retrieved successfully",
                data: {
                    totalBeneficiaries: total,
                    individualBeneficiaries: individual,
                    corporateBeneficiaries: corporate,
                    businessBeneficiaries: business,
                },
            };
        }
        catch (error) {
            console.error("Error fetching beneficiary stats:", error);
            throw new Error("Failed to fetch beneficiary stats");
        }
    }
}
exports.BeneficiaryService = BeneficiaryService;
//# sourceMappingURL=beneficiaries.services.js.map