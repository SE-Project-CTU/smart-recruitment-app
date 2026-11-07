import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  UserPlus,
  FileCheck,
  Briefcase,
  MailCheck,
  Building2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { getTimeAgo } from "@/utils/helper";
import { resolveNotificationAction } from "@/utils/notificationToast";
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "@/hooks/queries/useNotifications";
import type { NotificationDto, NotificationType } from "@/types/notification";

/**
 * Trả về icon và màu nền trực quan cho từng loại thông báo
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "JobApplicationReceived":
      return {
        icon: <UserPlus className="size-4 text-emerald-600" />,
        bg: "bg-emerald-50 border-emerald-100",
      };
    case "ApplicationStatusUpdate":
      return {
        icon: <FileCheck className="size-4 text-blue-600" />,
        bg: "bg-blue-50 border-blue-100",
      };
    case "CompanyNewJobPosting":
      return {
        icon: <Briefcase className="size-4 text-primary" />,
        bg: "bg-secondary-light/40 border-secondary-light",
      };
    case "CompanyInvitation":
      return {
        icon: <MailCheck className="size-4 text-amber-600" />,
        bg: "bg-amber-50 border-amber-100",
      };
    case "CompanyJoinRequest":
      return {
        icon: <Building2 className="size-4 text-orange-600" />,
        bg: "bg-orange-50 border-orange-100",
      };
    case "SystemAlert":
      return {
        icon: <ShieldCheck className="size-4 text-purple-600" />,
        bg: "bg-purple-50 border-purple-100",
      };
    default:
      return {
        icon: <AlertCircle className="size-4 text-slate-600" />,
        bg: "bg-slate-100 border-slate-200",
      };
  }
}

export function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const { data: notificationsResponse, isLoading } = useNotificationsQuery({
    pageSize: 30,
    isUnread: activeTab === "unread" ? true : undefined,
  });

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const deleteNotificationMutation = useDeleteNotificationMutation();

  const notifications: NotificationDto[] = notificationsResponse?.data || [];

  const handleItemClick = (notification: NotificationDto) => {
    // 1. Đánh dấu đã đọc nếu chưa đọc
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }

    // 2. Đóng popover
    setIsOpen(false);

    // 3. Điều hướng tới trang tài nguyên liên quan
    const { url } = resolveNotificationAction(notification);
    if (url) {
      navigate(url);
    }
  };

  const handleMarkAsReadOnly = (
    e: React.MouseEvent,
    notificationId: string,
  ) => {
    e.stopPropagation();
    markAsReadMutation.mutate(notificationId);
  };

  const handleDelete = (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    deleteNotificationMutation.mutate(notificationId);
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0 && !markAllAsReadMutation.isPending) {
      markAllAsReadMutation.mutate();
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 cursor-pointer focus:outline-none"
        aria-label="Thông báo"
      >
        <Bell className="size-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-90 sm:w-105 p-0 overflow-hidden shadow-xl border border-border/70 rounded-2xl bg-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-text-main">Thông báo</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                {unreadCount} chưa đọc
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              disabled={markAllAsReadMutation.isPending}
              className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors cursor-pointer disabled:opacity-50"
              title="Đánh dấu tất cả là đã đọc"
            >
              <CheckCheck className="size-3.5" />
              <span>Đã đọc tất cả</span>
            </button>
          )}
        </div>

        {/* Tab Filter */}
        <div className="flex border-b border-border/50 px-3 pt-2 gap-2 bg-slate-50/20">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "all"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            Tất cả
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "unread"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            Chưa đọc ({unreadCount})
          </button>
        </div>

        {/* Notification Feed */}
        <div className="max-h-95 overflow-y-auto divide-y divide-border/30">
          {isLoading ? (
            <div className="flex flex-col gap-3 p-4">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex gap-3 items-start">
                  <Skeleton className="size-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="size-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5">
                <Bell className="size-5 text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-text-main">
                {activeTab === "unread"
                  ? "Không có thông báo chưa đọc"
                  : "Bạn chưa có thông báo nào"}
              </p>
              <p className="text-xs text-text-muted mt-1 max-w-xs leading-relaxed">
                {activeTab === "unread"
                  ? "Tất cả các thông báo của bạn đã được đọc."
                  : "Khi có hoạt động ứng tuyển, duyệt tin hoặc phản hồi, bạn sẽ nhận được thông báo tại đây."}
              </p>
            </div>
          ) : (
            notifications.map((item) => {
              const { icon, bg } = getNotificationIcon(item.type);
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-slate-50/80 ${
                    !item.isRead ? "bg-secondary-light/15" : "bg-white"
                  }`}
                >
                  {/* Icon Loại thông báo */}
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${bg} shadow-2xs mt-0.5`}
                  >
                    {icon}
                  </div>

                  {/* Nội dung thông báo */}
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-baseline justify-between gap-2">
                      <h4
                        className={`text-xs truncate ${
                          !item.isRead
                            ? "font-bold text-text-main"
                            : "font-semibold text-text-main/90"
                        }`}
                      >
                        {item.title}
                      </h4>
                      <span className="text-[10px] text-text-muted/70 shrink-0">
                        {getTimeAgo(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-text-muted line-clamp-2 mt-0.5 leading-relaxed">
                      {item.body}
                    </p>
                  </div>

                  {/* Chấm tròn chưa đọc & Action buttons khi hover */}
                  <div className="absolute right-3 top-3.5 flex items-center gap-1">
                    {!item.isRead && (
                      <span className="size-2 rounded-full bg-primary block group-hover:hidden" />
                    )}

                    <div className="hidden group-hover:flex items-center gap-0.5">
                      {!item.isRead && (
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsReadOnly(e, item.id)}
                          title="Đánh dấu đã đọc"
                          className="p-1 rounded-md text-text-muted hover:text-primary hover:bg-slate-200/60 transition-colors cursor-pointer"
                        >
                          <Check className="size-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, item.id)}
                        title="Xóa thông báo"
                        className="p-1 rounded-md text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default NotificationDropdown;

