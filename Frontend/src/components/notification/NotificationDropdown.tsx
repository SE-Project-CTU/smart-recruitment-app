import { useState, useMemo } from "react";
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
  ChevronDown,
  Loader2,
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
  const iconProps = { className: "size-4 text-secondary-dark" };
  const bg = "bg-bg-white-blue border-border/40";

  switch (type) {
    case "JobApplicationReceived":
      return {
        icon: <UserPlus {...iconProps} />,
        bg,
      };
    case "ApplicationStatusUpdate":
      return {
        icon: <FileCheck {...iconProps} />,
        bg,
      };
    case "CompanyNewJobPosting":
      return {
        icon: <Briefcase {...iconProps} />,
        bg,
      };
    case "CompanyInvitation":
      return {
        icon: <MailCheck {...iconProps} />,
        bg,
      };
    case "CompanyJoinRequest":
      return {
        icon: <Building2 {...iconProps} />,
        bg,
      };
    case "SystemAlert":
      return {
        icon: <ShieldCheck {...iconProps} />,
        bg,
      };
    default:
      return {
        icon: <AlertCircle {...iconProps} />,
        bg,
      };
  }
}

export function NotificationDropdown() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [pageSize, setPageSize] = useState(8);

  const { data: unreadCount = 0 } = useUnreadCountQuery();
  const {
    data: notificationsResponse,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useNotificationsQuery({
    pageSize,
    isUnread: activeTab === "unread" ? true : undefined,
  });

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const deleteNotificationMutation = useDeleteNotificationMutation();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const notifications: NotificationDto[] = notificationsResponse?.data || [];
  const totalItems = notificationsResponse?.meta?.totalItems ?? notifications.length;
  const hasMore = totalItems > notifications.length;

  // Phân nhóm thông báo theo chuẩn Facebook/LinkedIn: "Mới" (trong 24h) và "Trước đó" (cũ hơn 24h)
  const { recentNotifications, earlierNotifications } = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    const recent: NotificationDto[] = [];
    const earlier: NotificationDto[] = [];

    notifications.forEach((item) => {
      const itemTime = new Date(item.createdAt).getTime();
      if (now - itemTime < oneDayMs) {
        recent.push(item);
      } else {
        earlier.push(item);
      }
    });

    return { recentNotifications: recent, earlierNotifications: earlier };
  }, [notifications]);

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

  const handleLoadMore = () => {
    setPageSize((prev) => prev + 8);
  };

  const renderNotificationItem = (item: NotificationDto) => {
    const { icon, bg } = getNotificationIcon(item.type);
    return (
      <div
        key={item.id}
        onClick={() => handleItemClick(item)}
        className={`group relative flex items-start gap-3 p-3.5 transition-colors cursor-pointer hover:bg-slate-50 ${
          !item.isRead ? "bg-secondary-light/15" : "bg-white"
        }`}
      >
        {/* Icon loại nghiệp vụ */}
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-xl border ${bg} shadow-2xs mt-0.5`}
        >
          {icon}
        </div>

        {/* Nội dung thông báo */}
        <div className="flex-1 min-w-0">
          {/* Hàng 1: Tiêu đề + Chấm báo chưa đọc */}
          <div className="flex items-center justify-between gap-2">
            <h4
              className={`text-xs truncate ${
                !item.isRead
                  ? "font-bold text-text-main"
                  : "font-semibold text-text-main/90"
              }`}
            >
              {item.title}
            </h4>
            {!item.isRead && (
              <span className="size-2 rounded-full bg-primary shrink-0" />
            )}
          </div>

          {/* Hàng 2: Mô tả nội dung */}
          <p className="text-xs text-text-muted line-clamp-2 mt-0.5 leading-relaxed">
            {item.body}
          </p>

          {/* Hàng 3: Thời gian và Nút hành động nhanh (tách bạch, không bao giờ đè lên nhau) */}
          <div className="flex items-center justify-between mt-2 pt-0.5">
            <span className="text-[11px] text-text-muted/75">
              {getTimeAgo(item.createdAt)}
            </span>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!item.isRead && (
                <button
                  type="button"
                  onClick={(e) => handleMarkAsReadOnly(e, item.id)}
                  title="Đánh dấu đã đọc"
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium text-text-muted hover:text-primary hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <Check className="size-3" />
                  <span>Đã đọc</span>
                </button>
              )}

              <button
                type="button"
                onClick={(e) => handleDelete(e, item.id)}
                title="Xóa thông báo"
                className="p-1 rounded text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
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
        {/* Sticky Header */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 bg-slate-50/70">
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
            onClick={() => {
              setActiveTab("all");
              setPageSize(8);
            }}
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
            onClick={() => {
              setActiveTab("unread");
              setPageSize(8);
            }}
            className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === "unread"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            Chưa đọc {unreadCount > 0 ? `(${unreadCount})` : ""}
          </button>
        </div>

        {/* Notification Feed (Scrollable) */}
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
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <div className="size-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-2">
                <AlertCircle className="size-5" />
              </div>
              <p className="text-xs font-semibold text-text-main">
                Không thể tải thông báo
              </p>
              <p className="text-[11px] text-text-muted mt-1 max-w-xs leading-relaxed">
                Đã xảy ra lỗi khi kết nối máy chủ. Vui lòng kiểm tra lại.
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-3 px-3 py-1 rounded text-xs font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors cursor-pointer"
              >
                Thử lại
              </button>
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
            <>
              {/* Nhóm thông báo Mới (trong 24 giờ qua) */}
              {recentNotifications.length > 0 && earlierNotifications.length > 0 && (
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-text-muted/80 bg-slate-50/70 border-b border-border/30 uppercase tracking-wider">
                  Mới
                </div>
              )}
              {recentNotifications.map(renderNotificationItem)}

              {/* Nhóm thông báo Trước đó (cũ hơn 24 giờ) */}
              {earlierNotifications.length > 0 && recentNotifications.length > 0 && (
                <div className="px-3.5 py-1.5 text-[10px] font-bold text-text-muted/80 bg-slate-50/70 border-y border-border/30 uppercase tracking-wider">
                  Trước đó
                </div>
              )}
              {earlierNotifications.map(renderNotificationItem)}
            </>
          )}
        </div>

        {/* Footer: Xem các thông báo trước đó (chỉ hiển thị khi còn thông báo cũ hơn, không có thì biến mất) */}
        {hasMore && (
          <div className="border-t border-border/50 p-2 bg-slate-50/80 text-center">
            <button
              type="button"
              onClick={handleLoadMore}
              disabled={isFetching}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold text-primary hover:text-primary-dark hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              {isFetching ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Đang tải thêm...</span>
                </>
              ) : (
                <>
                  <ChevronDown className="size-3.5" />
                  <span>Xem các thông báo trước đó</span>
                </>
              )}
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export default NotificationDropdown;
