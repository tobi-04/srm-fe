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
  course_id: any; // populated
  user_submission_id: any; // populated
  amount: number;
  status: "pending" | "paid" | "refund";
  paid_at?: string;
  created_at: string;
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
   */
  async getDashboard(): Promise<SalerDashboard> {
    const response = await apiClient.get<SalerDashboard>(
      "/saler/dashboard/overview",
    );
    return response.data;
  },

  /**
   * Get saler orders with pagination and filtering
   */
  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: "pending" | "paid" | "refund";
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
};

export default salerApi;
