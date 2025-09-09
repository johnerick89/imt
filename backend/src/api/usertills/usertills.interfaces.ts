import { UserTillStatus, User, Till } from "@prisma/client";

export interface IUserTill {
  id: string;
  user_id: string;
  user: User;
  till_id: string;
  till: Till;
  opening_balance: number;
  closing_balance?: number;
  date: Date;
  status: UserTillStatus;
  created_at?: Date;
  updated_at?: Date;
  net_transactions_total?: number;
}

export interface CreateUserTillRequest {
  user_id: string;
  till_id: string;
  opening_balance: number;
  closing_balance?: number;
  date?: string;
  status?: UserTillStatus;
}

export interface UpdateUserTillRequest {
  user_id?: string;
  till_id?: string;
  opening_balance?: number;
  closing_balance?: number;
  date?: string;
  status?: UserTillStatus;
}

export interface UserTillFilters {
  page?: number;
  limit?: number;
  search?: string;
  user_id?: string;
  till_id?: string;
  status?: UserTillStatus;
}

export interface UserTillListResponse {
  success: boolean;
  message: string;
  data: {
    userTills: IUserTill[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  error?: string;
}

export interface UserTillResponse {
  success: boolean;
  message: string;
  data: IUserTill;
  error?: string;
}

export interface UserTillStatsResponse {
  success: boolean;
  message: string;
  data: {
    totalUserTills: number;
    openTills: number;
    closedTills: number;
    blockedTills: number;
    totalBalance: number;
  };
  error?: string;
}
