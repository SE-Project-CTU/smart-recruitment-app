import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { config } from "@/api/env";
import { handleApiError } from "./errorHandler";
import { useAuthStore } from "@/stores/authStore";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";

const axiosClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag & queue để xử lý nhiều request đồng thời khi token hết hạn
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

// ----------------------------------------------------------------------
// Request Interceptor: Gắn Token và Correlation ID
// ----------------------------------------------------------------------
axiosClient.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    // Ưu tiên đọc từ Zustand store (Single Source of Truth)
    const token = useAuthStore.getState().accessToken;

    if (reqConfig.headers) {
      // Sinh Correlation ID cho mỗi request để backend dễ trace log
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

// ----------------------------------------------------------------------
// Response Interceptor: Tự động Refresh Token khi gặp lỗi 401
// ----------------------------------------------------------------------
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
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REFRESH) ||
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REGISTER_CANDIDATE) ||
      originalRequest?.url?.includes(API_ENDPOINTS.AUTH.REGISTER_RECRUITER);

    // Xử lý khi gặp 401 Unauthorized (ngoại trừ các endpoint auth)
    if (status === 401 && !originalRequest?._retry && !isAuthRoute) {
      const refreshToken = useAuthStore.getState().refreshToken;

      // Không có refresh token -> xóa phiên và reject
      if (!refreshToken) {
        useAuthStore.getState().clearAuth();
        handleApiError(error);
        return Promise.reject(error);
      }

      // Nếu đang có 1 request refresh chạy ngầm, đưa các request sau vào hàng đợi
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
          `${config.api.baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        const newAuthData = refreshResponse.data?.data;
        if (newAuthData?.accessToken) {
          // Cập nhật token vào Zustand store (tự động đồng bộ cookie luôn)
          useAuthStore.getState().updateTokens(newAuthData);

          processQueue(null, newAuthData.accessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAuthData.accessToken}`;
          }

          return axiosClient(originalRequest);
        } else {
          throw new Error("Dữ liệu refresh token trả về không hợp lệ");
        }
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        // Refresh thất bại -> xóa sạch auth store để cập nhật UI ngay lập tức
        useAuthStore.getState().clearAuth();
        handleApiError(refreshErr);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    // Xử lý lỗi toàn cục qua global error handler
    handleApiError(error);
    return Promise.reject(error);
  },
);

export default axiosClient;
