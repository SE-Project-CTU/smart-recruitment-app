import type {
  EducationLevel,
  JobLevel,
  JobPostingStatus,
  JobType,
  WorkMode,
} from "@/types";
import { getTimeAgo } from "./helper";
import type { AnyJob } from "@/stores/applyJobModalStore";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
}

// JobType: Hình thức làm việc (Employment Type)
export const JOB_TYPE_OPTIONS: SelectOption<JobType>[] = [
  { value: "FullTime", label: "FullTime" },
  { value: "PartTime", label: "PartTime" },
  { value: "Contract", label: "Contract" },
  { value: "Internship", label: "Thực tập" },
  { value: "Freelance", label: "Tự do" },
];

// WorkMode: Môi trường / Chế độ làm việc (Work Location)
export const WORK_MODE_OPTIONS: SelectOption<WorkMode>[] = [
  { value: "Onsite", label: "Onsite" },
  { value: "Hybrid", label: "Hybrid" },
  { value: "Remote", label: "Remote" },
];

// JobLevel dịch sang tiếng Việt
export const JOB_LEVEL_OPTIONS: SelectOption<JobLevel>[] = [
  { value: "Intern", label: "Thực tập sinh" },
  { value: "Staff", label: "Nhân viên" },
  { value: "TeamLead", label: "Trưởng nhóm" },
  { value: "Supervisor", label: "Giám sát viên" },
  { value: "DepartmentHead", label: "Trưởng phòng" },
  { value: "BranchManager", label: "Giám đốc chi nhánh" },
  { value: "DeputyDirector", label: "Phó giám đốc" },
  { value: "Director", label: "Giám đốc" },
  { value: "Executive", label: "Lãnh đạo cấp cao" },
];

// EducationLevel dịch sang tiếng Việt
export const EDUCATION_LEVEL_OPTIONS: SelectOption<EducationLevel>[] = [
  { value: "NoRequirement", label: "Không yêu cầu bằng cấp" },
  { value: "BelowHighSchool", label: "Dưới trung học" },
  { value: "HighSchool", label: "Tốt nghiệp THPT" },
  { value: "Vocational", label: "Trung cấp nghề" },
  { value: "College", label: "Cao đẳng" },
  { value: "Bachelor", label: "Đại học (Cử nhân)" },
  { value: "Postgraduate", label: "Sau đại học (Thạc sĩ, Tiến sĩ)" },
];

/**
 * Chuẩn hóa chuỗi raw thành JobType hợp lệ (FullTime, PartTime...)
 */
export function normalizeJobType(raw?: string | null): JobType | null {
  if (!raw) return null;
  const clean = raw
    .trim()
    .toLowerCase()
    .replace(/[_\-\s]/g, "");
  switch (clean) {
    case "fulltime":
      return "FullTime";
    case "parttime":
      return "PartTime";
    case "contract":
      return "Contract";
    case "internship":
    case "intern":
      return "Internship";
    case "freelance":
      return "Freelance";
    default:
      return null;
  }
}

/**
 * Chuẩn hóa chuỗi raw thành WorkMode hợp lệ (Onsite, Hybrid, Remote)
 */
export function normalizeWorkMode(raw?: string | null): WorkMode | null {
  if (!raw) return null;
  const clean = raw
    .trim()
    .toLowerCase()
    .replace(/[_\-\s]/g, "");
  switch (clean) {
    case "onsite":
      return "Onsite";
    case "hybrid":
      return "Hybrid";
    case "remote":
      return "Remote";
    default:
      return null;
  }
}

/**
 * Giải quyết Hình thức làm việc (Employment Type) bất kể Backend có hoán đổi giữa jobType và workMode
 */
export function resolveJobType(
  job?: {
    jobType?: string | null;
    workMode?: string | null;
  } | null,
): JobType {
  const fromJobType = normalizeJobType(job?.jobType);
  if (fromJobType) return fromJobType;

  const fromWorkMode = normalizeJobType(job?.workMode);
  if (fromWorkMode) return fromWorkMode;

  return "FullTime";
}

/**
 * Giải quyết Môi trường làm việc (Work Location) bất kể Backend có hoán đổi giữa jobType và workMode
 */
export function resolveWorkMode(
  job?: {
    jobType?: string | null;
    workMode?: string | null;
  } | null,
): WorkMode {
  const fromWorkMode = normalizeWorkMode(job?.workMode);
  if (fromWorkMode) return fromWorkMode;

  const fromJobType = normalizeWorkMode(job?.jobType);
  if (fromJobType) return fromJobType;

  return "Onsite";
}

/**
 * Chuẩn hóa Cấp bậc (JobLevel) từ chuỗi hoa/thường/snake_case của API
 */
export function normalizeJobLevel(raw?: string | null): JobLevel {
  if (!raw) return "Staff";
  const clean = raw
    .trim()
    .toLowerCase()
    .replace(/[_\-\s]/g, "");
  switch (clean) {
    case "intern":
      return "Intern";
    case "staff":
      return "Staff";
    case "teamlead":
      return "TeamLead";
    case "supervisor":
      return "Supervisor";
    case "departmenthead":
      return "DepartmentHead";
    case "branchmanager":
      return "BranchManager";
    case "deputydirector":
      return "DeputyDirector";
    case "director":
      return "Director";
    case "executive":
      return "Executive";
    default:
      return "Staff";
  }
}

/**
 * Chuẩn hóa Trình độ học vấn (EducationLevel) từ API
 */
export function normalizeEducationLevel(raw?: string | null): EducationLevel {
  if (!raw) return "Bachelor";
  const clean = raw
    .trim()
    .toLowerCase()
    .replace(/[_\-\s]/g, "");
  switch (clean) {
    case "norequirement":
      return "NoRequirement";
    case "belowhighschool":
      return "BelowHighSchool";
    case "highschool":
      return "HighSchool";
    case "vocational":
      return "Vocational";
    case "college":
      return "College";
    case "bachelor":
      return "Bachelor";
    case "postgraduate":
      return "Postgraduate";
    default:
      return "Bachelor";
  }
}

export function getWorkModeLabel(value?: string | null): string {
  if (!value) return "Chưa xác định";
  const mode = normalizeWorkMode(value);
  if (mode) {
    const found = WORK_MODE_OPTIONS.find((item) => item.value === mode);
    if (found) return found.label;
  }
  // Kiểm tra nếu value là JobType bị truyền nhầm
  const type = normalizeJobType(value);
  if (type) {
    const found = JOB_TYPE_OPTIONS.find((item) => item.value === type);
    if (found) return found.label;
  }
  return value;
}

export function getJobTypeLabel(value?: string | null): string {
  if (!value) return "Chưa xác định";
  const type = normalizeJobType(value);
  if (type) {
    const found = JOB_TYPE_OPTIONS.find((item) => item.value === type);
    if (found) return found.label;
  }
  // Kiểm tra nếu value là WorkMode bị truyền nhầm
  const mode = normalizeWorkMode(value);
  if (mode) {
    const found = WORK_MODE_OPTIONS.find((item) => item.value === mode);
    if (found) return found.label;
  }
  return value;
}

export function getJobLevelLabel(value?: string | null): string {
  if (!value) return "Chưa xác định";
  const level = normalizeJobLevel(value);
  const found = JOB_LEVEL_OPTIONS.find((item) => item.value === level);
  return found ? found.label : value;
}

export function getEducationLevelLabel(value?: string | null): string {
  if (!value) return "Chưa xác định";
  const edu = normalizeEducationLevel(value);
  const found = EDUCATION_LEVEL_OPTIONS.find((item) => item.value === edu);
  return found ? found.label : value;
}

export function formatSalaryRange(
  min?: number | null,
  max?: number | null,
  isNegotiable?: boolean,
): string {
  const formatVnd = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);

  if (isNegotiable) {
    if (min == null && max == null) return "Thỏa thuận";
    if (min != null && max != null)
      return `${formatVnd(min)} - ${formatVnd(max)} (Thương lượng)`;
    if (min != null) return `Từ ${formatVnd(min)} (Thương lượng)`;
    if (max != null) return `Lên tới ${formatVnd(max)} (Thương lượng)`;
  }

  if (min == null && max == null) return "Thỏa thuận";
  if (min != null && max != null)
    return `${formatVnd(min)} - ${formatVnd(max)}`;
  if (min != null) return `Từ ${formatVnd(min)}`;
  if (max != null) return `Lên tới ${formatVnd(max)}`;
  return "Thỏa thuận";
}

export const formatSalary = formatSalaryRange;

export function getJobStatusBadge(status?: JobPostingStatus | string): {
  label: string;
  variant: "success" | "warning" | "error" | "info" | "neutral";
} {
  switch (status?.toLowerCase()) {
    case "published":
    case "open":
      return { label: "Đang mở", variant: "success" };
    case "pendingreview":
    case "pending_review":
      return { label: "Chờ phê duyệt", variant: "warning" };
    case "closed":
      return { label: "Đã đóng", variant: "neutral" };
    case "expired":
      return { label: "Hết hạn", variant: "error" };
    case "rejected":
      return { label: "Từ chối", variant: "error" };
    case "draft":
    default:
      return { label: "Bản nháp", variant: "neutral" };
  }
}

/**
 * Chuyển đổi số tiền lương (VND) sang đơn vị triệu đồng dạng số
 */
export function toMillion(val?: number | null): number {
  if (!val) return 0;
  return val >= 1000 ? val / 1_000_000 : val;
}

/**
 * Định dạng số tiền (VND hoặc triệu) thành chuỗi hiển thị số triệu (ví dụ: "10", "15.5")
 */
export function formatMillion(val?: number | null): string {
  if (val == null) return "0";
  const m = toMillion(val);
  return Number.isInteger(m) ? m.toString() : m.toFixed(1).replace(/\.0$/, "");
}

/**
 * Kiểm tra xem tin tuyển dụng có phải mức lương thỏa thuận hay không
 */
export function isSalaryNegotiable(
  salaryMin?: number | null,
  salaryMax?: number | null,
  salaryNegotiable?: boolean | null,
): boolean {
  return Boolean(salaryNegotiable) || (salaryMin == null && salaryMax == null);
}

export interface CompactSalaryInfo {
  text: string;
  unit: string;
  fullText: string;
}

/**
 * Định dạng mức lương rút gọn theo triệu đồng (ví dụ: "15 - 20 triệu", "Từ 10 triệu", "Thỏa thuận")
 */
export function formatSalaryCompact(
  min?: number | null,
  max?: number | null,
  negotiable?: boolean | null,
): CompactSalaryInfo {
  if (isSalaryNegotiable(min, max, negotiable)) {
    return { text: "Thỏa thuận", unit: "", fullText: "Thỏa thuận" };
  }

  if (min != null && max != null) {
    const text = `${formatMillion(min)} - ${formatMillion(max)} triệu`;
    return { text, unit: "/tháng", fullText: `${text}/tháng` };
  }
  if (min != null) {
    const text = `Từ ${formatMillion(min)} triệu`;
    return { text, unit: "/tháng", fullText: `${text}/tháng` };
  }
  if (max != null) {
    const text = `Lên đến ${formatMillion(max)} triệu`;
    return { text, unit: "/tháng", fullText: `${text}/tháng` };
  }

  return { text: "Thỏa thuận", unit: "", fullText: "Thỏa thuận" };
}

/**
 * Trích xuất và chuẩn hóa dữ liệu hiển thị từ mọi nguồn tin tuyển dụng (SearchItem, DetailResult, MockJob, AnyJob...)
 */
export function extractJobDisplayData(job: AnyJob) {
  if (!job) {
    return {
      companyName: "Doanh nghiệp tuyển dụng",
      companyLogoUrl: null as string | null,
      isCompanyVerified: false,
      provinceName: "Toàn quốc",
      wardName: "",
      detailedLocation: "",
      displayLocation: "Toàn quốc",
      fullAddress: "Toàn quốc",
      rawCreatedAt: "",
      displayTimeAgo: "Mới đăng",
      displayCreatedAt: "Mới đăng",
      rawDeadline: null as string | null,
      formattedDeadline: null as string | null,
      experienceYears: 0,
      expYears: 0,
      vacanciesCount: 1,
      salaryInfo: { text: "Thỏa thuận", unit: "", fullText: "Thỏa thuận" },
      salaryText: "Thỏa thuận",
      isNegotiable: true,
      jobTypeLabel: "Toàn thời gian",
      workModeLabel: "Chưa xác định",
      workModeText: "Chưa xác định",
      jobLevelLabel: "Nhân viên",
      skillList: [] as string[],
      aiScore: null as number | null,
      description: null as string | null,
      requirements: null as string | null,
      benefits: null as string | null,
    };
  }

  const companyName =
    job.company?.name ||
    ("companyName" in job && typeof job.companyName === "string"
      ? job.companyName
      : "Doanh nghiệp tuyển dụng");

  const companyLogoUrl =
    job.company?.logoUrl ||
    ("logoFileUrl" in (job.company || {})
      ? (job.company as { logoFileUrl?: string | null })?.logoFileUrl
      : null) ||
    ("companyLogoUrl" in job && typeof job.companyLogoUrl === "string"
      ? job.companyLogoUrl
      : null) ||
    null;

  const isCompanyVerified = Boolean(
    ("verificationStatus" in (job.company || {}) &&
      (job.company as { verificationStatus?: string })?.verificationStatus ===
        "VERIFIED") ||
    ("isVerified" in (job.company || {}) &&
      Boolean((job.company as { isVerified?: boolean })?.isVerified)),
  );

  const provinceName =
    ("province" in job && job.province?.name) ||
    ("location" in job && job.location?.provinceName) ||
    ("provinceName" in job && typeof job.provinceName === "string"
      ? job.provinceName
      : "Toàn quốc");

  const wardName =
    ("ward" in job && job.ward?.name) ||
    ("location" in job && job.location?.wardName) ||
    "";

  const detailedLocation =
    ("detailedLocation" in job && typeof job.detailedLocation === "string"
      ? job.detailedLocation
      : "") ||
    ("location" in job && job.location?.detailedLocation) ||
    "";

  const displayLocation = wardName
    ? `${wardName}, ${provinceName}`
    : provinceName;

  const fullAddress =
    [detailedLocation, wardName, provinceName].filter(Boolean).join(", ") ||
    provinceName;

  const rawCreatedAt =
    ("createdAt" in job && job.createdAt) ||
    ("createAt" in job && job.createAt) ||
    "";

  const displayTimeAgo = rawCreatedAt ? getTimeAgo(rawCreatedAt) : "Mới đăng";

  const rawDeadline = "deadline" in job ? job.deadline : null;
  const formattedDeadline = rawDeadline
    ? new Date(rawDeadline).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

  const experienceYears =
    "experienceYears" in job && typeof job.experienceYears === "number"
      ? job.experienceYears
      : 0;

  const vacanciesCount =
    "vacancies" in job && typeof job.vacancies === "number" ? job.vacancies : 1;

  const salaryInfo = formatSalaryCompact(
    job.salaryMin,
    job.salaryMax,
    job.salaryNegotiable,
  );
  const salaryText = salaryInfo.text;
  const isNegotiable = isSalaryNegotiable(
    job.salaryMin,
    job.salaryMax,
    job.salaryNegotiable,
  );

  const rawSkills = "skills" in job ? job.skills : undefined;
  const rawSkillNames = "skillNames" in job ? job.skillNames : undefined;

  const skillList: string[] = Array.isArray(rawSkills)
    ? rawSkills.map((s: string | { name: string }) =>
        typeof s === "string" ? s : s.name,
      )
    : Array.isArray(rawSkillNames)
      ? rawSkillNames
      : [];

  const aiScore =
    "aiMatchScore" in job && typeof job.aiMatchScore === "number"
      ? job.aiMatchScore
      : null;

  const description =
    "description" in job && typeof job.description === "string"
      ? job.description
      : null;

  const requirements =
    "requirements" in job && typeof job.requirements === "string"
      ? job.requirements
      : null;

  const benefits =
    "benefits" in job && typeof job.benefits === "string" ? job.benefits : null;

  return {
    companyName,
    companyLogoUrl,
    isCompanyVerified,
    provinceName,
    wardName,
    detailedLocation,
    displayLocation,
    fullAddress,
    rawCreatedAt,
    displayTimeAgo,
    displayCreatedAt: displayTimeAgo,
    rawDeadline,
    formattedDeadline,
    experienceYears,
    expYears: experienceYears,
    vacanciesCount,
    salaryInfo,
    salaryText,
    isNegotiable,
    jobTypeLabel: getJobTypeLabel(job.jobType),
    workModeLabel: getWorkModeLabel(job.workMode),
    workModeText: getWorkModeLabel(job.workMode),
    jobLevelLabel: getJobLevelLabel(job.jobLevel),
    skillList,
    aiScore,
    description,
    requirements,
    benefits,
  };
}
