import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { ApiPagedResponse, ApiResponse } from "@/types";
import type {
  NotificationDto,
  NotificationQueryParams,
  UnreadCountResult,
} from "@/types/notification";

export const notificationService = {
  /**
   * Lấy danh sách thông báo của người dùng hiện tại (hỗ trợ phân trang và lọc)
   */
  async getNotifications(
    params?: NotificationQueryParams,
  ): Promise<ApiPagedResponse<NotificationDto>> {
    return await axiosClient.get<never, ApiPagedResponse<NotificationDto>>(
      API_ENDPOINTS.NOTIFICATION.LIST,
      { params },
    );
  },

  /**
   * Lấy số lượng thông báo chưa đọc của người dùng hiện tại
   */
  async getUnreadCount(): Promise<number> {
    const response = await axiosClient.get<
      never,
      ApiResponse<UnreadCountResult>
    >(API_ENDPOINTS.NOTIFICATION.UNREAD_COUNT);
    return response.data.unreadCount;
  },

  /**
   * Đánh dấu 1 thông báo đã đọc
   */
  async markAsRead(id: string): Promise<void> {
    await axiosClient.patch(API_ENDPOINTS.NOTIFICATION.MARK_READ(id));
  },

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  async markAllAsRead(): Promise<void> {
    await axiosClient.patch(API_ENDPOINTS.NOTIFICATION.MARK_ALL_READ);
  },

  /**
   * Xóa 1 thông báo của người dùng
   */
  async deleteNotification(id: string): Promise<void> {
    await axiosClient.delete(API_ENDPOINTS.NOTIFICATION.DELETE(id));
  },
};

