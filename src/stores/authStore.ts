import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "../api/auth";
import { getDeviceId } from "../utils/device";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken?: string) => void;
  updateAccessToken: (accessToken: string) => void;
  logout: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) => {
        // Store access token in localStorage
        localStorage.setItem("accessToken", accessToken);
        // Store refresh token in localStorage if provided
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }
        set({ user, accessToken, isAuthenticated: true });
      },
      updateAccessToken: (accessToken) => {
        localStorage.setItem("accessToken", accessToken);
        set({ accessToken });
      },
      logout: async () => {
        try {
          // Send logout request with device_id to permanently delete the record
          const deviceId = getDeviceId();
          await authApi.logout(deviceId);
        } catch (error) {
          console.error("Logout error:", error);
        } finally {
          // Clear both tokens from local storage and state
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },
      clearAuth: () => {
        // Clear both tokens from localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({ user: null, accessToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
