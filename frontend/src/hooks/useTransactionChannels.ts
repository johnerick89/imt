import { useQuery } from "@tanstack/react-query";
import axios from "../services/AxiosBase";

interface TransactionChannel {
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

interface TransactionChannelFilters {
  page?: number;
  limit?: number;
  search?: string;
  direction?: string;
  created_by?: string;
}

interface TransactionChannelsResponse {
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

interface TransactionChannelResponse {
  success: boolean;
  message: string;
  data: TransactionChannel;
}

export const useTransactionChannels = (
  filters: TransactionChannelFilters = {}
) => {
  return useQuery({
    queryKey: ["transactionChannels", filters],
    queryFn: async (): Promise<TransactionChannelsResponse> => {
      const response = await axios.get("/api/v1/transactionchannels", {
        params: filters,
      });
      return response.data;
    },
  });
};

export const useTransactionChannelById = (id: string) => {
  return useQuery({
    queryKey: ["transactionChannel", id],
    queryFn: async (): Promise<TransactionChannelResponse> => {
      const response = await axios.get(`/api/v1/transactionchannels/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
};
