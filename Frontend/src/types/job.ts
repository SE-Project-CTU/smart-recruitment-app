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

export type JobType =
  "FullTime" | "PartTime" | "Contract" | "Internship" | "Freelance";

export type WorkMode = "Remote" | "Onsite" | "Hybrid";

export type JobPostingStatus =
  "Draft" | "PendingReview" | "Published" | "Closed" | "Expired" | "Rejected";

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

export interface SearchJobPostingsRequest {
  keyword?: string;
  company?: string;
  salaryMin?: number;
  salaryMax?: number;
  provinceId?: string;
  wardId?: string;
  jobLevel?: JobLevel;
  jobType?: "FullTime" | "PartTime" | "Contract" | "Internship" | "Freelance";
  workMode?: "Remote" | "Onsite" | "Hybrid";
  experienceYears?: number;
  page?: number;
  pageSize?: number;
  sort?: "createdAt" | "salaryMax";
  direction?: "asc" | "desc";
}

export interface JobPostingItem {
  id: string;
  companyId?: string;
  companyName?: string;
  companyLogoUrl?: string | null;
  company?: {
    id: string;
    name: string;
    address?: string;
    logoUrl?: string | null;
  };
  createdBy?: string;
  creator?: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
  };
  title: string;
  provinceId?: string;
  province?: {
    id: string;
    name: string;
    code?: string;
  };
  wardId?: string | null;
  ward?: {
    id: string;
    name: string;
    code?: string;
  };
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
  status: JobPostingStatus | string;
  industryIds?: string[];
  industries?: {
    id: string;
    name: string;
  }[];
  skills?: {
    id: string;
    name: string;
    category?: string;
  }[];
  skillIds?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface JobPostingSearchItem {
  id: string;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string;
  title: string;
  provinceId: string;
  wardId?: string | null;
  experienceYears?: number;
  jobLevel?: JobLevel | string | null;
  workMode: WorkMode | string;
  jobType: JobType | string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryNegotiable: boolean;
  deadline: string;
  status: JobPostingStatus | string;
  createdAt: string;
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

export type JobApplicationStatus =
  | "SUBMITTED"
  | "RECEIVED"
  | "APPROVED"
  | "REVIEWING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "INTERVIEWING"
  | "OFFERED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export type UpdateJobApplicationStatus =
  | "REVIEWING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFERED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

export interface CandidateItem {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface JobApplicationItem {
  id: string;
  jobId: string;
  candidateId?: string;
  candidate?: CandidateItem;
  candidateName?: string;
  candidateEmail?: string;
  candidateAvatarUrl?: string;
  candidatePhone?: string;
  cvVersionId?: string | null;
  uploadedCvUrl?: string | null;
  coverLetter?: string | null;
  status: JobApplicationStatus | string;
  appliedAt: string;
  updatedAt?: string;
}

export interface UpdateApplicationStatusPayload {
  status: UpdateJobApplicationStatus | string;
  note?: string;
}

export const JOB_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  OPEN: {
    label: "Đang nhận hồ sơ",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Published: {
    label: "Đang nhận hồ sơ",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PUBLISHED: {
    label: "Đang nhận hồ sơ",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  PAUSED: {
    label: "Tạm dừng",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  CLOSED: {
    label: "Đã đóng",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  Closed: {
    label: "Đã đóng",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  EXPIRED: {
    label: "Hết hạn",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  Expired: {
    label: "Hết hạn",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  PendingReview: {
    label: "Chờ duyệt",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  PENDING_REVIEW: {
    label: "Chờ duyệt",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  Draft: {
    label: "Bản nháp",
    badgeClass: "bg-slate-100 text-slate-500 border-slate-200",
  },
};
