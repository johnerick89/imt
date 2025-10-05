import apiClient from "./AxiosBase";
import type {
  ValidationRuleFilters,
  ValidationRuleListResponse,
  ValidationRuleResponse,
  UpdateValidationRuleRequest,
  ValidationRuleStatsResponse,
} from "../types/ValidationRulesTypes";

export class ValidationRulesService {
  // Get all validation rules
  static async getValidationRules(
    filters: ValidationRuleFilters = {}
  ): Promise<ValidationRuleListResponse> {
    const response = await apiClient.get("/api/v1/validationrules", {
      params: filters,
    });
    return response.data;
  }

  // Get validation rule by ID
  static async getValidationRuleById(
    id: number
  ): Promise<ValidationRuleResponse> {
    const response = await apiClient.get(`/api/v1/validationrules/${id}`);
    return response.data;
  }

  // Get validation rule by entity
  static async getValidationRuleByEntity(
    entity: string
  ): Promise<ValidationRuleResponse> {
    const response = await apiClient.get(
      `/api/v1/validationrules/entity/${entity}`
    );
    return response.data;
  }

  // Update validation rule
  static async updateValidationRule(
    id: number,
    data: UpdateValidationRuleRequest
  ): Promise<ValidationRuleResponse> {
    const response = await apiClient.put(`/api/v1/validationrules/${id}`, data);
    return response.data;
  }

  // Get validation rule stats
  static async getValidationRuleStats(): Promise<ValidationRuleStatsResponse> {
    const response = await apiClient.get(
      "/api/v1/validationrules/stats/overview"
    );
    return response.data;
  }
}

export default ValidationRulesService;
