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
  { value: "SUBMITTED", label: "Đã nộp hồ sơ (Submitted)" },
  { value: "REVIEWING", label: "Đang xem xét (Reviewing)" },
  { value: "SHORTLISTED", label: "Đã chọn lọc (Shortlisted)" },
  { value: "INTERVIEW", label: "Mời phỏng vấn (Interviewing)" },
  { value: "OFFERED", label: "Mời nhận việc (Offered)" },
  { value: "HIRED", label: "Đã tuyển dụng (Hired)" },
  { value: "REJECTED", label: "Từ chối (Rejected)" },
  { value: "WITHDRAWN", label: "Rút hồ sơ (Withdrawn)" },
];

/**
 * Ma trận chuyển đổi trạng thái hợp lệ của HR (State Transition Matrix)
 * Tuân thủ chính xác theo logic SmartHire.Domain.Entities.JobApplication.TryChangeStatus
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<
  string,
  { value: UpdateJobApplicationStatus; label: string }[]
> = {
  SUBMITTED: [{ value: "REVIEWING", label: "Đang xem xét (Reviewing)" }],
  REVIEWING: [
    { value: "SHORTLISTED", label: "Vào danh sách chọn lọc (Shortlisted)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  SHORTLISTED: [
    { value: "INTERVIEW", label: "Mời phỏng vấn (Interviewing)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  INTERVIEW: [
    { value: "OFFERED", label: "Gửi đề nghị việc làm (Offered)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  INTERVIEWING: [
    { value: "OFFERED", label: "Gửi đề nghị việc làm (Offered)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  OFFERED: [
    { value: "HIRED", label: "Tuyển dụng thành công (Hired)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  RECEIVED: [
    { value: "SHORTLISTED", label: "Vào danh sách chọn lọc (Shortlisted)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  APPROVED: [
    { value: "INTERVIEW", label: "Mời phỏng vấn (Interviewing)" },
    { value: "REJECTED", label: "Từ chối hồ sơ (Rejected)" },
  ],
  // Terminal states: Kết thúc quy trình, không được phép chuyển tiếp nữa
  HIRED: [],
  ACCEPTED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

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

/**
 * Đơn ứng tuyển của ứng viên (sau khi được enrich thông tin JD và Doanh nghiệp)
 */
export interface CandidateMyApplicationItem {
  id: string;
  jobId: string;
  jobTitle?: string;
  companyId?: string;
  companyName?: string;
  companyLogoUrl?: string | null;
  salaryRange?: string;
  locationName?: string;
  cvVersionId?: string | null;
  uploadedCvUrl?: string | null;
  coverLetter?: string | null;
  status: JobApplicationStatus | string;
  appliedAt: string;
  updatedAt?: string;
}

/**
 * Lịch sử thay đổi trạng thái của đơn ứng tuyển
 */
export interface ApplicationStatusHistoryItem {
  id: string;
  applicationId: string;
  oldStatus?: string | null;
  newStatus: string;
  note?: string | null;
  changedAt: string;
}

/**
 * Payload nộp hồ sơ ứng tuyển
 */
export interface ApplyJobPayload {
  cvVersionId?: string;
  uploadedCvFileId?: string;
  coverLetter?: string;
}
