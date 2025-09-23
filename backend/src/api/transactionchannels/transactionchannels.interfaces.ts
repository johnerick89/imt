// Transaction Channel Interface
export interface ITransactionChannel {
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

// Transaction Channel Filters
export interface TransactionChannelFilters {
  page?: number;
  limit?: number;
  search?: string;
  direction?: string;
  created_by?: string;
}

// Transaction Channel List Response
export interface TransactionChannelListResponse {
  success: boolean;
  message: string;
  data: {
    channels: ITransactionChannel[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Transaction Channel Response
export interface TransactionChannelResponse {
  success: boolean;
  message: string;
  data: ITransactionChannel;
}

// Transaction Channel Stats
export interface TransactionChannelStats {
  totalChannels: number;
  byDirection: Array<{
    direction: string;
    count: number;
  }>;
}

// Transaction Channel Stats Response
export interface TransactionChannelStatsResponse {
  success: boolean;
  message: string;
  data: TransactionChannelStats;
}

// Create Transaction Channel Request
export interface CreateTransactionChannelRequest {
  name: string;
  description: string;
  direction: string[];
}

// Update Transaction Channel Request
export interface UpdateTransactionChannelRequest {
  name?: string;
  description?: string;
  direction?: string[];
}
