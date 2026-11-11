import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type {
  ApiResponse,
  GoogleLoginRequest,
  LoginRequest,
  LoginResult,
  LogoutRequest,
  RefreshRequest,
  RefreshResult,
  RegisterRequest,
  RegisterResult,
} from "@/types";


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
   * Log in or register user with Google Firebase ID token
   */
  async loginWithGoogle(
    payload: GoogleLoginRequest,
  ): Promise<ApiResponse<LoginResult>> {
    return await axiosClient.post<never, ApiResponse<LoginResult>>(
      API_ENDPOINTS.AUTH.GOOGLE,
      payload,
    );
  },

  /**
   * Refresh access token using refresh token (via HttpOnly Cookie or optional payload)
   */
  async refresh(payload?: RefreshRequest): Promise<ApiResponse<RefreshResult>> {
    return await axiosClient.post<never, ApiResponse<RefreshResult>>(
      API_ENDPOINTS.AUTH.REFRESH,
      payload ?? {},
    );
  },

  async registerCandidate(
    payload: RegisterRequest,
  ): Promise<ApiResponse<RegisterResult>> {
    return await axiosClient.post<never, ApiResponse<RegisterResult>>(
      API_ENDPOINTS.AUTH.REGISTER_CANDIDATE,
      payload,
    );
  },

  async registerRecruiter(
    payload: RegisterRequest,
  ): Promise<ApiResponse<RegisterResult>> {
    return await axiosClient.post<never, ApiResponse<RegisterResult>>(
      API_ENDPOINTS.AUTH.REGISTER_RECRUITER,
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
