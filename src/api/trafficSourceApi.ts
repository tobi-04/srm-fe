import apiClient from "./client";

export interface CreateTrafficSourceDto {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  landing_page: string;
  referrer?: string;
  session_id: string;
  ip_address?: string;
  user_agent?: string;
}

export interface TrafficSource {
  _id: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  landing_page: string;
  referrer: string;
  first_visit_at: string;
  session_id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface CreateSessionDto {
  session_id: string;
  traffic_source_id?: string;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
}

export interface Session {
  _id: string;
  session_id: string;
  traffic_source_id?: string;
  user_id?: string;
  ip_address: string;
  user_agent: string;
  pages_visited: Array<{
    url: string;
    visited_at: string;
    time_spent: number;
  }>;
  session_start: string;
  session_end?: string;
  total_duration: number;
  is_converted: boolean;
  created_at: string;
}

export interface AnalyticsBySource {
  utm_source: string;
  count: number;
  unique_campaigns: number;
}

export interface AnalyticsByCampaign {
  utm_campaign: string;
  utm_source: string;
  count: number;
}

export interface FunnelStats {
  total_traffic_sources: number;
}

export const trafficSourceApi = {
  /**
   * Create or get existing traffic source
   */
  async create(data: CreateTrafficSourceDto): Promise<TrafficSource> {
    const response = await apiClient.post("/traffic-sources", data);
    return response.data;
  },

  /**
   * Get traffic source by ID
   */
  async getById(id: string): Promise<TrafficSource> {
    const response = await apiClient.get(`/traffic-sources/${id}`);
    return response.data;
  },

  /**
   * Get traffic source by session ID
   */
  async getBySessionId(sessionId: string): Promise<TrafficSource | null> {
    const response = await apiClient.get(
      `/traffic-sources/session/${sessionId}`,
    );
    return response.data;
  },

  /**
   * Get analytics by source (Admin only)
   */
  async getAnalyticsBySource(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<AnalyticsBySource[]> {
    const response = await apiClient.get(
      "/traffic-sources/analytics/by-source",
      {
        params,
      },
    );
    return response.data;
  },

  /**
   * Get analytics by campaign (Admin only)
   */
  async getAnalyticsByCampaign(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<AnalyticsByCampaign[]> {
    const response = await apiClient.get(
      "/traffic-sources/analytics/by-campaign",
      { params },
    );
    return response.data;
  },

  /**
   * Get funnel statistics (Admin only)
   */
  async getFunnelStats(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<FunnelStats> {
    const response = await apiClient.get("/traffic-sources/analytics/funnel", {
      params,
    });
    return response.data;
  },
};

export const sessionApi = {
  /**
   * Create or get existing session
   */
  async createOrGet(data: CreateSessionDto): Promise<Session> {
    const response = await apiClient.post("/sessions", data);
    return response.data;
  },

  /**
   * Get session by session ID
   */
  async getBySessionId(sessionId: string): Promise<Session | null> {
    const response = await apiClient.get(`/sessions/${sessionId}`);
    return response.data;
  },

  /**
   * Track page visit
   */
  async trackPageVisit(
    sessionId: string,
    data: { url: string; time_spent?: number },
  ): Promise<Session> {
    const response = await apiClient.patch(
      `/sessions/${sessionId}/page-visit`,
      data,
    );
    return response.data;
  },

  /**
   * End session
   */
  async endSession(sessionId: string, totalDuration: number): Promise<Session> {
    const response = await apiClient.patch(`/sessions/${sessionId}/end`, {
      total_duration: totalDuration,
    });
    return response.data;
  },

  /**
   * Link user to session after registration
   */
  async linkUserToSession(sessionId: string, userId: string): Promise<Session> {
    const response = await apiClient.patch(`/sessions/${sessionId}/link-user`, {
      user_id: userId,
    });
    return response.data;
  },
};

/**
 * Helper function to initialize tracking on page load
 * Call this in your main App component or _app.tsx
 */
export async function initializeTracking(): Promise<{
  trafficSource: TrafficSource | null;
  session: Session | null;
}> {
  try {
    const { getOrCreateTrafficSource } = await import("../utils/trafficSource");
    const trafficSourceData = getOrCreateTrafficSource();

    // Create or get traffic source
    const trafficSource = await trafficSourceApi.create({
      utm_source: trafficSourceData.utm_source,
      utm_medium: trafficSourceData.utm_medium,
      utm_campaign: trafficSourceData.utm_campaign,
      utm_content: trafficSourceData.utm_content,
      utm_term: trafficSourceData.utm_term,
      landing_page: trafficSourceData.landing_page,
      referrer: trafficSourceData.referrer,
      session_id: trafficSourceData.session_id,
    });

    // Create or get session
    const session = await sessionApi.createOrGet({
      session_id: trafficSourceData.session_id,
      traffic_source_id: trafficSource._id,
    });

    // Track current page
    await sessionApi.trackPageVisit(trafficSourceData.session_id, {
      url: window.location.pathname,
    });

    return { trafficSource, session };
  } catch (error) {
    console.error("Failed to initialize tracking:", error);
    return { trafficSource: null, session: null };
  }
}
