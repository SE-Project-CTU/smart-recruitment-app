import { ArrowRight } from "lucide-react";
import type { NotificationDto } from "@/types/notification";

interface NotificationToastProps {
  notification: NotificationDto;
  onNavigate?: (url: string) => void;
  actionUrl?: string;
  actionLabel?: string;
}

export function NotificationToastContent({
  notification,
  onNavigate,
  actionUrl,
  actionLabel = "Xem chi tiết",
}: NotificationToastProps) {
  return (
    <div className="flex flex-col gap-1.5 py-0.5">
      <p className="text-xs leading-relaxed text-text-muted line-clamp-2">
        {notification.body}
      </p>
      {actionUrl && onNavigate && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(actionUrl);
          }}
          className="mt-1 inline-flex items-center gap-1.5 self-start rounded-md bg-secondary-light/60 px-2 py-1 text-xs font-semibold text-primary transition-colors hover:bg-secondary-light hover:text-primary-dark cursor-pointer"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="size-3" />
        </button>
      )}
    </div>
  );
}

export default NotificationToastContent;
