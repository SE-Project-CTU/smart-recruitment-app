import axiosClient from "@/api/axios";
import type {
  ApiResponse,
  LoginRequest,
  LoginResult,
  LogoutRequest,
  RefreshRequest,
  RefreshResult,
} from "@/types/auth";

export const authService = {
  /**
   * Log in user with email and password
   */
  async login(payload: LoginRequest): Promise<ApiResponse<LoginResult>> {
    return await axiosClient.post<never, ApiResponse<LoginResult>>(
      "/api/v1/Auth/login",
      payload,
    );
  },

  /**
   * Refresh access token using refresh token
   */
  async refresh(payload: RefreshRequest): Promise<ApiResponse<RefreshResult>> {
    return await axiosClient.post<never, ApiResponse<RefreshResult>>(
      "/api/v1/Auth/refresh",
      payload,
    );
  },

  /**
   * Logout user session
   */
  async logout(payload?: LogoutRequest): Promise<void> {
    await axiosClient.post("/api/v1/Auth/logout", payload ?? {});
  },
};
