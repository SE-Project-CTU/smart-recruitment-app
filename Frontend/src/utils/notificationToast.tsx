import { toast } from "@/components/ui/toast";
import { PATHS } from "@/constants/paths";
import type { NotificationDto } from "@/types/notification";
import { NotificationToastContent } from "@/components/notification/NotificationToastContent";

export function resolveNotificationAction(notification: NotificationDto): {
  url?: string;
  label?: string;
  toastType: "success" | "info" | "warning" | "error";
} {
  switch (notification.type) {
    case "JobApplicationReceived":
      return {
        url: PATHS.RECRUITER.CANDIDATES,
        label: "Xem hồ sơ ứng viên",
        toastType: "success",
      };
    case "ApplicationStatusUpdate":
      return {
        url: PATHS.CANDIDATE.APPLICATION_STATUS,
        label: "Xem trạng thái ứng tuyển",
        toastType: "info",
      };
    case "CompanyNewJobPosting":
      return {
        url: PATHS.SEARCH_JOB,
        label: "Xem việc làm",
        toastType: "info",
      };
    case "CompanyInvitation":
      return {
        url: PATHS.RECRUITER.COMPANY_INVITATION,
        label: "Xem lời mời",
        toastType: "info",
      };
    case "CompanyJoinRequest": {
      let companyId: string | undefined;
      let isRejected = false;
      const titleLower = notification.title.toLowerCase();
      const bodyLower = notification.body.toLowerCase();

      if (titleLower.includes("từ chối") || bodyLower.includes("từ chối")) {
        isRejected = true;
      }

      if (notification.payload) {
        try {
          const parsed =
            typeof notification.payload === "string"
              ? JSON.parse(notification.payload)
              : notification.payload;
          companyId = parsed?.company_id || parsed?.companyId;
          if (parsed?.request_status === "REJECTED") {
            isRejected = true;
          }
        } catch {
          // ignore error
        }
      }

      const joinRequestUrl =
        isRejected || !companyId
          ? PATHS.RECRUITER.COMPANY_MANAGEMENT
          : `/recruiter/company-management/${companyId}/invitations`;

      return {
        url: joinRequestUrl,
        label: isRejected ? "Xem danh sách công ty" : "Xét duyệt yêu cầu",
        toastType: isRejected ? "warning" : "info",
      };
    }
    case "SystemAlert": {
      // 1. Nếu là thông báo hệ thống do Admin chủ động phát (resourceType === 'System' hoặc không có resourceId)
      if (notification.resourceType === "System" || !notification.resourceId) {
        let level: "info" | "success" | "warning" | "error" = "info";
        if (notification.payload) {
          try {
            const parsed =
              typeof notification.payload === "string"
                ? JSON.parse(notification.payload)
                : notification.payload;
            if (
              parsed?.level &&
              ["info", "success", "warning", "error"].includes(parsed.level)
            ) {
              level = parsed.level;
            }
          } catch {
            // ignore error
          }
        }
        // Không dùng action button cho thông báo phát từ admin
        return {
          toastType: level,
        };
      }

      // 2. Nếu là thông báo hệ thống tự động từ thẩm định công ty / duyệt tin tuyển dụng
      const titleLower = notification.title.toLowerCase();
      const bodyLower = notification.body.toLowerCase();
      const isRejected =
        titleLower.includes("từ chối") || bodyLower.includes("từ chối");

      let targetUrl: string = PATHS.RECRUITER.COMPANY_MANAGEMENT;
      if (notification.resourceType === "JobPosting") {
        targetUrl = PATHS.RECRUITER.JOBS;
      }

      return {
        url: targetUrl,
        label: "Xem chi tiết",
        toastType: isRejected ? "warning" : "success",
      };
    }
    default:
      return {
        toastType: "info",
      };
  }
}

export function showNotificationToast(
  notification: NotificationDto,
  _navigate?: (path: string) => void,
) {
  const { toastType } = resolveNotificationAction(notification);

  const titleElement = (
    <span className="text-sm font-semibold text-text-main">
      {notification.title}
    </span>
  );

  const descriptionElement = (
    <NotificationToastContent notification={notification} />
  );

  if (toastType === "success") {
    toast.success({ title: titleElement, description: descriptionElement });
  } else if (toastType === "warning") {
    toast.warning({ title: titleElement, description: descriptionElement });
  } else if (toastType === "error") {
    toast.error({ title: titleElement, description: descriptionElement });
  } else {
    toast.info({ title: titleElement, description: descriptionElement });
  }
}
