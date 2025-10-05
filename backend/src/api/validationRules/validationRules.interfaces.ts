export interface IValidationRule {
  id: number;
  entity: string;
  config: Record<string, boolean>;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface ValidationRuleFilters {
  page?: number;
  limit?: number;
  search?: string;
  entity?: string;
}

export interface ValidationRuleListResponse {
  success: boolean;
  message: string;
  data: {
    validationRules: IValidationRule[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ValidationRuleResponse {
  success: boolean;
  message: string;
  data: IValidationRule;
}

export interface UpdateValidationRuleRequest {
  config: Record<string, boolean>;
}

export interface ValidationRuleStats {
  totalValidationRules: number;
  byEntity: Array<{
    entity: string;
    count: number;
  }>;
}

export interface ValidationRuleStatsResponse {
  success: boolean;
  message: string;
  data: ValidationRuleStats;
}
