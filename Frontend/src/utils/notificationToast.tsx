import { toast } from "@/components/ui/toast";
import { PATHS } from "@/constants/paths";
import type { NotificationDto } from "@/types/notification";
import { NotificationToastContent } from "@/components/notification/NotificationToastContent";

export function resolveNotificationAction(notification: NotificationDto): {
  url?: string;
  label?: string;
  toastType: "success" | "info" | "warning";
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
    case "CompanyJoinRequest":
      return {
        url: PATHS.RECRUITER.COMPANY_MANAGEMENT,
        label: "Xét duyệt yêu cầu",
        toastType: "warning",
      };
    case "SystemAlert": {
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
  navigate: (path: string) => void,
) {
  const { url, label, toastType } = resolveNotificationAction(notification);

  const titleElement = (
    <span className="text-sm font-semibold text-text-main">
      {notification.title}
    </span>
  );

  const descriptionElement = (
    <NotificationToastContent
      notification={notification}
      actionUrl={url}
      actionLabel={label}
      onNavigate={(targetUrl) => {
        navigate(targetUrl);
      }}
    />
  );

  if (toastType === "success") {
    toast.success({ title: titleElement, description: descriptionElement });
  } else if (toastType === "warning") {
    toast.warning({ title: titleElement, description: descriptionElement });
  } else {
    toast.info({ title: titleElement, description: descriptionElement });
  }
}

