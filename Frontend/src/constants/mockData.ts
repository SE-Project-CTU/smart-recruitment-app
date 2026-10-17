export const isLoggedIn = false;

export interface TestimonialItem {
  id: string;
  avatar: string;
  name: string;
  company: string;
  role?: string;
  comment: string;
}

export interface MockJobPosting {
  id: string;
  company: {
    id: string;
    name: string;
    logoUrl: string;
    verificationStatus: "VERIFIED" | "PENDING" | "REJECTED";
  };
  title: string;
  location: {
    provinceName: string;
    wardName: string;
    detailedLocation: string;
  };
  experienceYears: number;
  jobLevel:
    | "Intern"
    | "Fresher"
    | "Junior"
    | "MidLevel"
    | "Senior"
    | "Lead"
    | "Manager"
    | "Executive";
  educationLevel: string;
  vacancies: number;
  workMode: "Remote" | "On-site" | "Hybrid";
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship" | "Freelance";
  description: string;
  requirements: string;
  benefits: string;
  salaryMin: number;
  salaryMax: number;
  salaryNegotiable: boolean;
  deadline: string;
  createAt: string;
  status: "ACTIVE" | "CLOSED" | "DRAFT";
  industries: string[];
  skills: string[];
  aiMatchScore?: number; // Điểm gợi ý tương thích ảo cho Dashboard
}

export const MOCK_JOB_POSTINGS: MockJobPosting[] = [
  {
    id: "job-uuid-001",
    company: {
      id: "comp-uuid-101",
      name: "TechNova Solutions Vietnam",
      logoUrl:
        "https://www.tech-novame.com/web/image/website/1/social_default_image?unique=061791e",
      verificationStatus: "VERIFIED",
    },
    title: "Senior React & TypeScript Engineer",
    location: {
      provinceName: "TP. Hồ Chí Minh",
      wardName: "Phường Bến Nghé",
      detailedLocation: "Tòa nhà Saigon Centre, Lô 2, Quận 1",
    },
    experienceYears: 3,
    jobLevel: "Senior",
    educationLevel: "Cử nhân Công nghệ Thông tin hoặc tương đương",
    vacancies: 2,
    workMode: "Hybrid",
    jobType: "Full-time",
    description:
      "Phát triển hệ thống quản trị tuyển dụng thông minh SmartHire, tối ưu hóa giao diện người dùng và tích hợp các tính năng AI-based matching.",
    requirements:
      "- Thành thạo React 19, TypeScript và Tailwind CSS.\n- Có kinh nghiệm làm việc với Tiptap hoặc các WYSIWYG editor là lợi thế lớn.\n- Hiểu rõ về kiến trúc RESTful API và tối ưu hiệu suất Frontend.",
    benefits:
      "- Lương cạnh tranh, thưởng tháng 13 + Performance Bonus.\n- Bảo hiểm sức khỏe toàn diện cho nhân sự và người thân.\n- Môi trường làm việc quốc tế, linh hoạt thời gian.",
    salaryMin: 1800,
    salaryMax: 2800,
    salaryNegotiable: true,
    deadline: "2026-05-30T23:59:59Z",
    createAt: "2026-04-10T09:00:00Z",
    status: "ACTIVE",
    industries: ["Công nghệ thông tin", "Phần mềm & Dịch vụ IT"],
    skills: ["React", "TypeScript", "Tailwind CSS", "Redux/Zustand"],
    aiMatchScore: 96,
  },
  {
    id: "job-uuid-002",
    company: {
      id: "comp-uuid-102",
      name: "CloudWorks Asia",
      logoUrl:
        "https://store.servicenow.com/f7a4e1941b55a110ee92cb31604bcb2e.iix",
      verificationStatus: "VERIFIED",
    },
    title: "Full-stack .NET & React Developer",
    location: {
      provinceName: "Hà Nội",
      wardName: "Phường Dịch Vọng Hậu",
      detailedLocation: "Tòa nhà FPT, Cầu Giấy",
    },
    experienceYears: 2,
    jobLevel: "MidLevel",
    educationLevel: "Đại học chuyên ngành CNTT",
    vacancies: 3,
    workMode: "On-site",
    jobType: "Full-time",
    description:
      "Xây dựng và duy trì các microservices bằng ASP.NET Core kết hợp với Frontend React, tối ưu cơ sở dữ liệu PostgreSQL.",
    requirements:
      "- Ít nhất 2 năm kinh nghiệm lập trình C#/.NET Core và Entity Framework.\n- Nắm vững kiến thức về SQL, PostgreSQL và Redis.\n- Kỹ năng làm việc nhóm và giao tiếp tốt.",
    benefits:
      "- Xét tăng lương định kỳ 2 lần/năm.\n- Trợ cấp ăn trưa, gửi xe và học tập nâng cao kỹ năng.\n- Team building hàng quý và du lịch nước ngoài.",
    salaryMin: 1500,
    salaryMax: 2200,
    salaryNegotiable: true,
    deadline: "2026-06-15T23:59:59Z",
    createAt: "2026-05-02T09:00:00Z",
    status: "ACTIVE",
    industries: ["Công nghệ thông tin", "Cloud Computing"],
    skills: [".NET Core", "C#", "PostgreSQL", "React"],
    aiMatchScore: 89,
  },
  {
    id: "job-uuid-003",
    company: {
      id: "comp-uuid-103",
      name: "FinTech Saigon Hub",
      logoUrl:
        "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=150",
      verificationStatus: "VERIFIED",
    },
    title: "UI/UX Product Designer",
    location: {
      provinceName: "TP. Hồ Chí Minh",
      wardName: "Phường Thảo Điền",
      detailedLocation: "The Vista An Phú, Quận 2",
    },
    experienceYears: 2,
    jobLevel: "MidLevel",
    educationLevel: "Không yêu cầu khắt khe bằng cấp, coi trọng portfolio",
    vacancies: 1,
    workMode: "Remote",
    jobType: "Full-time",
    description:
      "Thiết kế giao diện người dùng cho ứng dụng tài chính số, nghiên cứu trải nghiệm người dùng và xây dựng Design System đồng bộ.",
    requirements:
      "- Sử dụng thành thạo Figma, Adobe XD.\n- Có kinh nghiệm thiết kế ứng dụng Mobile hoặc Web App phức tạp.\n- Khả năng tư duy logic và thấu hiểu hành vi người dùng cao.",
    benefits:
      "- Làm việc từ xa linh hoạt (Remote toàn thời gian).\n- Trang bị MacBook Pro cấu hình mạnh phục vụ công việc.\n- Gói chăm sóc sức khỏe cao cấp.",
    salaryMin: 1200,
    salaryMax: 2000,
    salaryNegotiable: true,
    deadline: "2026-06-01T23:59:59Z",
    createAt: "2026-04-20T09:00:00Z",
    status: "ACTIVE",
    industries: ["Tài chính", "Công nghệ tài chính (FinTech)"],
    skills: ["Figma", "UI/UX Design", "Design System", "User Research"],
    aiMatchScore: 82,
  },
  {
    id: "job-uuid-004",
    company: {
      id: "comp-uuid-104",
      name: "AI Vision Labs",
      logoUrl:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150",
      verificationStatus: "VERIFIED",
    },
    title: "AI / Machine Learning Engineer (NLP)",
    location: {
      provinceName: "Đà Nẵng",
      wardName: "Phường Thạch Thang",
      detailedLocation: "Đường Bạch Đằng, Hải Châu",
    },
    experienceYears: 3,
    jobLevel: "Senior",
    educationLevel: "Đại học trở lên chuyên ngành Khoa học máy tính / Toán tin",
    vacancies: 2,
    workMode: "Hybrid",
    jobType: "Full-time",
    description:
      "Nghiên cứu và phát triển các mô hình NLP, Vector Embedding phục vụ cho tính năng AI Matching CV và tự động đánh giá hồ sơ ứng viên.",
    requirements:
      "- Có kinh nghiệm triển khai LLMs, OpenAI API, Hugging Face Transformers.\n- Thành thạo Python, PyTorch hoặc TensorFlow.\n- Kinh nghiệm làm việc với Vector Database (như pgvector, Milvus, Pinecone).",
    benefits:
      "- Thưởng cổ phiếu theo chương trình ESOP của công ty.\n- Tài trợ chi phí tham gia các hội thảo AI lớn trong khu vực.\n- Lương tháng 13, 14.",
    salaryMin: 2500,
    salaryMax: 4000,
    salaryNegotiable: true,
    deadline: "2026-06-20T23:59:59Z",
    createAt: "2026-05-05T09:00:00Z",
    status: "ACTIVE",
    industries: ["Trí tuệ nhân tạo (AI)", "Nghiên cứu & Phát triển"],
    skills: ["Python", "PyTorch", "NLP", "Vector Embedding", "PostgreSQL"],
    aiMatchScore: 94,
  },
  {
    id: "job-uuid-005",
    company: {
      id: "comp-uuid-105",
      name: "Global Media Vietnam",
      logoUrl:
        "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=150",
      verificationStatus: "VERIFIED",
    },
    title: "Junior Frontend Developer (Fresher Welcomed)",
    location: {
      provinceName: "Cần Thơ",
      wardName: "Phường An Hội",
      detailedLocation: "Đại lộ Hòa Bình, Ninh Kiều",
    },
    experienceYears: 0,
    jobLevel: "Fresher",
    educationLevel: "Tốt nghiệp Cao đẳng/Đại học chuyên ngành CNTT",
    vacancies: 4,
    workMode: "On-site",
    jobType: "Full-time",
    description:
      "Tham gia phát triển các website thương mại điện tử và cổng thông tin truyền thông dưới sự hướng dẫn trực tiếp của các Senior Mentor.",
    requirements:
      "- Nắm vững kiến thức nền tảng HTML5, CSS3, JavaScript (ES6+).\n- Đã từng làm các đồ án thực tế bằng ReactJS hoặc VueJS.\n- Tinh thần ham học hỏi, cẩn thận và chủ động trong công việc.",
    benefits:
      "- Được đào tạo chuyên sâu về quy trình phát triển phần mềm chuẩn Agile/Scrum.\n- Hỗ trợ dấu thực tập và cơ hội chuyển chính thức sau 3 tháng.\n- Trà sữa, hoa quả miễn phí tại văn phòng mỗi ngày.",
    salaryMin: 500,
    salaryMax: 800,
    salaryNegotiable: false,
    deadline: "2026-05-15T23:59:59Z",
    createAt: "2026-03-20T09:00:00Z",
    status: "ACTIVE",
    industries: ["Truyền thông", "Thương mại điện tử"],
    skills: ["JavaScript", "React", "HTML/CSS", "Git"],
    aiMatchScore: 78,
  },
];

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
