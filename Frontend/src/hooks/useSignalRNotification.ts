import { useEffect, useRef } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { queryClient } from "@/lib/queryClient";
import { showNotificationToast } from "@/utils/notificationToast";
import type {
  NotificationDto,
  ApplicationCounterPayload,
} from "@/types/notification";

export function useSignalRNotification() {
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
      }
      return;
    }

    const rawBaseUrl =
      import.meta.env.VITE_API_BASE_URL || "http://localhost:5190";
    const baseUrl = rawBaseUrl.replace(/\/$/, "");
    const hubUrl = `${baseUrl}/hubs/notifications`;

    const connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => useAuthStore.getState().accessToken || "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // Lắng nghe sự kiện phát thông báo thời gian thực từ Backend
    connection.on(
      "ReceiveNotification",
      (notification: NotificationDto) => {
        // Invalidate các queries liên quan để dữ liệu tự động cập nhật
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({
          queryKey: ["notifications", "unread-count"],
        });

        if (notification.type === "JobApplicationReceived") {
          queryClient.invalidateQueries({ queryKey: ["applications"] });
          queryClient.invalidateQueries({
            queryKey: ["recruiter-candidates"],
          });
        } else if (notification.type === "ApplicationStatusUpdate") {
          queryClient.invalidateQueries({ queryKey: ["my-applications"] });
          queryClient.invalidateQueries({
            queryKey: ["candidate-applications"],
          });
        } else if (
          notification.type === "CompanyNewJobPosting" ||
          notification.type === "SystemAlert"
        ) {
          queryClient.invalidateQueries({ queryKey: ["job-postings"] });
          queryClient.invalidateQueries({ queryKey: ["company"] });
        }

        // Hiển thị interactive Toast Popup
        showNotificationToast(notification, navigate);
      },
    );

    // Lắng nghe sự kiện bão ứng tuyển (burst counter delta)
    connection.on(
      "ApplicationCounterUpdated",
      (_payload: ApplicationCounterPayload) => {
        queryClient.invalidateQueries({ queryKey: ["applications"] });
        queryClient.invalidateQueries({ queryKey: ["recruiter-candidates"] });
      },
    );

    // Khởi động kết nối
    connection.start().catch((err) => {
      console.warn("SignalR Notification Hub connection warning:", err);
    });

    return () => {
      connection.stop().catch(() => {});
      connectionRef.current = null;
    };
  }, [isAuthenticated, accessToken, navigate]);
}

