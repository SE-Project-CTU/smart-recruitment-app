export type NotificationType =
  | "CompanyNewJobPosting"
  | "ApplicationStatusUpdate"
  | "CompanyInvitation"
  | "CompanyJoinRequest"
  | "JobRecommendation"
  | "SystemAlert"
  | "JobApplicationReceived";

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  payload?: string | Record<string, unknown> | null;
  resourceType?: string | null;
  resourceId?: string | null;
  createdAt: string;
  readAt?: string | null;
  isRead?: boolean;
}

export interface UnreadCountResult {
  unreadCount: number;
}

export interface NotificationQueryParams {
  page?: number;
  pageSize?: number;
  isUnread?: boolean;
  type?: NotificationType;
}

export interface ApplicationCounterPayload {
  jobId: string;
  companyId: string;
  delta: number;
  timestamp: string;
}
