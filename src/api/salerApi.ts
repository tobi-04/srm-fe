import apiClient from "./client";

// Types
export interface SalerDashboard {
  orders_today: number;
  orders_month: number;
  total_revenue: number;
  total_commission: number;
  kpi_completion: number;
  chart_data: { date: string; revenue: number }[];
}

export interface SalerCourse {
  _id: string;
  title: string;
  slug: string;
  price: number;
  commission_rate: number;
  referral_link: string;
  referral_code: string;
}

export interface SalerCoursesResponse {
  data: SalerCourse[];
}

export interface SalerOrder {
  _id: string;
  submission_id: string;
  student_name: string;
  student_email: string;
  student_phone?: string;
  course: {
    _id: string;
    title: string;
    slug: string;
    price: number;
  } | null;
  landing_page: {
    _id: string;
    title: string;
  };
  amount: number | null;
  status: "pending" | "paid";
  paid_at?: string;
  created_at: string;
  referral_code?: string;
}

export interface SalerOrdersResponse {
  data: SalerOrder[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SalerCommission {
  _id: string;
  order_id: any;
  course_id: any;
  order_amount: number;
  commission_rate: number;
  commission_amount: number;
  status: "pending" | "available" | "paid";
  paid_at?: string;
  created_at: string;
}

export interface SalerCommissionsResponse {
  data: SalerCommission[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CommissionSummary {
  pending: { total: number; count: number };
  available: { total: number; count: number };
  paid: { total: number; count: number };
}

const salerApi = {
  /**
   * Get saler dashboard overview
   * @param days - Number of days for chart data (default: 7)
   */
  async getDashboard(days: number = 7): Promise<SalerDashboard> {
    const response = await apiClient.get<SalerDashboard>(
      "/saler/dashboard/overview",
      { params: { days } },
    );
    return response.data;
  },

  /**
   * Get saler orders with pagination and filtering
   */
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: "pending" | "paid";
  }): Promise<SalerOrdersResponse> {
    const response = await apiClient.get<SalerOrdersResponse>("/saler/orders", {
      params,
    });
    return response.data;
  },

  /**
   * Get assigned courses with referral links
   */
  async getCourses(): Promise<SalerCoursesResponse> {
    const response =
      await apiClient.get<SalerCoursesResponse>("/saler/courses");
    return response.data;
  },

  /**
   * Get commissions with pagination
   */
  async getCommissions(params: {
    page?: number;
    limit?: number;
    status?: "pending" | "available" | "paid";
  }): Promise<SalerCommissionsResponse> {
    const response = await apiClient.get<SalerCommissionsResponse>(
      "/saler/commissions",
      { params },
    );
    return response.data;
  },

  /**
   * Get commission summary
   */
  async getCommissionSummary(): Promise<CommissionSummary> {
    const response = await apiClient.get<CommissionSummary>(
      "/saler/commissions/summary",
    );
    return response.data;
  },

  /**
   * Get saler KPI
   */
  async getKPI(period?: string): Promise<any> {
    const response = await apiClient.get<any>("/saler/kpi", {
      params: { period },
    });
    return response.data;
  },

  /**
   * Get students referred by saler
   */
  async getStudents(params: { search?: string }): Promise<{ data: any[] }> {
    const response = await apiClient.get<{ data: any[] }>("/saler/students", {
      params,
    });
    return response.data;
  },

  /**
   * Get saler bank account information
   */
  async getBankAccount(): Promise<{ bank_account: BankAccount | null }> {
    const response = await apiClient.get<{ bank_account: BankAccount | null }>(
      "/saler/bank-account",
    );
    return response.data;
  },

  /**
   * Update saler bank account information
   */
  async updateBankAccount(data: BankAccount): Promise<{
    message: string;
    bank_account: BankAccount;
  }> {
    const response = await apiClient.put<{
      message: string;
      bank_account: BankAccount;
    }>("/saler/bank-account", data);
    return response.data;
  },
};

export interface BankAccount {
  account_holder: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
}

export interface WithdrawalConfig {
  min_withdrawal_amount: number;
  fee_rate: number;
  is_active: boolean;
}

export interface WithdrawalRequest {
  _id: string;
  user_id: string;
  amount: number;
  fee_amount: number;
  net_amount: number;
  fee_rate: number;
  status: "pending" | "approved" | "rejected" | "completed";
  bank_account: BankAccount;
  reject_reason?: string;
  processed_at?: string;
  created_at: string;
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

// Additional withdrawal API functions
export const withdrawalApi = {
  /**
   * Get withdrawal config
   */
  async getConfig(): Promise<WithdrawalConfig> {
    const response = await apiClient.get<WithdrawalConfig>(
      "/saler/withdrawals/config",
    );
    return response.data;
  },

  /**
   * Create withdrawal request
   */
  async createRequest(amount: number): Promise<WithdrawalRequest> {
    const response = await apiClient.post<WithdrawalRequest>(
      "/saler/withdrawals",
      { amount },
    );
    return response.data;
  },

  /**
   * Get my withdrawal requests
   */
  async getMyRequests(
    page: number = 1,
    limit: number = 10,
  ): Promise<WithdrawalRequestsResponse> {
    const response = await apiClient.get<WithdrawalRequestsResponse>(
      "/saler/withdrawals",
      { params: { page, limit } },
    );
    return response.data;
  },
};

export default salerApi;
