import { create } from "zustand";
import type { UserAccount, LoginResult, RefreshResult } from "@/types/auth";
import { STORAGE_KEYS } from "@/constants/storage";
import { authService } from "@/services/authService";
import { accountService } from "@/services/accountService";
import { getOrRefreshAccessToken } from "@/api/axios";

export interface AuthState {
  user: UserAccount | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;

  setAuth: (data: LoginResult) => void;
  updateTokens: (data: RefreshResult) => void;
  setUser: (user: UserAccount | null) => void;
  updateUser: (partialUser: Partial<UserAccount>) => void;
  clearAuth: () => void;
  logout: (allSessions?: boolean) => Promise<void>;
  initAuth: () => Promise<void>;
}

const getStoredUser = (): UserAccount | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    return raw ? (JSON.parse(raw) as UserAccount) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getStoredUser(),
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitializing: true,

  setAuth: (data: LoginResult) => {
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(data.user));

    set({
      user: data.user,
      accessToken: data.accessToken,
      refreshToken: null,
      isAuthenticated: true,
      isLoading: false,
      isInitializing: false,
    });
  },

  updateTokens: (data: RefreshResult) => {
    set({
      accessToken: data.accessToken,
      refreshToken: null,
      isAuthenticated: true,
      isInitializing: false,
    });
  },

  setUser: (user: UserAccount | null) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
    set({ user });
  },

  updateUser: (partialUser: Partial<UserAccount>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...partialUser };
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updated));
    set({ user: updated });
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitializing: false,
    });
  },

  logout: async (allSessions: boolean = false) => {
    const { clearAuth } = get();
    try {
      await authService.logout({
        allSessions,
      });
    } catch (err) {
      console.warn("Lỗi khi gọi API logout đến máy chủ:", err);
    } finally {
      clearAuth();
    }
  },

  initAuth: async () => {
    try {
      const token = await getOrRefreshAccessToken();
      if (token) {
        // Tự động đồng bộ profile mới nhất từ backend
        try {
          const meRes = await accountService.getMe();
          if (meRes.data) {
            get().setUser(meRes.data);
          }
        } catch {
          // Nếu getMe lỗi tạm thời, user vẫn được giữ từ localStorage
        }
      } else {
        get().clearAuth();
      }
    } catch {
      get().clearAuth();
    } finally {
      set({ isInitializing: false });
    }
  },
}));

/** Helper lấy token nhanh cho các tác vụ bên ngoài React Hook (vd: Axios Interceptor) */
export const getAuthToken = (): string | null => {
  return useAuthStore.getState().accessToken;
};
