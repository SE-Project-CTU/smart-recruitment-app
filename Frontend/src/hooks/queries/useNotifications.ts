import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/notificationService";
import { useAuthStore } from "@/stores/authStore";
import type { NotificationQueryParams } from "@/types/notification";

export const NOTIFICATION_QUERY_KEYS = {
  all: ["notifications"] as const,
  list: (params?: NotificationQueryParams) => ["notifications", "list", params] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

/**
 * Hook Query: Lấy danh sách thông báo phân trang và lọc của người dùng hiện tại
 */
export const useNotificationsQuery = (params?: NotificationQueryParams) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.list(params),
    queryFn: () => notificationService.getNotifications(params),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
};

/**
 * Hook Query: Lấy số lượng thông báo chưa đọc
 */
export const useUnreadCountQuery = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: NOTIFICATION_QUERY_KEYS.unreadCount,
    queryFn: () => notificationService.getUnreadCount(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });
};

/**
 * Hook Mutation: Đánh dấu một thông báo là đã đọc
 */
export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook Mutation: Đánh dấu tất cả thông báo là đã đọc
 */
export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
};

/**
 * Hook Mutation: Xóa một thông báo
 */
export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.all });
    },
  });
};

