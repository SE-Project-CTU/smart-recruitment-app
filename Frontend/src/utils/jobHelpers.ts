import type {
  EducationLevel,
  JobLevel,
  JobPostingStatus,
  JobType,
  WorkMode,
} from "@/types";

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
