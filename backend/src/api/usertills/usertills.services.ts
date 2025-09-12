import { UserTillStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.lib";
import type {
  IUserTill,
  CreateUserTillRequest,
  UpdateUserTillRequest,
  UserTillFilters,
  UserTillListResponse,
  UserTillResponse,
  UserTillStatsResponse,
} from "./usertills.interfaces";

export class UserTillService {
  async createUserTill(data: CreateUserTillRequest): Promise<UserTillResponse> {
    try {
      const userTill = await prisma.userTill.create({
        data: {
          user_id: data.user_id,
          till_id: data.till_id,
          opening_balance: data.opening_balance || 0,
          closing_balance: data.closing_balance || 0,
          date: new Date(data.date || new Date()),
          status: data.status || UserTillStatus.OPEN,
        },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          till: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              location: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "User till created successfully",
        data: userTill as unknown as IUserTill,
      };
    } catch (error) {
      console.error("Error creating user till:", error);
      throw new Error("Failed to create user till");
    }
  }

  async getUserTills(filters: UserTillFilters): Promise<UserTillListResponse> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 10;
      const skip = (page - 1) * limit;

      const where: any = {};

      if (filters.search) {
        where.OR = [
          {
            user: {
              OR: [
                {
                  first_name: { contains: filters.search, mode: "insensitive" },
                },
                {
                  last_name: { contains: filters.search, mode: "insensitive" },
                },
                { email: { contains: filters.search, mode: "insensitive" } },
              ],
            },
          },
          {
            till: {
              name: { contains: filters.search, mode: "insensitive" },
            },
          },
        ];
      }

      if (filters.user_id) {
        where.user_id = filters.user_id;
      }

      if (filters.till_id) {
        where.till_id = filters.till_id;
      }

      if (filters.status) {
        where.status = filters.status;
      }

      const [userTills, total] = await Promise.all([
        prisma.userTill.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
              },
            },
            till: {
              select: {
                id: true,
                name: true,
                description: true,
                status: true,
                location: true,
              },
            },
          },
          skip,
          take: limit,
          orderBy: { date: "desc" },
        }),
        prisma.userTill.count({ where }),
      ]);

      return {
        success: true,
        message: "User tills retrieved successfully",
        data: {
          userTills: userTills as unknown as IUserTill[],
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      console.error("Error fetching user tills:", error);
      throw new Error("Failed to fetch user tills");
    }
  }

  async getUserTillById(id: string): Promise<UserTillResponse> {
    try {
      const userTill = await prisma.userTill.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          till: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              location: true,
            },
          },
        },
      });

      if (!userTill) {
        throw new Error("User till not found");
      }

      return {
        success: true,
        message: "User till retrieved successfully",
        data: userTill as unknown as IUserTill,
      };
    } catch (error) {
      console.error("Error fetching user till:", error);
      throw new Error("Failed to fetch user till");
    }
  }

  async updateUserTill(
    id: string,
    data: UpdateUserTillRequest
  ): Promise<UserTillResponse> {
    try {
      const updateData: any = {};
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof UpdateUserTillRequest];
        if (value !== undefined) {
          updateData[key] = value;
        }
      });

      const userTill = await prisma.userTill.update({
        where: { id },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          till: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              location: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "User till updated successfully",
        data: userTill as unknown as IUserTill,
      };
    } catch (error) {
      console.error("Error updating user till:", error);
      throw new Error("Failed to update user till");
    }
  }

  async deleteUserTill(
    id: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      await prisma.userTill.delete({
        where: { id },
      });

      return {
        success: true,
        message: "User till deleted successfully",
      };
    } catch (error) {
      console.error("Error deleting user till:", error);
      throw new Error("Failed to delete user till");
    }
  }

  async getUserTillStats(): Promise<UserTillStatsResponse> {
    try {
      const [totalUserTills, statusCounts, totalBalance] = await Promise.all([
        prisma.userTill.count(),
        prisma.userTill.groupBy({
          by: ["status"],
          _count: {
            status: true,
          },
        }),
        prisma.userTill.aggregate({
          _sum: {
            opening_balance: true,
            closing_balance: true,
          },
        }),
      ]);

      const stats = statusCounts.reduce(
        (acc, curr) => {
          switch (curr.status) {
            case UserTillStatus.OPEN:
              acc.openTills = curr._count.status;
              break;
            case UserTillStatus.CLOSED:
              acc.closedTills = curr._count.status;
              break;
            case UserTillStatus.BLOCKED:
              acc.blockedTills = curr._count.status;
              break;
          }
          return acc;
        },
        {
          openTills: 0,
          closedTills: 0,
          blockedTills: 0,
        }
      );

      return {
        success: true,
        message: "User till statistics retrieved successfully",
        data: {
          totalUserTills,
          ...stats,
          totalBalance:
            totalBalance._sum?.opening_balance?.toNumber() ||
            totalBalance._sum?.closing_balance?.toNumber() ||
            0,
        },
      };
    } catch (error) {
      console.error("Error fetching user till statistics:", error);
      throw new Error("Failed to fetch user till statistics");
    }
  }

  async closeUserTill(id: string): Promise<UserTillResponse> {
    try {
      const userTill = await prisma.userTill.update({
        where: { id },
        data: { status: UserTillStatus.CLOSED },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          till: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              location: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "User till closed successfully",
        data: userTill as unknown as IUserTill,
      };
    } catch (error) {
      console.error("Error closing user till:", error);
      throw new Error("Failed to close user till");
    }
  }

  async blockUserTill(id: string): Promise<UserTillResponse> {
    try {
      const userTill = await prisma.userTill.update({
        where: { id },
        data: { status: UserTillStatus.BLOCKED },
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          till: {
            select: {
              id: true,
              name: true,
              description: true,
              status: true,
              location: true,
            },
          },
        },
      });

      return {
        success: true,
        message: "User till blocked successfully",
        data: userTill as unknown as IUserTill,
      };
    } catch (error) {
      console.error("Error blocking user till:", error);
      throw new Error("Failed to block user till");
    }
  }
}

export default new UserTillService();
