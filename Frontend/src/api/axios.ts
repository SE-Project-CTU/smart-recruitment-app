import axios, { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
import { config } from "@/api/env";
import { handleApiError } from "./errorHandler";
import { getAccessToken, getRefreshToken, setAuthCookies, clearAuthCookies } from "@/utils/cookie";

const axiosClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag & queue to avoid multiple parallel refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosClient.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    const token = getAccessToken() || localStorage.getItem("token");
    if (reqConfig.headers) {
      // Use crypto.randomUUID() if supported, or fallback
      const correlationId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "550e8400-e29b-41d4-a716-446655440000";

      reqConfig.headers["X-Correlation-ID"] = correlationId;

      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`;
      }
    }
    return reqConfig;
  },
  (error: AxiosError) => Promise.reject(error),
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const isAuthRoute =
      originalRequest?.url?.includes("/api/v1/Auth/login") ||
      originalRequest?.url?.includes("/api/v1/Auth/refresh");

    // Attempt token refresh on 401 if not already retried and not an auth route
    if (status === 401 && !originalRequest?._retry && !isAuthRoute) {
      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        clearAuthCookies();
        handleApiError(error);
        return Promise.reject(error.response?.data || error.message);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return axiosClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.post(
          `${config.api.baseUrl}/api/v1/Auth/refresh`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        const newAuthData = refreshResponse.data?.data;
        if (newAuthData?.accessToken) {
          setAuthCookies(
            newAuthData.accessToken,
            newAuthData.refreshToken,
            newAuthData.refreshTokenExpiresAt,
          );

          processQueue(null, newAuthData.accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAuthData.accessToken}`;
          }

          return axiosClient(originalRequest);
        } else {
          throw new Error("Invalid refresh token response");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        clearAuthCookies();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    handleApiError(error);
    return Promise.reject(error.response?.data || error.message);
  },
);

export default axiosClient;
