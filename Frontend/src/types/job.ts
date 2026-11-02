// SmartHire Job & JobPosting Type Definitions
// Ánh xạ 1:1 với Backend C# DTOs và Enums trong SmartHire.Application.Features.JobPostings

export type JobPostingStatus =
  | "PendingReview"
  | "Published"
  | "Closed"
  | "Expired";

export type JobType =
  | "FullTime"
  | "PartTime"
  | "Contract"
  | "Internship"
  | "Freelance";

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

// ==========================================
// BACKEND SUMMARY MODELS (Ánh xạ 1:1 DTOs)
// ==========================================

export interface CompanySummary {
  id: string;
  name: string;
  address?: string | null;
  logoUrl?: string | null;
}

export interface JobPostingCreatorResult {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface ProvinceSummary {
  id: string;
  name: string;
}

export interface WardSummary {
  id: string;
  name: string;
}

export interface IndustrySummary {
  id: string;
  name: string;
}

export interface SkillSummary {
  id: string;
  name: string;
}

export interface SearchJobCompanySummary {
  id: string;
  name: string;
  logoFileUrl?: string | null;
}

export interface SearchJobProvinceSummary {
  id: string;
  name: string;
}

export interface SearchJobWardSummary {
  id: string;
  name: string;
}

// ==========================================
// JOB POSTING CORE DTOS (Ánh xạ 1:1 DTOs C#)
// ==========================================

/**
 * Ánh xạ 1:1 với SmartHire.Application.Features.JobPostings.DTOs.JobPostingResult
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
}

/**
 * Ánh xạ 1:1 với SmartHire.Application.Features.JobPostings.DTOs.JobPostingDetailResult
 */
export interface JobPostingDetailResult extends JobPostingResult {
  hasApplied: boolean;
  applicationId?: string | null;
  isFollowingCompany: boolean;
}

/**
 * Ánh xạ 1:1 với SmartHire.Application.Features.JobPostings.DTOs.JobPostingSearchItem
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

  // Flattened compatibility properties (hỗ trợ component dùng nhanh)
  companyId?: string;
  companyName?: string;
  companyLogoUrl?: string | null;
  provinceId?: string;
  wardId?: string | null;
}

/**
 * JobPostingItem: Tương thích mở rộng từ JobPostingResult, hỗ trợ cả nested và flattened fields
 */
export interface JobPostingItem extends Partial<JobPostingResult> {
  id: string;
  title: string;
  workMode: WorkMode | string;
  jobType: JobType | string;
  salaryNegotiable: boolean;
  vacancies?: number;
  status: JobPostingStatus | string;
  createdAt: string;

  // Nested structures (khớp 1:1 backend)
  company?: CompanySummary;
  creator?: JobPostingCreatorResult;
  province?: ProvinceSummary;
  ward?: WardSummary | null;
  industries?: IndustrySummary[];
  skills?: SkillSummary[];

  // Flattened compatibility helpers
  companyId?: string;
  companyName?: string;
  companyLogoUrl?: string | null;
  createdBy?: string;
  provinceId?: string;
  wardId?: string | null;
  skillIds?: string[];
  industryIds?: string[];

  // Candidate context flags (có khi gọi GetDetail)
  hasApplied?: boolean;
  applicationId?: string | null;
  isFollowingCompany?: boolean;
}

// ==========================================
// REQUEST / PAYLOAD DTOS
// ==========================================

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

export interface UpdateJobPostingStatusPayload {
  status: JobPostingStatus;
}

export interface SearchJobPostingsRequest {
  keyword?: string;
  company?: string;
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

// ==========================================
// STATUS CONFIGURATION
// ==========================================

export const JOB_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  // PascalCase chuẩn backend
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

  // Fallback uppercase & alias tương thích
  PUBLISHED: {
    label: "Đang nhận hồ sơ",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  OPEN: {
    label: "Đang nhận hồ sơ",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PENDING_REVIEW: {
    label: "Chờ duyệt",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  PAUSED: {
    label: "Tạm dừng",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  CLOSED: {
    label: "Đã đóng",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  EXPIRED: {
    label: "Hết hạn",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  Draft: {
    label: "Bản nháp",
    badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

// ==========================================
// RE-EXPORTS (Tương thích ngược cho các file import application types từ job.ts)
// ==========================================

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