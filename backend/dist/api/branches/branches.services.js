"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BranchService = void 0;
const database_1 = __importDefault(require("../../config/database"));
class BranchService {
    async createBranch(data, userId) {
        const branch = await database_1.default.branch.create({
            data: {
                ...data,
                created_by: userId,
            },
            include: {
                organisation: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                created_by_user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        users: true,
                        customers: true,
                    },
                },
            },
        });
        return {
            ...branch,
            users_count: branch._count.users,
            customers_count: branch._count.customers,
        };
    }
    async getBranches(filters = {}) {
        const { page = 1, limit = 10, search, organisation_id, city, state, country, created_by, } = filters;
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { address: { contains: search, mode: "insensitive" } },
                { city: { contains: search, mode: "insensitive" } },
                { state: { contains: search, mode: "insensitive" } },
                { country: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
            ];
        }
        if (organisation_id) {
            where.organisation_id = organisation_id;
        }
        if (city) {
            where.city = { contains: city, mode: "insensitive" };
        }
        if (state) {
            where.state = { contains: state, mode: "insensitive" };
        }
        if (country) {
            where.country = { contains: country, mode: "insensitive" };
        }
        if (created_by) {
            where.created_by = created_by;
        }
        const [branches, total] = await Promise.all([
            database_1.default.branch.findMany({
                where,
                skip,
                take: limit,
                include: {
                    organisation: {
                        select: {
                            id: true,
                            name: true,
                            type: true,
                        },
                    },
                    created_by_user: {
                        select: {
                            id: true,
                            first_name: true,
                            last_name: true,
                            email: true,
                        },
                    },
                    _count: {
                        select: {
                            users: true,
                            customers: true,
                        },
                    },
                },
                orderBy: {
                    created_at: "desc",
                },
            }),
            database_1.default.branch.count({ where }),
        ]);
        const branchesWithCounts = branches.map((branch) => ({
            ...branch,
            users_count: branch._count.users,
            customers_count: branch._count.customers,
        }));
        return {
            branches: branchesWithCounts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async getBranchById(id) {
        const branch = await database_1.default.branch.findUnique({
            where: { id },
            include: {
                organisation: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                created_by_user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        users: true,
                        customers: true,
                    },
                },
            },
        });
        if (!branch)
            return null;
        return {
            ...branch,
            users_count: branch._count.users,
            customers_count: branch._count.customers,
        };
    }
    async updateBranch(id, data) {
        const branch = await database_1.default.branch.update({
            where: { id },
            data,
            include: {
                organisation: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                    },
                },
                created_by_user: {
                    select: {
                        id: true,
                        first_name: true,
                        last_name: true,
                        email: true,
                    },
                },
                _count: {
                    select: {
                        users: true,
                        customers: true,
                    },
                },
            },
        });
        return {
            ...branch,
            users_count: branch._count.users,
            customers_count: branch._count.customers,
        };
    }
    async deleteBranch(id) {
        await database_1.default.branch.delete({
            where: { id },
        });
    }
    async getBranchStats() {
        const [totalBranches, branchesByCountry, branchesByCity, userCounts, customerCounts,] = await Promise.all([
            database_1.default.branch.count(),
            database_1.default.branch.groupBy({
                by: ["country"],
                _count: { id: true },
            }),
            database_1.default.branch.groupBy({
                by: ["city"],
                _count: { id: true },
            }),
            database_1.default.user.count({
                where: { branch_id: { not: null } },
            }),
            database_1.default.customer.count({
                where: { branch_id: { not: null } },
            }),
        ]);
        const countryStats = branchesByCountry.reduce((acc, item) => {
            acc[item.country] = item._count.id;
            return acc;
        }, {});
        const cityStats = branchesByCity.reduce((acc, item) => {
            acc[item.city] = item._count.id;
            return acc;
        }, {});
        return {
            totalBranches,
            branchesByCountry: countryStats,
            branchesByCity: cityStats,
            totalUsers: userCounts,
            totalCustomers: customerCounts,
        };
    }
}
exports.BranchService = BranchService;
//# sourceMappingURL=branches.services.js.map