import apiClient from "./AxiosBase";
import type {
  TransactionChannelFilters,
  TransactionChannelsResponse,
  TransactionChannelResponse,
  CreateTransactionChannelRequest,
  UpdateTransactionChannelRequest,
} from "../types/TransactionChannelsTypes";

export class TransactionChannelsService {
  // Get all transaction channels
  async getTransactionChannels(
    filters: TransactionChannelFilters = {}
  ): Promise<TransactionChannelsResponse> {
    const params = new URLSearchParams();

    if (filters.page) params.append("page", filters.page.toString());
    if (filters.limit) params.append("limit", filters.limit.toString());
    if (filters.search) params.append("search", filters.search);
    if (filters.direction) params.append("direction", filters.direction);
    if (filters.created_by) params.append("created_by", filters.created_by);

    const queryString = params.toString();
    const url = `/api/v1/transactionchannels${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await apiClient.get(url);
    return response.data;
  }

  // Get transaction channel by ID
  async getTransactionChannelById(
    id: string
  ): Promise<TransactionChannelResponse> {
    const response = await apiClient.get(`/api/v1/transactionchannels/${id}`);
    return response.data;
  }

  // Create transaction channel
  async createTransactionChannel(
    data: CreateTransactionChannelRequest
  ): Promise<TransactionChannelResponse> {
    const response = await apiClient.post("/api/v1/transactionchannels", data);
    return response.data;
  }

  // Update transaction channel
  async updateTransactionChannel(
    id: string,
    data: UpdateTransactionChannelRequest
  ): Promise<TransactionChannelResponse> {
    const response = await apiClient.put(
      `/api/v1/transactionchannels/${id}`,
      data
    );
    return response.data;
  }

  // Delete transaction channel
  async deleteTransactionChannel(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiClient.delete(
      `/api/v1/transactionchannels/${id}`
    );
    return response.data;
  }
}

export default new TransactionChannelsService();
