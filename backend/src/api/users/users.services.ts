import { UserStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.lib";
import type { Prisma } from "@prisma/client";
import {
  IUser,
  ICreateUserRequest,
  IUpdateUserRequest,
  IUserFilters,
  IUserStats,
  IUserResponse,
  IUsersListResponse,
  IUserStatsFilters,
} from "./users.interfaces";
import { comparePassword, hashPassword } from "../auth/auth.utils";
import {
  AppError,
  InsufficientFundsError,
  NotFoundError,
  ValidationError,
} from "../../utils/AppError";

type Tx = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

export class UsersService {
  async createUser(
    userData: ICreateUserRequest,
    tx?: Tx
  ): Promise<IUserResponse> {
    const db = tx || prisma;

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new AppError("User with this email already exists", 400);
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user
    const user = await db.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        first_name: userData.first_name,
        last_name: userData.last_name,
        role: userData.role,
        role_id: userData.role_id,
        avatar: userData.avatar,
        phone: userData.phone,
        address: userData.address,
        organisation_id: userData.organisation_id,
        status: UserStatus.ACTIVE,
      },
    });

    return {
      success: true,
      message: "User created successfully",
      data: user,
    };
  }

  async getUsers(filters: IUserFilters): Promise<IUsersListResponse> {
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
          role_id: true,
          avatar: true,
          status: true,
          phone: true,
          address: true,
          organisation_id: true,
          last_login: true,
          created_at: true,
          updated_at: true,
          user_role: true,
          organisation: true,
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

  async getUserById(userId: string): Promise<IUserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        role: true,
        role_id: true,
        avatar: true,
        status: true,
        phone: true,
        address: true,
        organisation_id: true,
        last_login: true,
        created_at: true,
        updated_at: true,
        organisation: true,
        user_role: true,
      },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      success: true,
      message: "User retrieved successfully",
      data: user,
    };
  }

  async updateUser(
    userId: string,
    userData: IUpdateUserRequest
  ): Promise<IUserResponse> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundError("User not found");
    }

    // Check if email is being updated and if it already exists
    if (userData.email && userData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: userData.email },
      });

      if (emailExists) {
        throw new AppError("Email already exists", 400);
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
        user_role: true,
        organisation: true,
      },
    });

    return {
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    };
  }

  async toggleUserStatus(
    userId: string,
    status: UserStatus
  ): Promise<IUserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
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

  async deleteUser(userId: string): Promise<IUserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return {
      success: true,
      message: "User deleted successfully",
    };
  }

  async getUserStats(filters: IUserStatsFilters): Promise<{
    success: boolean;
    message: string;
    data?: IUserStats;
    error?: string;
  }> {
    const [totalUsers, activeUsers, administrators] = await Promise.all([
      prisma.user.count({
        where: { organisation_id: filters.organisation_id },
      }),
      prisma.user.count({
        where: {
          status: UserStatus.ACTIVE,
          organisation_id: filters.organisation_id,
        },
      }),
      prisma.user.count({
        where: { role: "Admin", organisation_id: filters.organisation_id },
      }),
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
  }

  async updatePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<IUserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (newPassword !== confirmPassword) {
      throw new AppError("Passwords do not match", 400);
    }

    if (newPassword === oldPassword) {
      throw new AppError(
        "New password cannot be the same as the old password",
        400
      );
    }

    const isPasswordValid = await comparePassword(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid old password", 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    const updatedUser = await this.getUserById(userId);

    return {
      success: true,
      message: "Password reset successfully",
      data: updatedUser as unknown as IUser,
    };
  }

  async resetPassword(
    userId: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<IUserResponse> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (newPassword !== confirmPassword) {
      throw new AppError("Passwords do not match", 400);
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    const updatedUser = await this.getUserById(userId);

    return {
      success: true,
      message: "Password reset successfully",
      data: updatedUser as unknown as IUser,
    };
  }
}
