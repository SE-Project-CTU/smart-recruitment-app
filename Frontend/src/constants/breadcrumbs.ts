import { matchPath } from "react-router-dom";
import { PATHS } from "./paths";

export interface BreadcrumbConfigItem {
  label: string;
  url?: string;
}

interface RouteBreadcrumbRule {
  pattern: string;
  generate: (params: Record<string, string | undefined>) => BreadcrumbConfigItem[];
}

const STATIC_BREADCRUMBS: Record<string, BreadcrumbConfigItem[]> = {
  // Candidate
  [PATHS.CANDIDATE.DASHBOARD]: [{ label: "Tổng quan" }],
  [PATHS.CANDIDATE.SEARCH_JOBS]: [{ label: "Tìm việc làm" }],
  [PATHS.CANDIDATE.MATCHED_JOBS]: [{ label: "Việc làm phù hợp" }],
  [PATHS.CANDIDATE.CV_MANAGEMENT]: [{ label: "Quản lý CV" }],
  [PATHS.CANDIDATE.APPLICATION_STATUS]: [{ label: "Trạng thái hồ sơ" }],
  [PATHS.CANDIDATE.BOOKMARK_JOBS]: [
    { label: "Mục đã lưu" },
    { label: "Công việc đã lưu" },
  ],
  [PATHS.CANDIDATE.BOOKMARK_COMPANIES]: [
    { label: "Mục đã lưu" },
    { label: "Công ty đã lưu" },
  ],
  [PATHS.CANDIDATE.COMPANY_REVIEWS]: [{ label: "Đánh giá công ty" }],
  [PATHS.CANDIDATE.USER_PROFILE]: [{ label: "Hồ sơ cá nhân" }],
  [PATHS.CANDIDATE.SETTINGS]: [{ label: "Cài đặt tài khoản" }],

  // Recruiter
  [PATHS.RECRUITER.DASHBOARD]: [{ label: "Tổng quan" }],
  [PATHS.RECRUITER.JOBS]: [{ label: "Tin tuyển dụng" }],
  [PATHS.RECRUITER.CREATE_JOB]: [
    { label: "Tin tuyển dụng", url: PATHS.RECRUITER.JOBS },
    { label: "Tạo tin mới" },
  ],
  [PATHS.RECRUITER.CANDIDATES]: [{ label: "Quản lý ứng viên" }],
  [PATHS.RECRUITER.COMPANY_MANAGEMENT]: [{ label: "Quản lý doanh nghiệp" }],
  [PATHS.RECRUITER.COMPANY_INVITATION]: [{ label: "Lời mời tham gia" }],
  [PATHS.RECRUITER.USER_PROFILE]: [{ label: "Hồ sơ cá nhân" }],

  // Admin
  [PATHS.ADMIN.DASHBOARD]: [{ label: "Tổng quan" }],
  [PATHS.ADMIN.USER_PROFILE]: [{ label: "Hồ sơ cá nhân" }],
  [PATHS.ADMIN.APPROVE_COMPANY]: [
    { label: "Kiểm duyệt" },
    { label: "Duyệt doanh nghiệp" },
  ],
  [PATHS.ADMIN.APPROVE_JD]: [
    { label: "Kiểm duyệt" },
    { label: "Duyệt tin tuyển dụng" },
  ],

  // Other
  [PATHS.CREATE_CV]: [{ label: "Tạo CV" }],
};

const DYNAMIC_RULES: RouteBreadcrumbRule[] = [
  {
    pattern: PATHS.RECRUITER.EDIT_JOB,
    generate: (params) => [
      { label: "Tin tuyển dụng", url: PATHS.RECRUITER.JOBS },
      {
        label: "Chi tiết",
        url: params.id ? PATHS.RECRUITER.JOB_DETAIL.replace(":id", params.id) : undefined,
      },
      { label: "Chỉnh sửa" },
    ],
  },
  {
    pattern: PATHS.RECRUITER.JOB_DETAIL,
    generate: () => [
      { label: "Tin tuyển dụng", url: PATHS.RECRUITER.JOBS },
      { label: "Chi tiết tin" },
    ],
  },
  {
    pattern: PATHS.RECRUITER.COMPANAY_MANAGEMENT_OVERVIEW,
    generate: () => [
      { label: "Doanh nghiệp", url: PATHS.RECRUITER.COMPANY_MANAGEMENT },
      { label: "Tổng quan" },
    ],
  },
  {
    pattern: PATHS.RECRUITER.COMPANAY_MANAGEMENT_MEMBERS,
    generate: () => [
      { label: "Doanh nghiệp", url: PATHS.RECRUITER.COMPANY_MANAGEMENT },
      { label: "Đội ngũ" },
    ],
  },
  {
    pattern: PATHS.RECRUITER.COMPANAY_MANAGEMENT_SETTINGS,
    generate: () => [
      { label: "Doanh nghiệp", url: PATHS.RECRUITER.COMPANY_MANAGEMENT },
      { label: "Cài đặt" },
    ],
  },
  {
    pattern: PATHS.RECRUITER.COMPANAY_MANAGEMENT_INVITATIONS,
    generate: () => [
      { label: "Doanh nghiệp", url: PATHS.RECRUITER.COMPANY_MANAGEMENT },
      { label: "Yêu cầu gia nhập" },
    ],
  },
];

export function resolveBreadcrumbs(pathname: string): BreadcrumbConfigItem[] {
  if (STATIC_BREADCRUMBS[pathname]) {
    return STATIC_BREADCRUMBS[pathname];
  }

  for (const rule of DYNAMIC_RULES) {
    const match = matchPath({ path: rule.pattern, end: true }, pathname);
    if (match) {
      return rule.generate(match.params);
    }
  }

  const segments = pathname.split("/").filter(Boolean);
  return segments.map((seg, i) => {
    const isLast = i === segments.length - 1;
    return {
      label: seg.charAt(0).toUpperCase() + seg.slice(1),
      url: isLast ? undefined : `/${segments.slice(0, i + 1).join("/")}`,
    };
  });
}
