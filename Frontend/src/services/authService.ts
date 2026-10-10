import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
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
      API_ENDPOINTS.AUTH.LOGIN,
      payload,
    );
  },

  /**
   * Refresh access token using refresh token
   */
  async refresh(payload: RefreshRequest): Promise<ApiResponse<RefreshResult>> {
    return await axiosClient.post<never, ApiResponse<RefreshResult>>(
      API_ENDPOINTS.AUTH.REFRESH,
      payload,
    );
  },

  /**
   * Logout user session
   */
  async logout(payload?: LogoutRequest): Promise<void> {
    await axiosClient.post(API_ENDPOINTS.AUTH.LOGOUT, payload ?? {});
  },
};

