"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const client_1 = require("@prisma/client");
const auth_utils_1 = require("../auth/auth.utils");
const prisma = new client_1.PrismaClient();
class UsersService {
    async createUser(userData) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { email: userData.email },
            });
            if (existingUser) {
                return {
                    success: false,
                    message: "User with this email already exists",
                    error: "EMAIL_EXISTS",
                };
            }
            const hashedPassword = await (0, auth_utils_1.hashPassword)(userData.password);
            const user = await prisma.user.create({
                data: {
                    email: userData.email,
                    password: hashedPassword,
                    first_name: userData.first_name,
                    last_name: userData.last_name,
                    role: userData.role,
                    avatar: userData.avatar,
                    phone: userData.phone,
                    address: userData.address,
                    organisation_id: userData.organisation_id,
                    status: client_1.UserStatus.PENDING,
                },
            });
            return {
                success: true,
                message: "User created successfully",
                data: user,
            };
        }
        catch (error) {
            console.error("Error creating user:", error);
            return {
                success: false,
                message: "Failed to create user",
                error: "INTERNAL_ERROR",
            };
        }
    }
    async getUsers(filters) {
        try {
            const page = filters.page || 1;
            const limit = filters.limit || 10;
            const skip = (page - 1) * limit;
            const where = {};
            if (filters.search) {
                where.OR = [
                    { first_name: { contains: filters.search, mode: "insensitive" } },
                    { last_name: { contains: filters.search, mode: "insensitive" } },
                    { email: { contains: filters.search, mode: "insensitive" } },
                ];
            }
            if (filters.role) {
                where.role = filters.role;
            }
            if (filters.status) {
                where.status = filters.status;
            }
            if (filters.organisation_id) {
                where.organisation_id = filters.organisation_id;
            }
            const [users, total] = await Promise.all([
                prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { created_at: "desc" },
                    select: {
                        id: true,
                        email: true,
                        first_name: true,
                        last_name: true,
                        role: true,
                        avatar: true,
                        status: true,
                        phone: true,
                        address: true,
                        organisation_id: true,
                        last_login: true,
                        created_at: true,
                        updated_at: true,
                    },
                }),
                prisma.user.count({ where }),
            ]);
            const totalPages = Math.ceil(total / limit);
            return {
                success: true,
                message: "Users retrieved successfully",
                data: {
                    users,
                    total,
                    page,
                    limit,
                    totalPages,
                },
            };
        }
        catch (error) {
            console.error("Error getting users:", error);
            return {
                success: false,
                message: "Failed to retrieve users",
                error: "INTERNAL_ERROR",
            };
        }
    }
    async getUserById(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    role: true,
                    avatar: true,
                    status: true,
                    phone: true,
                    address: true,
                    organisation_id: true,
                    last_login: true,
                    created_at: true,
                    updated_at: true,
                },
            });
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    error: "USER_NOT_FOUND",
                };
            }
            return {
                success: true,
                message: "User retrieved successfully",
                data: user,
            };
        }
        catch (error) {
            console.error("Error getting user:", error);
            return {
                success: false,
                message: "Failed to retrieve user",
                error: "INTERNAL_ERROR",
            };
        }
    }
    async updateUser(userId, userData) {
        try {
            const existingUser = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!existingUser) {
                return {
                    success: false,
                    message: "User not found",
                    error: "USER_NOT_FOUND",
                };
            }
            if (userData.email && userData.email !== existingUser.email) {
                const emailExists = await prisma.user.findUnique({
                    where: { email: userData.email },
                });
                if (emailExists) {
                    return {
                        success: false,
                        message: "Email already exists",
                        error: "EMAIL_EXISTS",
                    };
                }
            }
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: userData,
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    role: true,
                    avatar: true,
                    status: true,
                    phone: true,
                    address: true,
                    organisation_id: true,
                    last_login: true,
                    created_at: true,
                    updated_at: true,
                },
            });
            return {
                success: true,
                message: "User updated successfully",
                data: updatedUser,
            };
        }
        catch (error) {
            console.error("Error updating user:", error);
            return {
                success: false,
                message: "Failed to update user",
                error: "INTERNAL_ERROR",
            };
        }
    }
    async toggleUserStatus(userId, status) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    error: "USER_NOT_FOUND",
                };
            }
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { status },
                select: {
                    id: true,
                    email: true,
                    first_name: true,
                    last_name: true,
                    role: true,
                    avatar: true,
                    status: true,
                    phone: true,
                    address: true,
                    organisation_id: true,
                    last_login: true,
                    created_at: true,
                    updated_at: true,
                },
            });
            return {
                success: true,
                message: `User status updated to ${status.toLowerCase()}`,
                data: updatedUser,
            };
        }
        catch (error) {
            console.error("Error toggling user status:", error);
            return {
                success: false,
                message: "Failed to update user status",
                error: "INTERNAL_ERROR",
            };
        }
    }
    async deleteUser(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
            });
            if (!user) {
                return {
                    success: false,
                    message: "User not found",
                    error: "USER_NOT_FOUND",
                };
            }
            await prisma.user.delete({
                where: { id: userId },
            });
            return {
                success: true,
                message: "User deleted successfully",
            };
        }
        catch (error) {
            console.error("Error deleting user:", error);
            return {
                success: false,
                message: "Failed to delete user",
                error: "INTERNAL_ERROR",
            };
        }
    }
    async getUserStats() {
        try {
            const [totalUsers, activeUsers, administrators] = await Promise.all([
                prisma.user.count(),
                prisma.user.count({ where: { status: client_1.UserStatus.ACTIVE } }),
                prisma.user.count({ where: { role: "Admin" } }),
            ]);
            const branches = 9;
            return {
                success: true,
                message: "User stats retrieved successfully",
                data: {
                    totalUsers,
                    activeUsers,
                    administrators,
                    branches,
                },
            };
        }
        catch (error) {
            console.error("Error getting user stats:", error);
            return {
                success: false,
                message: "Failed to retrieve user stats",
                error: "INTERNAL_ERROR",
            };
        }
    }
}
exports.UsersService = UsersService;
//# sourceMappingURL=users.services.js.map