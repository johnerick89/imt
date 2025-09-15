// Transaction Channel Types
export interface TransactionChannel {
  id: string;
  name: string;
  description: string;
  direction: string[];
  created_at: string;
  created_by: string | null;
  updated_at: string;
  created_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

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
