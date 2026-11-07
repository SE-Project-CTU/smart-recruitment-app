import type { NotificationDto } from "@/types/notification";

interface NotificationToastProps {
  notification: NotificationDto;
}

export function NotificationToastContent({
  notification,
}: NotificationToastProps) {
  return (
    <div className="flex flex-col gap-1.5 py-0.5">
      <p className="line-clamp-2 text-xs leading-relaxed text-text-muted">
        {notification.body}
      </p>
    </div>
  );
}

export default NotificationToastContent;
