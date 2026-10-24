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
  companyId: string;
  createdBy: string;
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
  status: JobPostingStatus;
  industryIds: string[];
  skillIds: string[];
  createdAt: string;
  updatedAt: string;
}
