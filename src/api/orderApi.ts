import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("accessToken");
  return { Authorization: `Bearer ${token}` };
};

export interface OrderAdminData {
  _id: string;
  amount: number;
  status: string;
  created_at: string;
  paid_at?: string;
  student?: {
    name: string;
    email: string;
    avatar?: string;
  };
  course?: {
    title: string;
    slug: string;
  };
  saler?: {
    name: string;
    email: string;
  };
}

export interface OrdersResponse {
  data: OrderAdminData[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const orderApi = {
  getAdminOrders: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<OrdersResponse> => {
    const response = await axios.get(`${API_URL}/admin/orders`, {
      headers: getAuthHeader(),
      params,
    });
    return response.data;
  },
};
