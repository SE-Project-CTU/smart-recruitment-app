export const isLoggedIn = false;

export interface TestimonialItem {
  id: string;
  avatar: string;
  name: string;
  company: string;
  role?: string;
  comment: string;
}

export const testimonialData: TestimonialItem[] = [
  {
    id: "1",
    avatar: "https://i.pravatar.cc/150?img=11",
    name: "Liam Patel",
    company: "NextGen Interfaces",
    comment:
      "SmartHire giúp chúng tôi rút ngắn 70% thời gian lọc hồ sơ. AI chấm điểm cực kỳ chính xác và gợi ý đúng ứng viên phù hợp với văn hóa công ty.",
  },
  {
    id: "2",
    avatar: "https://i.pravatar.cc/150?img=32",
    name: "Trần Minh Anh",
    company: "FPT Software",
    comment:
      "Giao diện tối giản, trực quan và tốc độ xử lý nhanh. Tính năng tạo CV chuẩn ATS thực sự đem lại trải nghiệm tuyệt vời cho cả HR và ứng viên.",
  },
  {
    id: "3",
    avatar: "https://i.pravatar.cc/150?img=53",
    name: "Alex Rivera",
    company: "TechPulse Solutions",
    comment:
      "Mô hình đăng tuyển mở giúp doanh nghiệp tối ưu chi phí rất nhiều. Chúng tôi đã tuyển được 3 vị trí Senior IT chỉ trong vòng 1 tuần.",
  },
  {
    id: "4",
    avatar: "https://i.pravatar.cc/150?img=47",
    name: "Nguyễn Hải Yến",
    company: "VNG Corporation",
    comment:
      "Hệ thống phân tích dữ liệu tuyển dụng thời gian thực giúp ban lãnh đạo theo dõi chỉ số nhân sự rõ ràng và đưa ra quyết định nhanh chóng.",
  },
  {
    id: "5",
    avatar: "https://i.pravatar.cc/150?img=68",
    name: "David Zhang",
    company: "CloudScale Inc",
    comment:
      "Thuật toán ghép đôi thông minh hoạt động vượt ngoài mong đợi. Đây chắc chắn là công cụ tuyển dụng không thể thiếu cho các startup công nghệ.",
  },
];
