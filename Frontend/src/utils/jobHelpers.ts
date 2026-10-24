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

export function getWorkModeLabel(value?: string | null): string {
  if (!value) return "Chưa xác định";
  const found = WORK_MODE_OPTIONS.find(
    (item) => item.value.toLowerCase() === value.toLowerCase(),
  );
  return found ? found.label : value;
}

export function getJobTypeLabel(value?: string | null): string {
  if (!value) return "Chưa xác định";
  const found = JOB_TYPE_OPTIONS.find(
    (item) => item.value.toLowerCase() === value.toLowerCase(),
  );
  return found ? found.label : value;
}

export function getJobLevelLabel(value?: string | null): string {
  if (!value) return "Chưa xác định";
  const found = JOB_LEVEL_OPTIONS.find(
    (item) => item.value.toLowerCase() === value.toLowerCase(),
  );
  return found ? found.label : value;
}

export function getEducationLevelLabel(value?: string | null): string {
  if (!value) return "Chưa xác định";
  const found = EDUCATION_LEVEL_OPTIONS.find(
    (item) => item.value.toLowerCase() === value.toLowerCase(),
  );
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
      return `${formatVnd(min)} - ${formatVnd(max)} (có thể thương lượng)`;
    if (min != null) return `Từ ${formatVnd(min)} (có thể thương lượng)`;
    if (max != null) return `Lên tới ${formatVnd(max)} (có thể thương lượng)`;
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
