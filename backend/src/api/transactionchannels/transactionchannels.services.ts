import { prisma } from "../../lib/prisma.lib";
import type {
  ITransactionChannel,
  TransactionChannelFilters,
  TransactionChannelListResponse,
  TransactionChannelResponse,
  TransactionChannelStats,
  TransactionChannelStatsResponse,
  CreateTransactionChannelRequest,
  UpdateTransactionChannelRequest,
} from "./transactionchannels.interfaces";

export class TransactionChannelService {
  // Get Transaction Channels
  async getTransactionChannels(
    filters: TransactionChannelFilters
  ): Promise<TransactionChannelListResponse> {
    try {
      const { page = 1, limit = 10, search, direction, created_by } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ];
      }

      if (direction) {
        where.direction = { has: direction };
      }

      if (created_by) {
        where.created_by = created_by;
      }

      // Get total count
      const total = await prisma.transactionChannel.count({ where });

      // Get channels
      const channels = await prisma.transactionChannel.findMany({
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
          origin_transactions: {
            select: {
              id: true,
              transaction_no: true,
              origin_amount: true,
              created_at: true,
              status: true,
            },
          },
          destination_transactions: {
            select: {
              id: true,
              transaction_no: true,
              origin_amount: true,
              created_at: true,
              status: true,
            },
          },
        },
      });

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Transaction channels retrieved successfully",
        data: {
          channels: channels.map((channel) => ({
            ...channel,
            created_at: channel.created_at.toISOString(),
            updated_at: channel.updated_at.toISOString(),
          })) as ITransactionChannel[],
          pagination: {
            page,
            limit,
            total,
            totalPages,
          },
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to retrieve transaction channels",
        data: {
          channels: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          },
        },
      };
    }
  }

  // Get Transaction Channel by ID
  async getTransactionChannelById(
    id: string
  ): Promise<TransactionChannelResponse> {
    try {
      const channel = await prisma.transactionChannel.findUnique({
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
          origin_transactions: true,
          destination_transactions: true,
        },
      });

      if (!channel) {
        return {
          success: false,
          message: "Transaction channel not found",
          data: {} as ITransactionChannel,
        };
      }

      return {
        success: true,
        message: "Transaction channel retrieved successfully",
        data: {
          ...channel,
          created_at: channel.created_at.toISOString(),
          updated_at: channel.updated_at.toISOString(),
        } as ITransactionChannel,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to retrieve transaction channel",
        data: {} as ITransactionChannel,
      };
    }
  }

  // Get Transaction Channel Stats
  async getTransactionChannelStats(): Promise<TransactionChannelStatsResponse> {
    try {
      const totalChannels = await prisma.transactionChannel.count();

      // Get channels by direction
      const channels = await prisma.transactionChannel.findMany({
        select: { direction: true },
      });

      const directionMap = new Map<string, number>();
      channels.forEach((channel) => {
        channel.direction.forEach((dir) => {
          directionMap.set(dir, (directionMap.get(dir) || 0) + 1);
        });
      });

      const byDirection = Array.from(directionMap.entries()).map(
        ([direction, count]) => ({ direction, count })
      );

      return {
        success: true,
        message: "Transaction channel stats retrieved successfully",
        data: {
          totalChannels,
          byDirection,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.message || "Failed to retrieve transaction channel stats",
        data: {
          totalChannels: 0,
          byDirection: [],
        },
      };
    }
  }

  // Create Transaction Channel
  async createTransactionChannel(
    data: CreateTransactionChannelRequest,
    userId: string
  ): Promise<TransactionChannelResponse> {
    try {
      // Check if channel with same name already exists
      const existingChannel = await prisma.transactionChannel.findFirst({
        where: { name: data.name },
      });

      if (existingChannel) {
        return {
          success: false,
          message: "Transaction channel with this name already exists",
          data: {} as ITransactionChannel,
        };
      }

      const channel = await prisma.transactionChannel.create({
        data: {
          name: data.name,
          description: data.description,
          direction: data.direction,
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
        },
      });

      return {
        success: true,
        message: "Transaction channel created successfully",
        data: {
          ...channel,
          created_at: channel.created_at.toISOString(),
          updated_at: channel.updated_at.toISOString(),
        } as ITransactionChannel,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to create transaction channel",
        data: {} as ITransactionChannel,
      };
    }
  }

  // Update Transaction Channel
  async updateTransactionChannel(
    id: string,
    data: UpdateTransactionChannelRequest
  ): Promise<TransactionChannelResponse> {
    try {
      // Check if channel exists
      const existingChannel = await prisma.transactionChannel.findUnique({
        where: { id },
      });

      if (!existingChannel) {
        return {
          success: false,
          message: "Transaction channel not found",
          data: {} as ITransactionChannel,
        };
      }

      // Check if name is being updated and if it conflicts
      if (data.name && data.name !== existingChannel.name) {
        const nameConflict = await prisma.transactionChannel.findFirst({
          where: {
            name: data.name,
            id: { not: id },
          },
        });

        if (nameConflict) {
          return {
            success: false,
            message: "Transaction channel with this name already exists",
            data: {} as ITransactionChannel,
          };
        }
      }

      const channel = await prisma.transactionChannel.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
          ...(data.description && { description: data.description }),
          ...(data.direction && { direction: data.direction }),
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
        },
      });

      return {
        success: true,
        message: "Transaction channel updated successfully",
        data: {
          ...channel,
          created_at: channel.created_at.toISOString(),
          updated_at: channel.updated_at.toISOString(),
        } as ITransactionChannel,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to update transaction channel",
        data: {} as ITransactionChannel,
      };
    }
  }

  // Delete Transaction Channel
  async deleteTransactionChannel(
    id: string
  ): Promise<TransactionChannelResponse> {
    try {
      // Check if channel exists
      const existingChannel = await prisma.transactionChannel.findUnique({
        where: { id },
        include: {
          origin_transactions: { take: 1 },
          destination_transactions: { take: 1 },
        },
      });

      if (!existingChannel) {
        return {
          success: false,
          message: "Transaction channel not found",
          data: {} as ITransactionChannel,
        };
      }

      // Check if channel is being used in transactions
      if (
        existingChannel.origin_transactions.length > 0 ||
        existingChannel.destination_transactions.length > 0
      ) {
        return {
          success: false,
          message:
            "Cannot delete transaction channel that is being used in transactions",
          data: {} as ITransactionChannel,
        };
      }

      const channel = await prisma.transactionChannel.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Transaction channel deleted successfully",
        data: {
          ...channel,
          created_at: channel.created_at.toISOString(),
          updated_at: channel.updated_at.toISOString(),
        } as ITransactionChannel,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to delete transaction channel",
        data: {} as ITransactionChannel,
      };
    }
  }
}

export const transactionChannelService = new TransactionChannelService();
