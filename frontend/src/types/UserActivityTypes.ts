export interface UserActivity {
  id: string;
  user_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  data?: any;
  organisation_id?: string | null;
  changes?: any;
  ip_address?: string | null;
  request_id?: string | null;
  metadata?: any;
  created_at: string;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  } | null;
  organisation?: {
    id: string;
    name: string;
  } | null;
}

export interface UserActivityFilters {
  userId?: string;
  entityType?: string;
  entityId?: string;
  action?: string;
  organisationId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface UserActivityListResponse {
  success: boolean;
  message: string;
  data?: {
    auditLogs: UserActivity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

export interface UserActivityResponse {
  success: boolean;
  message: string;
  data?: UserActivity;
  error?: string;
}

export interface UserActivityStats {
  totalLogs: number;
  todayLogs: number;
  uniqueUsers: number;
  topActions: Array<{
    action: string;
    count: number;
  }>;
}

export interface UserActivityStatsResponse {
  success: boolean;
  message: string;
  data?: UserActivityStats;
  error?: string;
}
