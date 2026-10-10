import { create } from "zustand";
import type { AuthUser, LoginResult, RefreshResult } from "@/types/auth";
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
} from "@/utils/cookie";
import { authService } from "@/services/authService";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (data: LoginResult) => void;
  updateTokens: (data: RefreshResult) => void;
  clearAuth: () => void;
  logout: (allSessions?: boolean) => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

const initialAccessToken = getAccessToken();
const initialRefreshToken = getRefreshToken();
const initialUser = getStoredUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  user: initialUser,
  accessToken: initialAccessToken,
  refreshToken: initialRefreshToken,
  isAuthenticated: Boolean(initialAccessToken),
  isLoading: false,

  setAuth: (data: LoginResult) => {
    // 1. Store in cookies
    setAuthCookies(
      data.accessToken,
      data.refreshToken,
      data.refreshTokenExpiresAt,
    );

    // 2. Persist user info in localStorage
    localStorage.setItem("auth_user", JSON.stringify(data.user));

    // 3. Update store state
    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  updateTokens: (data: RefreshResult) => {
    setAuthCookies(
      data.accessToken,
      data.refreshToken,
      data.refreshTokenExpiresAt,
    );

    set({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      isAuthenticated: true,
    });
  },

  clearAuth: () => {
    clearAuthCookies();
    localStorage.removeItem("auth_user");
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  logout: async (allSessions: boolean = false) => {
    const { refreshToken, clearAuth } = get();
    try {
      await authService.logout({
        refreshToken: refreshToken || null,
        allSessions,
      });
    } catch (err) {
      console.warn("Lỗi khi gọi API logout:", err);
    } finally {
      clearAuth();
    }
  },

  setUser: (user: AuthUser | null) => {
    if (user) {
      localStorage.setItem("auth_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("auth_user");
    }
    set({ user });
  },
}));
