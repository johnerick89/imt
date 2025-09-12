import { UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.lib";
import {
  IUser,
  ICreateUserRequest,
  IUpdateUserRequest,
  IUserFilters,
  IUserStats,
  IUserResponse,
  IUsersListResponse,
} from "./users.interfaces";
import { hashPassword } from "../auth/auth.utils";

export class UsersService {
  async createUser(userData: ICreateUserRequest): Promise<IUserResponse> {
    try {
      // Check if user already exists
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

      // Hash password
      const hashedPassword = await hashPassword(userData.password);

      // Create user
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
          status: UserStatus.PENDING,
        },
      });

      return {
        success: true,
        message: "User created successfully",
        data: user,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      return {
        success: false,
        message: "Failed to create user",
        error: "INTERNAL_ERROR",
      };
    }
  }

  async getUsers(filters: IUserFilters): Promise<IUsersListResponse> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

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

      console.log("where", where);

      // Get users with pagination
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
    } catch (error) {
      console.error("Error getting users:", error);
      return {
        success: false,
        message: "Failed to retrieve users",
        error: "INTERNAL_ERROR",
      };
    }
  }

  async getUserById(userId: string): Promise<IUserResponse> {
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
          organisation: true,
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
    } catch (error) {
      console.error("Error getting user:", error);
      return {
        success: false,
        message: "Failed to retrieve user",
        error: "INTERNAL_ERROR",
      };
    }
  }

  async updateUser(
    userId: string,
    userData: IUpdateUserRequest
  ): Promise<IUserResponse> {
    try {
      // Check if user exists
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

      // Check if email is being updated and if it already exists
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

      // Update user
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
    } catch (error) {
      console.error("Error updating user:", error);
      return {
        success: false,
        message: "Failed to update user",
        error: "INTERNAL_ERROR",
      };
    }
  }

  async toggleUserStatus(
    userId: string,
    status: UserStatus
  ): Promise<IUserResponse> {
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
    } catch (error) {
      console.error("Error toggling user status:", error);
      return {
        success: false,
        message: "Failed to update user status",
        error: "INTERNAL_ERROR",
      };
    }
  }

  async deleteUser(userId: string): Promise<IUserResponse> {
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
    } catch (error) {
      console.error("Error deleting user:", error);
      return {
        success: false,
        message: "Failed to delete user",
        error: "INTERNAL_ERROR",
      };
    }
  }

  async getUserStats(): Promise<{
    success: boolean;
    message: string;
    data?: IUserStats;
    error?: string;
  }> {
    try {
      const [totalUsers, activeUsers, administrators] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
        prisma.user.count({ where: { role: "Admin" } }),
      ]);

      // For now, we'll use a placeholder for branches
      // In a real application, this would come from a branches table
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
    } catch (error) {
      console.error("Error getting user stats:", error);
      return {
        success: false,
        message: "Failed to retrieve user stats",
        error: "INTERNAL_ERROR",
      };
    }
  }
}
