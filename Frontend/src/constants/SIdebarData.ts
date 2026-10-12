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
  Star,
  UserRound,
  UserRoundGroup,
} from "lucide-react";

export const candidateSidebarData = {
  //tổng quan
  mainNav: [
    {
      title: "Trang chủ",
      url: "#",
      icon: Home,
      isActive: true,
      items: [],
    },
    {
      title: "Việc làm phù hợp",
      url: "#",
      icon: LayoutList,
      items: [],
    },
  ],
  //hồ sơ của tui
  myProfile: [
    { title: "Quản lý CV", url: "#", icon: FileText },
    { title: "Trạng thái hồ sơ", url: "#", icon: FileChartLine },
  ],
  //cá nhân
  personal: [
    { title: "Việc làm đã lưu", url: "#", icon: Bookmark },
    { title: "Công ty đã lưu", url: "#", icon: BuildingComplex },
    { title: "Đánh giá", url: "#", icon: Star },
  ],
  //footer
  footer: [{ title: "Trợ giúp", url: "", icon: CircleQuestionMark }],
};

export const recruiterSidebarData = {
  //tuyển dụng
  recruitment: [
    {
      title: "Tổng quan",
      url: "#",
      icon: Home,
      isActive: true,
      items: [],
    },
    {
      title: "Quản lý JD",
      url: "#",
      icon: LibraryBig,
      items: [],
    },
    {
      title: "Ứng viên",
      url: "#",
      icon: UserRoundGroup,
      items: [],
    },
    {
      title: "Công ty",
      url: "#",
      icon: BuildingComplex,
      items: [
        { title: "Quản lý", url: "#" },
        { title: "Lời mời", url: "#" },
      ],
    },
  ],
  //thiết lập
  setting: [
    {
      title: "Cài đặt",
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
    { title: "Nâng cấp gói", url: "", icon: ChevronsUp },
    { title: "Trợ giúp", url: "", icon: CircleQuestionMark },
  ],
};

export const adminSidebarData = {
  //quản trị hệ thống
  mainNav: [
    { title: "Tổng quan", url: "#", icon: Home },
    {
      title: "Kiểm duyệt",
      url: "#",
      icon: ListCheck,
      items: [
        { title: "Doanh nghiệp", url: "#" },
        { title: "Tin tuyển dụng", url: "#" },
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
