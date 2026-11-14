import type { PaginationMeta } from "./common";
import type {
  ProvinceItem,
  WardItem,
  IndustryItem,
  IndustryGroupItem,
  SkillItem,
} from "./catalog";

// ==========================================
// 1. DASHBOARD OVERVIEW
// ==========================================

export interface DashboardPeriod {
  from: string;
  to: string;
}

export interface DashboardUsersStat {
  total: number;
  new: number;
  active: number;
  locked: number;
}

export interface DashboardCompaniesStat {
  total: number;
  pendingVerification: number;
  verified: number;
  rejected: number;
}

export interface DashboardJobPostingsStat {
  total: number;
  pendingReview: number;
  open: number;
  expired: number;
  closed: number;
}

export interface DashboardApplicationsStat {
  total: number;
  new: number;
  interviews: number;
  rejected: number;
}

export interface AdminDashboardOverviewData {
  period: DashboardPeriod;
  users: DashboardUsersStat;
  companies: DashboardCompaniesStat;
  jobPostings: DashboardJobPostingsStat;
  applications: DashboardApplicationsStat;
}

// ==========================================
// 2. USERS
// ==========================================

export type AdminUserRole = "Candidate" | "Recruiter" | "Admin";
export type AdminUserStatus = "Active" | "Locked" | "Inactive";

export interface AdminUserItem {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  avatarUrl?: string | null;
  status: AdminUserStatus | string;
  roles: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserFilterParams {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface UpdateUserStatusPayload {
  status: AdminUserStatus | string;
  reason?: string;
}

export interface UpdateUserStatusResult {
  id: string;
  status: string;
  refreshTokensRevoked: boolean;
  updatedAt: string;
}

// ==========================================
// 3. COMPANIES
// ==========================================

export type AdminCompanyVerificationStatus =
  | "Pending"
  | "Verified"
  | "Rejected";

export interface AdminCompanyOwner {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export interface AdminCompanyItem {
  id: string;
  name: string;
  taxCode: string;
  email: string;
  phone: string;
  address?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  verificationStatus: AdminCompanyVerificationStatus | string;
  verifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  owner?: AdminCompanyOwner | null;
}

export interface AdminCompanyDetail extends AdminCompanyItem {
  description?: string | null;
  memberCount: number;
  jobPostingCount: number;
}

export interface AdminCompanyFilterParams {
  search?: string;
  verificationStatus?: AdminCompanyVerificationStatus | string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface ReviewCompanyVerificationPayload {
  verificationStatus: "Verified" | "Rejected" | string;
  reason?: string;
  rejectionReason?: string;
}

export interface ReviewCompanyVerificationResult {
  id: string;
  verificationStatus: string;
  verifiedAt?: string | null;
  updatedAt: string;
}

// ==========================================
// 4. JOB POSTINGS
// ==========================================

export type AdminJobModerationStatus =
  | "PendingReview"
  | "Published"
  | "Closed"
  | "Expired"
  | "Rejected";

export interface AdminJobPostingItem {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string | null;
  createdBy: string;
  title: string;
  status: AdminJobModerationStatus | string;
  provinceName: string;
  wardName?: string | null;
  vacancies: number;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryNegotiable: boolean;
  deadline?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminJobPostingFilterParams {
  search?: string;
  status?: AdminJobModerationStatus | string;
  companyId?: string;
  page?: number;
  pageSize?: number;
}

export interface ReviewJobModerationPayload {
  status: "Published" | "Rejected" | string;
  rejectionReason?: string;
}

export interface ReviewJobModerationResult {
  id: string;
  status: string;
  updatedAt: string;
}

// ==========================================
// 5. MASTER CATALOGS
// ==========================================

export interface AdminIndustryGroup extends IndustryGroupItem {
  industriesCount: number;
}

export interface AdminIndustry extends IndustryItem {
  groupId: string;
  groupName: string;
}

export interface AdminProvince extends ProvinceItem {
  wardsCount: number;
}

export interface AdminWard extends WardItem {
  provinceId: string;
  provinceName: string;
  isCommune: boolean;
}

export interface AdminSkill extends SkillItem {
  createdAt: string;
}

export interface AdminCvTemplateItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  version: string;
  language: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. ENVELOPE / PAGINATED WRAPPER
// ==========================================

export interface AdminPagedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ==========================================
// 7. SYSTEM ALERTS & NOTIFICATIONS
// ==========================================

export type AdminSystemAlertTarget = "SystemAll" | "Candidate" | "Recruiter";

export type AdminSystemAlertLevel = "general" | "info" | "warning" | "error";

export interface SendSystemAlertPayload {
  target?: AdminSystemAlertTarget;
  title: string;
  body: string;
  alertLevel?: AdminSystemAlertLevel;
}

export interface SendSystemAlertResponse {
  target: string;
  title: string;
  sentAt: string;
  message: string;
}
