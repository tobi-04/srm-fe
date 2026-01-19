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
};
