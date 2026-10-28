import type {
  JobApplicationItem,
  JobApplicationStatus,
  UpdateJobApplicationStatus,
} from "./job";

export const APPLICATION_STATUS_OPTIONS: {
  value: JobApplicationStatus | "ALL";
  label: string;
}[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "SUBMITTED", label: "Đã nộp hồ sơ" },
  { value: "REVIEWING", label: "Đang xem xét" },
  { value: "SHORTLISTED", label: "Đã chọn lọc" },
  { value: "INTERVIEW", label: "Mời phỏng vấn" },
  { value: "OFFERED", label: "Mời nhận việc" },
  { value: "HIRED", label: "Đã tuyển dụng" },
  { value: "REJECTED", label: "Từ chối" },
  { value: "WITHDRAWN", label: "Rút hồ sơ" },
];

/**
 * Ma trận chuyển đổi trạng thái hợp lệ của HR (State Transition Matrix)
 * Tuân thủ chính xác theo logic SmartHire.Domain.Entities.JobApplication.TryChangeStatus
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<
  string,
  { value: UpdateJobApplicationStatus; label: string }[]
> = {
  SUBMITTED: [{ value: "REVIEWING", label: "Đang xem xét" }],
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
  RECEIVED: [
    { value: "SHORTLISTED", label: "Vào danh sách chọn lọc" },
    { value: "REJECTED", label: "Từ chối hồ sơ" },
  ],
  APPROVED: [
    { value: "INTERVIEW", label: "Mời phỏng vấn" },
    { value: "REJECTED", label: "Từ chối hồ sơ" },
  ],
  // Terminal states: Kết thúc quy trình, không được phép chuyển tiếp nữa
  HIRED: [],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

//label hiển thị trạng thái application bên phía nhà tuyển dụng, sẽ cần thay đổi từ ngữ để phù hợp ngữ cảnh hơn ở phía candidate
export const APPLICATION_STATUS_CONFIG: Record<
  string,
  { label: string; badgeClass: string }
> = {
  SUBMITTED: {
    label: "Đã nộp",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
  },
  RECEIVED: {
    label: "Đã tiếp nhận",
    badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
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
  ACCEPTED: {
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

/**
 * Thông tin ứng viên sau khi resolve từ dữ liệu thực tế
 */
export interface CandidateResolvedProfile {
  name: string;
  email: string;
  avatarUrl: string | null;
  initials: string;
}

/**
 * Resolver lấy thông tin Tên, Email, Avatar của ứng viên từ API backend
 */
export function resolveCandidateProfile(
  app: JobApplicationItem,
): CandidateResolvedProfile {
  // 1. Lấy trực tiếp từ object candidate (backend: { id, fullName, email, avatarUrl })
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

export interface ApplicationJobSummary {
  id: string;
  title: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
  };
  province: {
    id: string;
    name: string;
  };
  ward?: {
    id: string;
    name: string;
  } | null;
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

export interface ApplicationCvSnapshot {
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

/**
 * Đơn ứng tuyển của ứng viên (sau khi được enrich thông tin JD và Doanh nghiệp)
 */
export interface CandidateMyApplicationItem {
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
  cvSnapshot?: ApplicationCvSnapshot | null;
  coverLetter?: string | null;
  status: JobApplicationStatus | string;
  appliedAt: string;
  updatedAt?: string;
}

export interface ApplicationStatusHistoryActor {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string | null;
  role?: string | null;
}

/**
 * Lịch sử thay đổi trạng thái của đơn ứng tuyển
 */
export interface ApplicationStatusHistoryItem {
  id: string;
  applicationId: string;
  oldStatus?: string | null;
  newStatus?: string;
  status?: string;
  note?: string | null;
  changedBy?: ApplicationStatusHistoryActor | string | null;
  changedAt?: string;
  createdAt?: string;
}

/**
 * Payload nộp hồ sơ ứng tuyển
 */
export interface ApplyJobPayload {
  cvVersionId?: string;
  uploadedCvFileId?: string;
  coverLetter?: string;
}
