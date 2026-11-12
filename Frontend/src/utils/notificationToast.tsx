import { toast } from "@/components/ui/toast";
import { PATHS } from "@/constants/paths";
import type { NotificationDto } from "@/types/notification";
import { NotificationToastContent } from "@/components/notification/NotificationToastContent";

export function parseNotificationPayload(
  payload?: string | Record<string, unknown> | null,
): Record<string, unknown> | null {
  if (!payload) return null;
  if (typeof payload === "string") {
    try {
      const parsed = JSON.parse(payload);
      return parsed && typeof parsed === "object"
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  return typeof payload === "object" ? payload : null;
}

function getPayloadString(
  parsed: Record<string, unknown> | null,
  ...keys: string[]
): string | undefined {
  if (!parsed) return undefined;
  for (const key of keys) {
    const val = parsed[key];
    if (typeof val === "string" && val.trim()) {
      return val.trim();
    }
  }
  return undefined;
}

export function resolveNotificationAction(notification: NotificationDto): {
  url?: string;
  label?: string;
  toastType: "success" | "info" | "warning" | "error";
} {
  const parsedPayload = parseNotificationPayload(notification.payload);

  switch (notification.type) {
    case "JobApplicationReceived":
      return {
        url: PATHS.RECRUITER.CANDIDATES,
        label: "Xem hồ sơ ứng viên",
        toastType: "success",
      };

    case "ApplicationStatusUpdate": {
      const status = getPayloadString(parsedPayload, "status")?.toUpperCase();
      let toastType: "success" | "info" | "warning" = "info";
      if (status === "HIRED" || status === "OFFERED") {
        toastType = "success";
      } else if (status === "REJECTED") {
        toastType = "warning";
      }

      return {
        url: PATHS.CANDIDATE.APPLICATION_STATUS,
        label: "Xem trạng thái ứng tuyển",
        toastType,
      };
    }

    case "CompanyNewJobPosting": {
      const companyId = getPayloadString(
        parsedPayload,
        "company_id",
        "companyId",
      );
      return {
        url: companyId
          ? PATHS.COMPANY_DETAIL.replace(":id", companyId)
          : PATHS.SEARCH_JOB,
        label: companyId ? "Xem trang công ty" : "Xem việc làm",
        toastType: "info",
      };
    }

    case "CompanyInvitation": {
      const companyId = getPayloadString(
        parsedPayload,
        "company_id",
        "companyId",
      );
      const invitationStatus = getPayloadString(
        parsedPayload,
        "invitation_status",
        "invitationStatus",
      )?.toUpperCase();

      if (invitationStatus === "ACCEPTED") {
        return {
          url: companyId
            ? PATHS.RECRUITER.COMPANAY_MANAGEMENT_MEMBERS.replace(
                ":companyId",
                companyId,
              )
            : PATHS.RECRUITER.COMPANY_MANAGEMENT,
          label: "Xem thành viên",
          toastType: "success",
        };
      }

      if (invitationStatus === "REJECTED") {
        return {
          url: companyId
            ? PATHS.RECRUITER.COMPANAY_MANAGEMENT_OVERVIEW.replace(
                ":companyId",
                companyId,
              )
            : PATHS.RECRUITER.COMPANY_MANAGEMENT,
          label: "Xem tổng quan công ty",
          toastType: "warning",
        };
      }

      return {
        url: PATHS.RECRUITER.COMPANY_INVITATION,
        label: "Xem lời mời",
        toastType: "info",
      };
    }

    case "CompanyJoinRequest": {
      const companyId = getPayloadString(
        parsedPayload,
        "company_id",
        "companyId",
      );
      const requestStatus = getPayloadString(
        parsedPayload,
        "request_status",
        "requestStatus",
      )?.toUpperCase();

      const titleLower = notification.title.toLowerCase();
      const bodyLower = notification.body.toLowerCase();
      const isRejected =
        requestStatus === "REJECTED" ||
        titleLower.includes("từ chối") ||
        bodyLower.includes("từ chối");
      const isApproved =
        requestStatus === "APPROVED" ||
        titleLower.includes("đã được duyệt") ||
        bodyLower.includes("chấp thuận");

      if (isApproved) {
        return {
          url: companyId
            ? PATHS.RECRUITER.COMPANAY_MANAGEMENT_OVERVIEW.replace(
                ":companyId",
                companyId,
              )
            : PATHS.RECRUITER.COMPANY_MANAGEMENT,
          label: "Truy cập công ty",
          toastType: "success",
        };
      }

      if (isRejected) {
        return {
          url: PATHS.RECRUITER.COMPANY_MANAGEMENT,
          label: "Xem danh sách công ty",
          toastType: "warning",
        };
      }

      return {
        url: companyId
          ? PATHS.RECRUITER.COMPANAY_MANAGEMENT_INVITATIONS.replace(
              ":companyId",
              companyId,
            )
          : PATHS.RECRUITER.COMPANY_MANAGEMENT,
        label: "Xét duyệt yêu cầu",
        toastType: "info",
      };
    }

    case "JobRecommendation":
      return {
        url: PATHS.CANDIDATE.MATCHED_JOBS,
        label: "Xem việc làm phù hợp",
        toastType: "info",
      };

    case "SystemAlert": {
      // 1. Nếu là thông báo hệ thống do Admin chủ động phát (resourceType === 'System' hoặc không có resourceId)
      if (notification.resourceType === "System" || !notification.resourceId) {
        const rawLevel = getPayloadString(parsedPayload, "level")?.toLowerCase();
        const level =
          rawLevel && ["general", "info", "warning", "error"].includes(rawLevel)
            ? rawLevel
            : "general";

        // Mapping toastType: error -> error, warning -> warning, general/info -> info
        const toastType: "info" | "warning" | "error" =
          level === "error"
            ? "error"
            : level === "warning"
              ? "warning"
              : "info";

        // Không dùng action button cho thông báo phát từ admin
        return {
          toastType,
        };
      }

      // 2. Nếu là thông báo hệ thống tự động từ thẩm định công ty / duyệt tin tuyển dụng
      const titleLower = notification.title.toLowerCase();
      const bodyLower = notification.body.toLowerCase();
      const isRejected =
        titleLower.includes("từ chối") ||
        titleLower.includes("không được duyệt") ||
        bodyLower.includes("từ chối");

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
