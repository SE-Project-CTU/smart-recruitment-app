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
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Flag & queue để xử lý nhiều request đồng thời khi token hết hạn
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

// Singleton promise để đảm bảo tại 1 thời điểm chỉ có duy nhất 1 request refresh chạy ngầm
let refreshPromise: Promise<string | null> | null = null;

export const getOrRefreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const correlationId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : "550e8400-e29b-41d4-a716-446655440000";

      const refreshUrl = `${config.api.baseUrl}${API_ENDPOINTS.AUTH.REFRESH}`;

      // Trình duyệt tự động gửi kèm HttpOnly Cookie "refreshToken" qua withCredentials: true
      const refreshResponse = await axios.post(
        refreshUrl,
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-Correlation-ID": correlationId,
          },
        },
      );

      const newAuthData = refreshResponse.data?.data;
      if (newAuthData?.accessToken) {
        useAuthStore.getState().updateTokens(newAuthData);
        processQueue(null, newAuthData.accessToken);
        return newAuthData.accessToken as string;
      }
      return null;
    } catch (refreshErr) {
      processQueue(refreshErr, null);
      useAuthStore.getState().clearAuth();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
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
    const requestUrl = originalRequest?.url?.toLowerCase() || "";

    // 1. Các route tuyệt đối không được kích hoạt refresh token khi gặp 401
    const isAuthBypassRoute =
      requestUrl.includes(API_ENDPOINTS.AUTH.LOGIN.toLowerCase()) ||
      requestUrl.includes(API_ENDPOINTS.AUTH.REFRESH.toLowerCase()) ||
      requestUrl.includes(
        API_ENDPOINTS.AUTH.REGISTER_CANDIDATE.toLowerCase(),
      ) ||
      requestUrl.includes(
        API_ENDPOINTS.AUTH.REGISTER_RECRUITER.toLowerCase(),
      ) ||
      requestUrl.includes("change-password"); // Endpoint đổi mật khẩu

    // 2. Kiểm tra nếu backend báo lỗi nghiệp vụ sai mật khẩu thì không refresh
    const responseData = error.response?.data as
      Record<string, unknown> | undefined;
    const errorBody = (responseData?.error ?? responseData) as
      Record<string, unknown> | undefined;
    const isPasswordInvalid = errorBody?.code === "CURRENT_PASSWORD_INVALID";

    // Chỉ refresh token nếu là 401 do token hết hạn, KHÔNG PHẢI lỗi đổi mật khẩu
    if (
      status === 401 &&
      !originalRequest?._retry &&
      !isAuthBypassRoute &&
      !isPasswordInvalid
    ) {
      if (originalRequest) {
        originalRequest._retry = true;
      }

      // Nếu đang có 1 request refresh chạy ngầm, đưa các request sau vào hàng đợi
      if (refreshPromise) {
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

      const newToken = await getOrRefreshAccessToken();
      if (newToken) {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return axiosClient(originalRequest);
      } else {
        handleApiError(error);
        return Promise.reject(error);
      }
    }

    // Xử lý lỗi toàn cục qua global error handler
    handleApiError(error);
    return Promise.reject(error);
  },
);

export default axiosClient;
