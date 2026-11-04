import type {
  CvSectionSuggestion,
  SkillGapAnalysis,
  CvScoreData,
  SuggestedJobItem,
} from "./types";

export const MOCK_REWRITE_SUGGESTIONS: CvSectionSuggestion[] = [
  {
    id: "sug-obj-1",
    sectionKey: "objective",
    sectionTitle: "Mục tiêu nghề nghiệp",
    originalText:
      "Muốn tìm kiếm công việc Frontend Developer để học hỏi thêm kinh nghiệm và đóng góp cho công ty.",
    suggestedText:
      "Frontend Developer với hơn 2 năm kinh nghiệm thực chiến về React, TypeScript và tối ưu hiệu năng web. Định hướng phát triển thành Senior Frontend Engineer, mang lại trải nghiệm số mượt mà và gia tăng giá trị kinh doanh cho tổ chức.",
    status: "ready",
    reason: "Làm nổi bật kỹ năng then chốt, số năm kinh nghiệm và định hướng đóng góp cụ thể.",
  },
  {
    id: "sug-exp-1",
    sectionKey: "experience",
    sectionTitle: "Kinh nghiệm làm việc",
    originalText:
      "Tham gia xây dựng giao diện ứng dụng web bằng React. Fix bug và phối hợp với team backend.",
    suggestedText:
      "Chủ trì phát triển module Dashboard thời gian thực bằng React và Tailwind CSS, giúp giảm 35% thời gian tải trang và cải thiện 20% chỉ số Core Web Vitals (LCP/INP). Phối hợp nhịp nhàng với team Backend qua chuẩn RESTful API.",
    status: "ready",
    reason: "Thêm số liệu đo lường cụ thể (35% thời gian tải, 20% Core Web Vitals) theo phương pháp STAR.",
  },
  {
    id: "sug-proj-1",
    sectionKey: "projects",
    sectionTitle: "Dự án tiêu biểu",
    originalText:
      "Website bán hàng thời trang: Làm các trang sản phẩm, giỏ hàng, thanh toán online.",
    suggestedText:
      "Hệ thống E-Commerce đa nền tảng: Thiết kế kiến trúc component dạng Headless UI, tích hợp thanh toán bảo mật và xử lý trạng thái giỏ hàng với Zustand, phục vụ hơn 5.000 lượt truy cập đồng thời.",
    status: "ready",
    reason: "Làm rõ công nghệ sử dụng (Zustand, Headless UI) và quy mô chịu tải (5.000 concurrent users).",
  },
];

export const MOCK_SKILL_ANALYSIS: SkillGapAnalysis = {
  matchedSkills: ["React", "TypeScript", "Tailwind CSS", "RESTful API", "Git"],
  missingSkills: ["Next.js (SSR)", "Redux Toolkit / Zustand nâng cao", "Unit Test (Jest / Vitest)"],
  systemWarning:
    "Lưu ý: Hệ thống chỉ đối chiếu các kỹ năng này với yêu cầu thị trường. Bạn chỉ nên bổ sung vào CV những kỹ năng mà bản thân đã nắm vững.",
};

export const MOCK_CV_SCORE: CvScoreData = {
  currentScore: 78,
  summaryExplanation:
    "Hồ sơ CV có cấu trúc mạch lạc, kinh nghiệm phù hợp 80% với vị trí Frontend Developer. Cần làm rõ hơn các chỉ số kết quả đóng góp và bổ sung kỹ năng kiểm thử tự động.",
  matchedSkills: ["React", "TypeScript", "Tailwind CSS", "Git", "RESTful API"],
  missingSkills: ["Next.js SSR", "Vitest / Jest", "CI/CD"],
  history: [
    {
      id: "score-h1",
      score: 65,
      assessedAt: "10:30, 28/10/2026",
      summary: "Điểm ban đầu khi CV chưa có số liệu đo lường định lượng.",
    },
    {
      id: "score-h2",
      score: 78,
      assessedAt: "14:15, 03/11/2026",
      summary: "Đã tối ưu mục tiêu nghề nghiệp và các bullet points kinh nghiệm.",
    },
  ],
};

export const MOCK_SUGGESTED_JOBS: SuggestedJobItem[] = [
  {
    id: "sug-job-1",
    title: "Frontend Developer (React / Next.js)",
    companyName: "VNG Corporation",
    location: "TP. Hồ Chí Minh",
    salaryText: "22 - 32 triệu",
    matchPercentage: 92,
  },
  {
    id: "sug-job-2",
    title: "Middle React Engineer",
    companyName: "One Mount Group",
    location: "Hà Nội",
    salaryText: "20 - 30 triệu",
    matchPercentage: 86,
  },
  {
    id: "sug-job-3",
    title: "Web Frontend Specialist",
    companyName: "Viettel Digital",
    location: "Hà Nội",
    salaryText: "25 - 38 triệu",
    matchPercentage: 81,
  },
];
