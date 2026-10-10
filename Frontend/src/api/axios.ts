import axios, { AxiosError, type AxiosResponse } from "axios";
import { config } from "@/api/env";
import { handleApiError } from "./errorHandler";

const axiosClient = axios.create({
  baseURL: config.api.baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (reqConfig) => {
    const token = localStorage.getItem("token");
    if (reqConfig.headers) {
      reqConfig.headers["X-Correlation-ID"] =
        "550e8400-e29b-41d4-a716-446655440000";
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
  (error: AxiosError) => {
    handleApiError(error);
    return Promise.reject(error.response?.data || error.message);
  },
);

export default axiosClient;
