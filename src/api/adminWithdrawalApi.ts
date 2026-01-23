import apiClient from "./client";

export interface WithdrawalConfig {
  _id: string;
  min_withdrawal_amount: number;
  fee_rate: number;
  is_active: boolean;
  withdrawal_start_day?: number;
  withdrawal_end_day?: number;
  updated_by?: string;
  updated_at?: string;
}

export interface WithdrawalRequest {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  fee_amount: number;
  net_amount: number;
  fee_rate: number;
  status: "pending" | "approved" | "rejected" | "completed";
  bank_account: {
    account_holder: string;
    account_number: string;
    bank_code: string;
    bank_name: string;
  };
  reject_reason?: string;
  processed_by?: string;
  processed_at?: string;
  created_at: string;
}

export interface WithdrawalStatistics {
  pending: number;
  approved: number;
  rejected: number;
  total_paid: number;
}

export interface WithdrawalRequestsResponse {
  data: WithdrawalRequest[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const adminWithdrawalApi = {
  /**
   * Get withdrawal configuration
   */
  async getConfig(): Promise<WithdrawalConfig> {
    const response = await apiClient.get<WithdrawalConfig>(
      "/admin/withdrawals/config",
    );
    return response.data;
  },

  /**
   * Update withdrawal configuration
   */
  async updateConfig(data: {
    min_withdrawal_amount?: number;
    fee_rate?: number;
    is_active?: boolean;
    withdrawal_start_day?: number;
    withdrawal_end_day?: number;
  }): Promise<WithdrawalConfig> {
    const response = await apiClient.put<WithdrawalConfig>(
      "/admin/withdrawals/config",
      data,
    );
    return response.data;
  },

  /**
   * Get withdrawal statistics
   */
  async getStatistics(): Promise<WithdrawalStatistics> {
    const response = await apiClient.get<WithdrawalStatistics>(
      "/admin/withdrawals/statistics",
    );
    return response.data;
  },

  /**
   * Get all withdrawal requests
   */
  async getRequests(params: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<WithdrawalRequestsResponse> {
    const response = await apiClient.get<WithdrawalRequestsResponse>(
      "/admin/withdrawals",
      { params },
    );
    return response.data;
  },

  /**
   * Process withdrawal request (approve/reject)
   */
  async processRequest(
    id: string,
    data: {
      status: "approved" | "rejected";
      reject_reason?: string;
    },
  ): Promise<WithdrawalRequest> {
    const response = await apiClient.put<WithdrawalRequest>(
      `/admin/withdrawals/${id}/process`,
      data,
    );
    return response.data;
  },
};

export default adminWithdrawalApi;
