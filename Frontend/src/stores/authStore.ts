import { create } from "zustand";
import type { AuthUser, LoginResult, RefreshResult } from "@/types/auth";
import {
  clearAuthCookies,
  getAccessToken,
  getRefreshToken,
  setAuthCookies,
} from "@/utils/cookie";
import { STORAGE_KEYS } from "@/constants/storage";
import { authService } from "@/services/authService";

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (data: LoginResult) => void;
  updateTokens: (data: RefreshResult) => void;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
  logout: (allSessions?: boolean) => Promise<void>;
}

const getStoredUser = (): AuthUser | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
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
    setAuthCookies(
      data.accessToken,
      data.refreshToken,
      data.refreshTokenExpiresAt,
    );

    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(data.user));

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

  setUser: (user: AuthUser | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
    set({ user });
  },

  clearAuth: () => {
    clearAuthCookies();
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
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
      console.warn("Lỗi khi gọi API logout đến máy chủ:", err);
    } finally {
      clearAuth();
    }
  },
}));

/** Helper lấy token nhanh cho các tác vụ bên ngoài React Hook (vd: Axios Interceptor) */
export const getAuthToken = (): string | null => {
  return useAuthStore.getState().accessToken || getAccessToken();
};
