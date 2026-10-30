import {
  BookBookmark,
  Bookmark,
  BuildingComplex,
  ChevronsUp,
  CircleQuestionMark,
  FileChartLine,
  FileText,
  Home,
  LayoutList,
  LibraryBig,
  ListCheck,
  Search,
  Settings,
  Star,
  UserRound,
  UserRoundGroup,
} from "lucide-react";
import { PATHS } from "./paths";

export const candidateSidebarData = {
  //tổng quan
  mainNav: [
    {
      title: "Trang chủ",
      url: PATHS.CANDIDATE.DASHBOARD,
      icon: Home,
      isActive: true,
      items: [],
    },
    {
      title: "Tìm kiếm",
      url: PATHS.CANDIDATE.SEARCH_JOBS,
      icon: Search,
    },
    {
      title: "Việc làm phù hợp",
      url: PATHS.CANDIDATE.MATCHED_JOBS,
      icon: LayoutList,
      items: [],
    },
  ],
  //hồ sơ của tui
  myProfile: [
    { title: "Quản lý CV", url: PATHS.CANDIDATE.CV_MANAGEMENT, icon: FileText },
    {
      title: "Trạng thái hồ sơ",
      url: PATHS.CANDIDATE.APPLICATION_STATUS,
      icon: FileChartLine,
    },
  ],
  //cá nhân
  personal: [
    {
      title: "Mục đã lưu",
      icon: Bookmark,
      items: [
        { title: "Công ty", url: PATHS.CANDIDATE.BOOKMARK_COMPANIES },
        { title: "Công việc", url: PATHS.CANDIDATE.BOOKMARK_JOBS },
      ],
    },
    { title: "Đánh giá", url: PATHS.CANDIDATE.COMPANY_REVIEWS, icon: Star },
  ],
  //footer
  footer: [
    {
      title: "Trợ giúp",
      url: PATHS.CANDIDATE.SETTINGS,
      icon: CircleQuestionMark,
    },
  ],
};

export const recruiterSidebarData = {
  //tuyển dụng
  recruitment: [
    {
      title: "Tổng quan",
      url: PATHS.RECRUITER.DASHBOARD,
      icon: Home,
      isActive: true,
      items: [],
    },
    {
      title: "Quản lý việc làm",
      url: "#",
      icon: LibraryBig,
      items: [
        { title: "Danh sách tin", url: PATHS.RECRUITER.JOBS },
        { title: "Tạo tin mới", url: PATHS.RECRUITER.CREATE_JOB },
      ],
    },
    {
      title: "Ứng viên",
      url: PATHS.RECRUITER.CANDIDATES,
      icon: UserRoundGroup,
      items: [],
    },
    {
      title: "Công ty",
      url: "#",
      icon: BuildingComplex,
      items: [
        { title: "Quản lý", url: PATHS.RECRUITER.COMPANY_MANAGEMENT },
        { title: "Lời mời", url: PATHS.RECRUITER.COMPANY_INVITATION },
      ],
    },
  ],
  //thiết lập
  setting: [
    {
      title: "Cài đặt",
      icon: Settings,
      url: "#",
      items: [
        { title: "Chung", url: "#" },
        { title: "Hạn mức", url: "#" },
        { title: "Hóa đơn", url: "#" },
      ],
    },
  ],

  //footer
  footer: [
    { title: "Nâng cấp gói", url: "#", icon: ChevronsUp },
    { title: "Trợ giúp", url: "#", icon: CircleQuestionMark },
  ],
};

export const adminSidebarData = {
  //quản trị hệ thống
  mainNav: [
    { title: "Tổng quan", url: PATHS.ADMIN.DASHBOARD, icon: Home },
    {
      title: "Kiểm duyệt",
      url: "#",
      icon: ListCheck,
      items: [
        { title: "Doanh nghiệp", url: PATHS.ADMIN.APPROVE_COMPANY },
        { title: "Tin tuyển dụng", url: PATHS.ADMIN.APPROVE_JD },
      ],
    },
    {
      title: "Danh mục chung",
      url: "#",
      icon: BookBookmark,
      items: [
        { title: "Mẫu CV", url: "#" },
        { title: "Ngành nghề", url: "#" },
        { title: "Địa điểm", url: "#" },
      ],
    },
    { title: "Quản lý tài khoản", url: "#", icon: UserRound },
  ],
  //thiết lập
  setting: [
    {
      title: "Cài đặt",
      icons: Settings,
      url: "#",
      items: [
        { title: "Chung", url: "#" },
        { title: "Hóa đơn", url: "#" },
      ],
    },
  ],
  //footer
  footer: [{ title: "Trợ giúp", url: "", icon: CircleQuestionMark }],
};
