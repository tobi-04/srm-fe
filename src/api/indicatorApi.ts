import apiClient from "./client";

export interface Indicator {
  _id: string;
  name: string;
  slug: string;
  description: string;
  cover_image: string;
  price_monthly: number;
  status: "ACTIVE" | "INACTIVE";
  // Contact info - only visible to subscribers
  owner_name?: string;
  contact_email?: string;
  contact_telegram?: string;
  description_detail?: string;
  has_subscription?: boolean;
  created_at: string;
}

export interface IndicatorSubscription {
  _id: string;
  indicator: {
    _id: string;
    name: string;
    slug: string;
    cover_image: string;
    contact_email?: string;
    contact_telegram?: string;
    owner_name?: string;
    description_detail?: string;
  };
  status: "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";
  start_at?: string;
  end_at?: string;
  auto_renew: boolean;
}

export interface CreateSubscriptionDto {
  indicator_id: string;
  name: string;
  email: string;
  phone?: string;
  auto_renew?: boolean;
}

export interface SubscriptionResponse {
  subscription_id: string;
  qr_code_url: string;
  transfer_code: string;
  amount: number;
  bank: {
    bank_name: string;
    acc_no: string;
    acc_name: string;
  };
  is_new_user: boolean;
  email: string;
}

export const indicatorApi = {
  // Public endpoints
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get("/indicators", { params }),
  getBySlug: (slug: string) => apiClient.get<Indicator>(`/indicators/${slug}`),
  subscribe: (data: CreateSubscriptionDto) =>
    apiClient.post<SubscriptionResponse>("/indicators/subscribe", data),
  getSubscriptionStatus: (id: string) =>
    apiClient.get(`/indicators/subscription-status/${id}`),
  cancelSubscription: (id: string) =>
    apiClient.delete(`/indicators/subscription/${id}`),
  getMySubscriptions: () =>
    apiClient.get<IndicatorSubscription[]>("/indicators/my-subscriptions"),

  // Admin endpoints
  adminGetAll: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/admin/indicators", { params }),
  adminGetById: (id: string) =>
    apiClient.get<Indicator>(`/admin/indicators/${id}`),
  adminCreate: (data: Partial<Indicator>) =>
    apiClient.post<Indicator>("/admin/indicators", data),
  adminUpdate: (id: string, data: Partial<Indicator>) =>
    apiClient.put<Indicator>(`/admin/indicators/${id}`, data),
  adminDelete: (id: string) => apiClient.delete(`/admin/indicators/${id}`),
  adminGetSubscriptions: (params?: { page?: number; limit?: number }) =>
    apiClient.get("/admin/indicators/subscriptions", { params }),
};
