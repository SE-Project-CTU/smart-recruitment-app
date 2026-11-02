// SmartHire Application Type Definitions
// Ánh xạ 1:1 với Backend C# DTOs và Enums trong SmartHire.Application.Features.Applications

// ==========================================
// STATUS ENUMS & TYPES
// ==========================================

/**
 * Trạng thái hồ sơ ứng tuyển theo enum SmartHire.Domain.Enums.ApplicationStatus
 */
export type ApplicationStatus =
  | "Submitted"
  | "Received"
  | "Approved"
  | "Reviewing"
  | "Shortlisted"
  | "Interviewing"
  | "Offered"
  | "Hired"
  | "Rejected"
  | "Withdrawn";

/**
 * Type alias tương thích ngược với code cũ (hỗ trợ cả uppercase)
 */
export type JobApplicationStatus =
  | ApplicationStatus
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
  | "Reviewing"
  | "Shortlisted"
  | "Interviewing"
  | "Offered"
  | "Hired"
  | "Rejected"
  | "Withdrawn"
  | "REVIEWING"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "OFFERED"
  | "HIRED"
  | "REJECTED"
  | "WITHDRAWN";

// ==========================================
// BACKEND SUB-MODELS (Ánh xạ 1:1 DTOs)
// ==========================================

export interface ApplicationCompanySummary {
  id: string;
  name: string;
  logoUrl?: string | null;
}

export interface ApplicationLocationSummary {
  id: string;
  name: string;
}

/**
 * Tóm tắt Job gắn với Application (Ánh xạ 1:1 ApplicationJobSummaryResult)
 */
export interface ApplicationJobSummary {
  id: string;
  title: string;
  company: ApplicationCompanySummary;
  province: ApplicationLocationSummary;
  ward?: ApplicationLocationSummary | null;
  experienceYears?: number | null;
  jobLevel?: string | null;
  workMode: string;
  jobType: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryNegotiable: boolean;
  deadline?: string | null;
  status: string;
}

/**
 * Thông tin ứng viên (Ánh xạ 1:1 ApplicationCandidateResult)
 */
export interface ApplicationCandidateResult {
  id: string;
  fullName: string;
  email: string;
  phone?: string | null;
  avatarUrl?: string | null;
}

export type CandidateItem = ApplicationCandidateResult;

// ==========================================
// CV SNAPSHOT DOCUMENTS (Ánh xạ 1:1 ValueObjects)
// ==========================================

export interface CvDocumentMetadata {
  version: string;
  templateCode: string;
  language: string;
  updatedAt: string;
}

export interface CvProfile {
  fullName: string;
  title: string;
  avatarUrl: string;
  email: string;
  phone: string;
  dob?: string;
  address?: string;
  website?: string;
  socialLink?: string;
}

export interface CvContentDocument {
  metadata?: CvDocumentMetadata;
  profile?: CvProfile;
  sections?: Record<string, unknown>;
}

export interface CvLayoutArea {
  id: string;
  sections: string[];
}

export interface CvLayoutDocument {
  version: string;
  areas: CvLayoutArea[];
}

export interface CvGlobalStyle {
  fontFamily: string;
  baseFontSize: number;
  primaryColor: string[];
  lineHeight: number;
}

export interface CvFieldStyle {
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  textAlign?: string | null;
  listStyle?: string | null;
}

export interface CvPresentationStyles {
  global?: CvGlobalStyle;
  fields?: Record<string, CvFieldStyle>;
}

export interface CvPresentationDocument {
  metadata?: {
    version: string;
    templateCode: string;
    updatedAt: string;
  };
  styles?: CvPresentationStyles;
}

/**
 * Snapshot CV tại thời điểm nộp hồ sơ (Ánh xạ 1:1 ApplicationCvSnapshotResult)
 */
export interface ApplicationCvSnapshotResult {
  versionId: string;
  cvId: string;
  templateId: string;
  versionNumber: number;
  language: string;
  content: CvContentDocument;
  layout: CvLayoutDocument;
  presentation: CvPresentationDocument;
  createdAt: string;
}

export type ApplicationCvSnapshot = ApplicationCvSnapshotResult;

// ==========================================
// CORE APPLICATION DTOS (Ánh xạ 1:1 C# DTOs)
// ==========================================

/**
 * Kết quả trả về sau khi Candidate nộp đơn ứng tuyển (Ánh xạ 1:1 ApplyJobResult)
 */
export interface ApplyJobResult {
  id: string;
  jobId: string;
  cvVersionId?: string | null;
  uploadedCvUrl?: string | null;
  coverLetter?: string | null;
  status: ApplicationStatus | string;
  appliedAt: string;
  updatedAt: string;
}

/**
 * Item trong danh sách đơn ứng tuyển của Candidate (Ánh xạ 1:1 MyApplicationListItemResult từ GET /api/v1/applications/me)
 */
export interface MyApplicationListItemResult {
  id: string;
  jobId: string;
  job: ApplicationJobSummary;
  cvVersionId?: string | null;
  uploadedCvUrl?: string | null;
  coverLetter?: string | null;
  status: ApplicationStatus | string;
  appliedAt: string;
  updatedAt: string;
}

/**
 * Item trong danh sách ứng viên theo tin tuyển dụng của HR (Ánh xạ 1:1 JobApplicationListItemResult từ GET /api/v1/job-postings/{id}/applications)
 */
export interface JobApplicationListItemResult {
  id: string;
  jobId: string;
  candidate: ApplicationCandidateResult;
  cvVersionId?: string | null;
  uploadedCvUrl?: string | null;
  coverLetter?: string | null;
  status: ApplicationStatus | string;
  appliedAt: string;
  updatedAt: string;
}

/**
 * Chi tiết đơn ứng tuyển đầy đủ (Ánh xạ 1:1 JobApplicationResult từ GET /api/v1/applications/{id})
 */
export interface JobApplicationResult {
  id: string;
  jobId: string;
  job: ApplicationJobSummary;
  candidate: ApplicationCandidateResult;
  cvVersionId?: string | null;
  uploadedCvUrl?: string | null;
  cvSnapshot?: ApplicationCvSnapshotResult | null;
  coverLetter?: string | null;
  status: ApplicationStatus | string;
  appliedAt: string;
  updatedAt: string;
}

export type JobApplicationDetail = JobApplicationResult;

// ==========================================
// STATUS HISTORY DTOS (Ánh xạ 1:1 C# DTOs)
// ==========================================

export interface ApplicationStatusHistoryActorResult {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role?: string | null;
}

export type ApplicationStatusHistoryActor = ApplicationStatusHistoryActorResult;

/**
 * Lịch sử thay đổi trạng thái (Ánh xạ 1:1 ApplicationStatusHistoryResult)
 */
export interface ApplicationStatusHistoryResult {
  id: string;
  applicationId: string;
  status: ApplicationStatus | string;
  changedBy: ApplicationStatusHistoryActorResult;
  note?: string | null;
  createdAt: string;

  // Compatibility fields
  oldStatus?: string | null;
  newStatus?: string;
  changedAt?: string;
}

export type ApplicationStatusHistoryItem = ApplicationStatusHistoryResult;

// ==========================================
// COMPATIBILITY INTERFACES
// ==========================================

/**
 * Unified JobApplicationItem: Tương thích cho toàn bộ các màn hình hiển thị đơn ứng tuyển
 */
export interface JobApplicationItem {
  id: string;
  jobId: string;
  job?: ApplicationJobSummary;
  candidate?: ApplicationCandidateResult;
  cvVersionId?: string | null;
  uploadedCvUrl?: string | null;
  cvSnapshot?: ApplicationCvSnapshotResult | null;
  coverLetter?: string | null;
  status: ApplicationStatus | string;
  appliedAt: string;
  updatedAt?: string;

  // Flattened candidate fields (phòng trường hợp mock/legacy adapter)
  candidateId?: string;
  candidateName?: string;
  candidateEmail?: string;
  candidateAvatarUrl?: string | null;
  candidatePhone?: string | null;
}

/**
 * CandidateMyApplicationItem: Mở rộng từ MyApplicationListItemResult với các thuộc tính flattened
 */
export interface CandidateMyApplicationItem extends Partial<MyApplicationListItemResult> {
  id: string;
  jobId: string;
  job?: ApplicationJobSummary;
  jobTitle?: string;
  companyId?: string;
  companyName?: string;
  companyLogoUrl?: string | null;
  salaryRange?: string;
  locationName?: string;
  cvVersionId?: string | null;
  uploadedCvUrl?: string | null;
  cvSnapshot?: ApplicationCvSnapshotResult | null;
  coverLetter?: string | null;
  status: ApplicationStatus | string;
  appliedAt: string;
  updatedAt?: string;
}

export interface RecruiterCandidateApplicationItem extends JobApplicationItem {
  jobTitle?: string;
  companyId?: string;
  companyName?: string;
}

// ==========================================
// REQUEST / PAYLOAD DTOS
// ==========================================

export interface ApplyJobPayload {
  cvVersionId?: string;
  uploadedCvFileId?: string;
  coverLetter?: string;
}

export interface UpdateApplicationStatusPayload {
  status: UpdateJobApplicationStatus;
  note?: string;
}

// ==========================================
// CONFIGURATIONS & MATRICES
// ==========================================

export const APPLICATION_STATUS_OPTIONS: {
  value: ApplicationStatus | "ALL";
  label: string;
}[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "Submitted", label: "Đã nộp hồ sơ" },
  { value: "Reviewing", label: "Đang xem xét" },
  { value: "Shortlisted", label: "Đã chọn lọc" },
  { value: "Interviewing", label: "Mời phỏng vấn" },
  { value: "Offered", label: "Mời nhận việc" },
  { value: "Hired", label: "Đã tuyển dụng" },
  { value: "Rejected", label: "Từ chối" },
  { value: "Withdrawn", label: "Rút hồ sơ" },
];

/**
 * Ma trận chuyển đổi trạng thái hợp lệ của HR (State Transition Matrix)
 * Tuân thủ chính xác theo logic SmartHire.Domain.Entities.JobApplication.TryChangeStatus
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<
  string,
  { value: UpdateJobApplicationStatus; label: string }[]
> = {
  // PascalCase chuẩn backend
  Submitted: [{ value: "Reviewing", label: "Đang xem xét" }],
  Received: [
    { value: "Shortlisted", label: "Vào danh sách chọn lọc" },
    { value: "Rejected", label: "Từ chối hồ sơ" },
  ],
  Approved: [
    { value: "Interviewing", label: "Mời phỏng vấn" },
    { value: "Rejected", label: "Từ chối hồ sơ" },
  ],
  Reviewing: [
    { value: "Shortlisted", label: "Vào danh sách chọn lọc" },
    { value: "Rejected", label: "Từ chối hồ sơ" },
  ],
  Shortlisted: [
    { value: "Interviewing", label: "Mời phỏng vấn" },
    { value: "Rejected", label: "Từ chối hồ sơ" },
  ],
  Interviewing: [
    { value: "Offered", label: "Gửi đề nghị việc làm" },
    { value: "Rejected", label: "Từ chối hồ sơ" },
  ],
  Offered: [
    { value: "Hired", label: "Tuyển dụng thành công" },
    { value: "Rejected", label: "Từ chối hồ sơ" },
  ],

  // Fallback uppercase tương thích
  SUBMITTED: [{ value: "REVIEWING", label: "Đang xem xét" }],
  RECEIVED: [
    { value: "SHORTLISTED", label: "Vào danh sách chọn lọc" },
    { value: "REJECTED", label: "Từ chối hồ sơ" },
  ],
  APPROVED: [
    { value: "INTERVIEW", label: "Mời phỏng vấn" },
    { value: "REJECTED", label: "Từ chối hồ sơ" },
  ],
  REVIEWING: [
    { value: "SHORTLISTED", label: "Vào danh sách chọn lọc" },
    { value: "REJECTED", label: "Từ chối hồ sơ" },
  ],
  SHORTLISTED: [
    { value: "INTERVIEW", label: "Mời phỏng vấn" },
    { value: "REJECTED", label: "Từ chối hồ sơ" },
  ],
  INTERVIEW: [
    { value: "OFFERED", label: "Gửi đề nghị việc làm" },
    { value: "REJECTED", label: "Từ chối hồ sơ" },
  ],
  INTERVIEWING: [
    { value: "OFFERED", label: "Gửi đề nghị việc làm" },
    { value: "REJECTED", label: "Từ chối hồ sơ" },
  ],
  OFFERED: [
    { value: "HIRED", label: "Tuyển dụng thành công" },
    { value: "REJECTED", label: "Từ chối hồ sơ" },
  ],

  // Terminal states: Kết thúc quy trình, không được phép chuyển tiếp nữa
  Hired: [],
  HIRED: [],
  Rejected: [],
  REJECTED: [],
  Withdrawn: [],
  WITHDRAWN: [],
};

/**
 * Cấu hình hiển thị nhãn và màu sắc badge trạng thái application
 */
export const APPLICATION_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  // PascalCase chuẩn backend
  Submitted: {
    label: "Đã nộp",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  Received: {
    label: "Đã tiếp nhận",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  Approved: {
    label: "Đã duyệt",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  Reviewing: {
    label: "Đang xem xét",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  Shortlisted: {
    label: "Đã chọn lọc",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  Interviewing: {
    label: "Phỏng vấn",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  Offered: {
    label: "Mời nhận việc",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  Hired: {
    label: "Đã tuyển dụng",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  Rejected: {
    label: "Từ chối",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  Withdrawn: {
    label: "Đã rút hồ sơ",
    badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },

  // Fallback uppercase tương thích
  SUBMITTED: {
    label: "Đã nộp",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  RECEIVED: {
    label: "Đã tiếp nhận",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  APPROVED: {
    label: "Đã duyệt",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  APPLIED: {
    label: "Đã nộp",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  REVIEWING: {
    label: "Đang xem xét",
    badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
  },
  SHORTLISTED: {
    label: "Đã chọn lọc",
    badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  INTERVIEW: {
    label: "Phỏng vấn",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  INTERVIEWING: {
    label: "Phỏng vấn",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
  },
  OFFERED: {
    label: "Mời nhận việc",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
  },
  HIRED: {
    label: "Đã tuyển dụng",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  REJECTED: {
    label: "Từ chối",
    badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
  },
  WITHDRAWN: {
    label: "Đã rút hồ sơ",
    badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200",
  },
};

// ==========================================
// CANDIDATE PROFILE RESOLVER HELPER
// ==========================================

export interface CandidateResolvedProfile {
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

export function resolveCandidateProfile(
  app: JobApplicationItem,
): CandidateResolvedProfile {
  const name = app.candidate?.fullName || app.candidateName || "Ứng viên";
  const email =
    app.candidate?.email || app.candidateEmail || "Chưa cập nhật email";
  const avatarUrl = app.candidate?.avatarUrl || app.candidateAvatarUrl || null;
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(-2)
      .map((w) => w[0].toUpperCase())
      .join("") || "UV";

  return {
    name,
    email,
    avatarUrl,
    initials,
  };
}
