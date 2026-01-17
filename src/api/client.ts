import axios from "axios";
import { useAuthStore } from "../stores/authStore";

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  withCredentials: true, // Enable sending httpOnly cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add access token
apiClient.interceptors.request.use(
  (config) => {
    // Check cache first for GET requests
    if (config.method?.toLowerCase() === "get") {
      const cacheKey = `${config.url}${JSON.stringify(config.params || {})}`;
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        (config as any)._fromCache = true;
        (config as any)._cachedData = cached.data;
      }
    }

    // Attach access token from localStorage to Authorization header
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Cache short-circuiting interceptor
apiClient.interceptors.request.use((config: any) => {
  if (config._fromCache) {
    return Promise.reject({
      config,
      response: {
        data: config._cachedData,
        status: 200,
        statusText: "OK (from cache)",
        headers: {},
        config,
      },
      __isCache: true,
    });
  }
  return config;
});

// Token refresh state management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string | null) => void;
  reject: (reason?: any) => void;
}> = [];

/**
 * Process all queued requests after token refresh
 * @param error - Error if refresh failed
 * @param token - New access token if refresh succeeded
 */
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token refresh and caching
apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();

    // Cache GET requests
    if (method === "get") {
      const cacheKey = `${response.config.url}${JSON.stringify(
        response.config.params || {}
      )}`;
      cache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now(),
      });
    }

    // Clear all cache on CUD operations
    if (
      method === "post" ||
      method === "put" ||
      method === "patch" ||
      method === "delete"
    ) {
      cache.clear();
    }

    return response;
  },
  async (error) => {
    // Handle our custom cache "error"
    if (error.__isCache) {
      return Promise.resolve(error.response);
    }

    const originalRequest = error.config;

    // Handle 403 ACCOUNT_LOCKED - dispatch event for UI to show modal
    if (
      error.response?.status === 403 &&
      error.response?.data?.error === "ACCOUNT_LOCKED"
    ) {
      // Dispatch custom event for the app to handle
      window.dispatchEvent(
        new CustomEvent("account-locked", {
          detail: {
            message: error.response.data.message,
          },
        })
      );
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (Access Token Expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            // Retry the original request with the new token
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      // Mark this request as retried to prevent infinite loops
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Retrieve refresh token from localStorage as the backend expects it in the body
        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call refresh endpoint with the token in the body
        const response = await axios.post(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:3000"
          }/auth/refresh`,
          { refresh_token: refreshToken },
          { withCredentials: true }
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;

        // Update tokens in localStorage and Zustand store
        useAuthStore.getState().updateAccessToken(accessToken);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        // Update default Authorization header
        apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Process all queued requests with the new token
        processQueue(null, accessToken);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token expired or invalid
        processQueue(refreshError, null);

        // Clear auth state and tokens. This will trigger the SPA's ProtectedRoute to redirect.
        localStorage.removeItem("refreshToken");
        useAuthStore.getState().clearAuth();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Export function to manually clear cache
export const clearApiCache = () => {
  cache.clear();
};
