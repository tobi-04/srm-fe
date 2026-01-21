import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export interface DashboardSummary {
  revenue: {
    value: number;
    change: number;
    label: string;
  };
  students: {
    total: number;
    newThisWeek: number;
    change: number;
    label: string;
  };
  lessons: {
    total: number;
    status: string;
    label: string;
  };
  completion: {
    rate: number;
    change: number;
    label: string;
  };
}

export interface RevenueTrend {
  date: string;
  revenue: number;
}

export interface TrafficSourceStat {
  name: string;
  count: number;
  percent: number;
}

export interface RecentPayment {
  _id: string;
  user_submission_id: any;
  landing_page_id: any;
  total_amount: number;
  status: string;
  paid_at: string;
}

export const adminAnalyticsApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await axios.get(`${API_URL}/analytics/dashboard/summary`, {
      headers: getAuthHeader(),
    });
    return response.data;
  },

  getRevenueTrend: async (days: number = 30): Promise<RevenueTrend[]> => {
    const response = await axios.get(
      `${API_URL}/analytics/dashboard/revenue-trend`,
      {
        headers: getAuthHeader(),
        params: { days },
      },
    );
    return response.data;
  },

  getTrafficSources: async (): Promise<TrafficSourceStat[]> => {
    const response = await axios.get(
      `${API_URL}/analytics/dashboard/traffic-sources`,
      {
        headers: getAuthHeader(),
      },
    );
    return response.data;
  },

  getRecentPayments: async (): Promise<RecentPayment[]> => {
    const response = await axios.get(
      `${API_URL}/analytics/dashboard/recent-payments`,
      {
        headers: getAuthHeader(),
      },
    );
    return response.data;
  },

  getProgressSummary: async (): Promise<{
    avgCompletion: number;
    activeToday: number;
    completedToday: number;
    totalDurationHours: number;
  }> => {
    const response = await axios.get(
      `${API_URL}/analytics/student-progress/summary`,
      {
        headers: getAuthHeader(),
      },
    );
    return response.data;
  },

  getStudentProgress: async (params: {
    page: number;
    limit: number;
    search?: string;
    status?: string;
  }): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
  }> => {
    const response = await axios.get(`${API_URL}/analytics/student-progress`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },

  // Saler KPI Analytics
  getTopSalers: async (
    period: "month" | "quarter" | "year" = "month",
    limit: number = 3,
  ): Promise<TopSaler[]> => {
    const response = await axios.get(`${API_URL}/admin/saler-kpi/top`, {
      headers: getAuthHeader(),
      params: { period, limit },
    });
    return response.data;
  },

  getSalerKPIStatistics: async (
    period: "month" | "quarter" | "year" = "month",
  ): Promise<SalerKPIStatistics> => {
    const response = await axios.get(`${API_URL}/admin/saler-kpi/statistics`, {
      headers: getAuthHeader(),
      params: { period },
    });
    return response.data;
  },

  getSalerKPIChart: async (
    period: "month" | "quarter" | "year" = "month",
    months: number = 6,
  ): Promise<KPIChartData[]> => {
    const response = await axios.get(`${API_URL}/admin/saler-kpi/chart`, {
      headers: getAuthHeader(),
      params: { period, months },
    });
    return response.data;
  },

  getSalerDetails: async (
    salerId: string,
    period: "month" | "quarter" | "year" = "month",
  ): Promise<SalerDetailAnalytics | null> => {
    const response = await axios.get(
      `${API_URL}/admin/saler-kpi/${salerId}/details`,
      {
        headers: getAuthHeader(),
        params: { period },
      },
    );
    return response.data;
  },
};

// Additional types for saler KPI analytics
export interface TopSaler {
  saler_id: string;
  name: string;
  email: string;
  avatar: string | null;
  target_revenue: number;
  actual_revenue: number;
  total_orders: number;
  completion_percentage: number;
  exceeded_by: number;
}

export interface SalerKPIStatistics {
  total_salers: number;
  achieved_count: number;
  achieved_percentage: number;
  avg_completion: number;
}

export interface KPIChartData {
  period: string;
  label: string;
  achieved_count: number;
  total_salers: number;
}

export interface SalerDetailAnalytics {
  saler_id: string;
  name: string;
  email: string;
  avatar: string | null;
  target_revenue: number;
  actual_revenue: number;
  total_orders: number;
  completion_percentage: number;
  top_courses: {
    course_id: string;
    title: string;
    count: number;
    revenue: number;
  }[];
  period_type: string;
}
