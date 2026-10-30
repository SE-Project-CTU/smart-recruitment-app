// =========================================================================
// SmartHire Job & JobPosting Type Definitions
// =========================================================================

import type {
  ProvinceSummary,
  WardSummary,
  IndustrySummary,
  SkillSummary,
  SearchJobProvinceSummary,
  SearchJobWardSummary,
} from "./common";

export type JobPostingStatus =
  "PendingReview" | "Published" | "Closed" | "Expired";

export type JobType =
  "FullTime" | "PartTime" | "Contract" | "Internship" | "Freelance";

export type WorkMode = "Remote" | "Onsite" | "Hybrid";

export type JobLevel =
  | "Staff"
  | "TeamLead"
  | "Supervisor"
  | "DepartmentHead"
  | "BranchManager"
  | "DeputyDirector"
  | "Director"
  | "Executive"
  | "Intern";

export type EducationLevel =
  | "NoRequirement"
  | "BelowHighSchool"
  | "HighSchool"
  | "Vocational"
  | "College"
  | "Bachelor"
  | "Postgraduate";

// -------------------------------------------------------------------------
// 2. COMMON SUMMARY RECORDS (Tinh gọn, tránh trùng lặp model)
// -------------------------------------------------------------------------

/**
 * Tóm tắt Doanh nghiệp tuyển dụng trong tin tuyển dụng
 */
export interface CompanySummary {
  id: string;
  name: string;
  address?: string | null;
  logoUrl?: string | null;
  logoFileUrl?: string | null;
  verificationStatus?: string | null;
}

export type SearchJobCompanySummary = CompanySummary;

/**
 * Thông tin Người tạo tin (Recruiter Membership)
 */
export interface JobPostingCreatorResult {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

// -------------------------------------------------------------------------
// -------------------------------------------------------------------------

/**
 * DTO tin tuyển dụng tiêu chuẩn (Dùng cho Create, Update, Company JobList)
 */
export interface JobPostingResult {
  id: string;
  company: CompanySummary;
  creator: JobPostingCreatorResult;
  title: string;
  province: ProvinceSummary;
  ward?: WardSummary | null;
  detailedLocation?: string | null;
  experienceYears?: number | null;
  jobLevel?: JobLevel | string | null;
  educationLevel?: EducationLevel | string | null;
  vacancies: number;
  workMode: WorkMode | string;
  jobType: JobType | string;
  description: string;
  requirements: string;
  benefits?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryNegotiable: boolean;
  deadline?: string | null;
  status: JobPostingStatus | string;
  industries: IndustrySummary[];
  skills: SkillSummary[];
  createdAt: string;
  updatedAt: string;

  // Flattened helpers tiện ích cho component
  companyId?: string;
  companyName?: string;
  companyLogoUrl?: string | null;
  provinceId?: string;
  wardId?: string | null;
}

/**
 * DTO chi tiết tin tuyển dụng xem bởi người dùng (API 6)
 */
export interface JobPostingDetailResult extends JobPostingResult {
  hasApplied: boolean;
  applicationId?: string | null;
  isFollowingCompany: boolean;
}

/**
 * DTO tóm tắt tối ưu cho danh sách Tìm kiếm việc làm công khai (API 5)
 */
export interface JobPostingSearchItem {
  id: string;
  company: SearchJobCompanySummary;
  title: string;
  province: SearchJobProvinceSummary;
  ward?: SearchJobWardSummary | null;
  experienceYears?: number | null;
  jobLevel?: JobLevel | string | null;
  workMode: WorkMode | string;
  jobType: JobType | string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryNegotiable: boolean;
  deadline?: string | null;
  status: JobPostingStatus | string;
  skillNames: string[];
  industryNames: string[];
  createdAt: string;
}

/**
 * DTO kết quả đổi trạng thái tin tuyển dụng (API 8)
 */
export interface UpdateJobPostingStatusResult {
  id: string;
  status: JobPostingStatus | string;
  updatedAt: string;
}

// -------------------------------------------------------------------------
// 4. TRANSITIONAL COMPATIBILITY DTO
// -------------------------------------------------------------------------

/**
 * @deprecated Khuyến nghị chuyển dần sang JobPostingResult / JobPostingDetailResult / JobPostingSearchItem.
 * Interface hợp nhất hỗ trợ các component hiện tại chưa refactor xong.
 */
export interface JobPostingItem extends Partial<JobPostingDetailResult> {
  id: string;
  title: string;
  workMode: WorkMode | string;
  jobType: JobType | string;
  salaryNegotiable: boolean;
  status: JobPostingStatus | string;
  createdAt: string;

  // Flattened helpers cho các component giao diện cũ
  companyId?: string;
  companyName?: string;
  companyLogoUrl?: string | null;
  createdBy?: string;
  provinceId?: string;
  wardId?: string | null;
  skillIds?: string[];
  industryIds?: string[];
}

// -------------------------------------------------------------------------
// -------------------------------------------------------------------------

/**
 * Payload tạo tin tuyển dụng mới (API 4)
 */
export interface CreateJobPostingPayload {
  companyId: string;
  title: string;
  provinceId: string;
  wardId?: string | null;
  detailedLocation?: string | null;
  experienceYears: number;
  jobLevel: JobLevel;
  educationLevel: EducationLevel;
  vacancies: number;
  workMode: WorkMode;
  jobType: JobType;
  description: string;
  requirements: string;
  benefits?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryNegotiable: boolean;
  deadline: string;
  industryIds: string[];
  skillIds: string[];
}

/**
 * Payload cập nhật tin tuyển dụng (API 7)
 */
export interface UpdateJobPostingPayload {
  title?: string;
  provinceId?: string;
  wardId?: string | null;
  detailedLocation?: string | null;
  experienceYears?: number;
  jobLevel?: JobLevel;
  educationLevel?: EducationLevel | string;
  vacancies?: number;
  workMode?: WorkMode;
  jobType?: JobType;
  description?: string;
  requirements?: string;
  benefits?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryNegotiable?: boolean;
  deadline?: string;
  industryIds?: string[];
  skillIds?: string[];
}

/**
 * Payload cập nhật trạng thái tin tuyển dụng (API 8)
 */
export interface UpdateJobPostingStatusPayload {
  status: JobPostingStatus;
}

/**
 * Query params tìm kiếm và lọc tin tuyển dụng (API 5)
 */
export interface SearchJobPostingsRequest {
  keyword?: string;
  company?: string;
  companyId?: string;
  salaryMin?: number;
  salaryMax?: number;
  provinceId?: string;
  wardId?: string;
  jobLevel?: JobLevel;
  jobType?: JobType;
  workMode?: WorkMode;
  experienceYears?: number;
  page?: number;
  pageSize?: number;
  sort?: "createdAt" | "salaryMax";
  direction?: "asc" | "desc";
}

// -------------------------------------------------------------------------
// 6. UI STATUS BADGE CONFIGURATION
// -------------------------------------------------------------------------

export const JOB_STATUS_CONFIG: Record<
  JobPostingStatus | string,
  { label: string; badgeClass: string }
> = {
  Published: {
    label: "Đang nhận hồ sơ",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PendingReview: {
    label: "Chờ duyệt",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  Closed: {
    label: "Đã đóng",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  Expired: {
    label: "Hết hạn",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },

  // Fallbacks chữ hoa tương thích code cũ
  PUBLISHED: {
    label: "Đang nhận hồ sơ",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  CLOSED: {
    label: "Đã đóng",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  PENDING_REVIEW: {
    label: "Chờ duyệt",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  EXPIRED: {
    label: "Hết hạn",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
};

// -------------------------------------------------------------------------
// 7. RE-EXPORTS (Cảnh báo: Nên import trực tiếp từ "@/types/application")
// -------------------------------------------------------------------------

export type {
  ApplicationStatus,
  JobApplicationStatus,
  UpdateJobApplicationStatus,
  CandidateItem,
  JobApplicationItem,
  UpdateApplicationStatusPayload,
  RecruiterCandidateApplicationItem,
  CandidateMyApplicationItem,
} from "./application";
