import type { User } from "./UsersTypes";

// Transaction Channel Types
export interface ITransactionChannel {
  id: string;
  name: string;
  description: string;
  direction: string[];
  created_at: string;
  created_by: string | null;
  updated_at: string;
  created_by_user?: User | null;
}

// Alias for backward compatibility
export type TransactionChannel = ITransactionChannel;

export interface TransactionChannelFilters {
  page?: number;
  limit?: number;
  search?: string;
  direction?: string;
  created_by?: string;
}

export interface TransactionChannelsResponse {
  success: boolean;
  message: string;
  data: {
    channels: TransactionChannel[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface TransactionChannelResponse {
  success: boolean;
  message: string;
  data: TransactionChannel;
}

export interface CreateTransactionChannelRequest {
  name: string;
  description: string;
  direction: string[];
}

export interface UpdateTransactionChannelRequest {
  name?: string;
  description?: string;
  direction?: string[];
}
