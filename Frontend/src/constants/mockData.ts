import type { CVItem } from "@/types/cv";

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

export type ApplicationStatus =
  "APPLIED" | "REVIEWING" | "INTERVIEW" | "OFFERED" | "ACCEPTED" | "REJECTED";

export interface MockApplication {
  id: string;
  jobId: string;
  candidateId: string;
  cvVersionId: string | null;
  uploadedCvUrl: string | null;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
  job: MockJobPosting;
}

export interface IndustryGroup {
  parent: string;
  children: string[];
}

export const MOCK_INDUSTRY_HIERARCHY: IndustryGroup[] = [
  {
    parent: "Công nghệ thông tin",
    children: [
      "Phần mềm & Dịch vụ IT",
      "Trí tuệ nhân tạo (AI) & Dữ liệu",
      "An ninh mạng & Hệ thống",
    ],
  },
  {
    parent: "Tài chính & Ngân hàng",
    children: [
      "Công nghệ tài chính (Fintech)",
      "Ngân hàng số & Đầu tư",
      "Kế toán & Kiểm toán",
    ],
  },
  {
    parent: "Thương mại & Truyền thông",
    children: [
      "Thương mại điện tử (E-commerce)",
      "Digital Marketing & Quảng cáo",
      "Thiết kế sản phẩm (UI/UX)",
    ],
  },
];

export interface LocationGroup {
  province: string;
  wards: string[];
}

export const MOCK_LOCATION_HIERARCHY: LocationGroup[] = [
  {
    province: "TP. Hồ Chí Minh",
    wards: ["Phường Bến Nghé", "Phường Tân Phú", "Phường Thảo Điền"],
  },
  {
    province: "Hà Nội",
    wards: ["Phường Dịch Vọng Hậu", "Phường Láng Hạ", "Phường Điện Biên"],
  },
  {
    province: "Đà Nẵng",
    wards: ["Phường Hải Châu 1", "Phường Thạch Thang", "Phường An Hải Bắc"],
  },
];

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
    salaryNegotiable: false,
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
    salaryNegotiable: false,
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

export const MOCK_APPLICATIONS: MockApplication[] = [
  {
    id: "5fc43d70-1c27-4c94-9306-d1a1d4dc9c60",
    jobId: MOCK_JOB_POSTINGS[0].id,
    candidateId: "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
    cvVersionId: "0d55e7ee-44f4-4d30-a65c-d9c5af5cf6c8",
    uploadedCvUrl: null,
    coverLetter:
      "Tôi rất ấn tượng với định hướng phát triển nền tảng tuyển dụng AI của TechNova. Với 3 năm kinh nghiệm làm việc sâu với React và TypeScript, tôi tự tin có thể đóng góp ngay vào dự án.",
    status: "INTERVIEW",
    appliedAt: "2026-10-16T08:30:00Z",
    updatedAt: "2026-10-17T14:20:00Z",
    job: MOCK_JOB_POSTINGS[0],
  },
  {
    id: "a1b2c3d4-2e38-4d05-8417-e2b2e5ed0d71",
    jobId: MOCK_JOB_POSTINGS[1].id,
    candidateId: "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
    cvVersionId: null,
    uploadedCvUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    coverLetter:
      "Em xin gửi hồ sơ ứng tuyển vị trí Full-stack .NET & React Developer. Em đã có kinh nghiệm xây dựng hệ thống bằng ASP.NET Core kết hợp PostgreSQL.",
    status: "REVIEWING",
    appliedAt: "2026-10-15T10:15:00Z",
    updatedAt: "2026-10-17T09:00:00Z",
    job: MOCK_JOB_POSTINGS[1],
  },
  {
    id: "b2c3d4e5-3f49-4e16-9528-f3c3f6fe1e82",
    jobId: MOCK_JOB_POSTINGS[2].id,
    candidateId: "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
    cvVersionId: "1e66f8ff-55a5-4e41-b76d-e0d6bg6dg7d9",
    uploadedCvUrl: null,
    coverLetter:
      "Đính kèm là CV và Portfolio các dự án FinTech Web/Mobile App mà tôi đã thiết kế. Rất mong được đồng hành cùng đội ngũ Product của FinTech Saigon Hub.",
    status: "OFFERED",
    appliedAt: "2026-10-10T15:45:00Z",
    updatedAt: "2026-10-18T03:10:00Z",
    job: MOCK_JOB_POSTINGS[2],
  },
  {
    id: "c3d4e5f6-4a50-4f27-a639-a4d4a7af2f93",
    jobId: MOCK_JOB_POSTINGS[3].id,
    candidateId: "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
    cvVersionId: "2f77a9aa-66b6-4f52-c87e-f1e7ch7eh8e0",
    uploadedCvUrl: null,
    coverLetter:
      "Tôi có nền tảng nghiên cứu về NLP và kinh nghiệm triển khai Vector Database (pgvector). Rất hào hứng với bài toán AI Matching mà AI Vision Labs đang giải quyết.",
    status: "APPLIED",
    appliedAt: "2026-10-18T06:00:00Z",
    updatedAt: "2026-10-18T06:00:00Z",
    job: MOCK_JOB_POSTINGS[3],
  },
  {
    id: "d4e5f6a7-5b61-4a38-b740-b5e5b8ba3a04",
    jobId: MOCK_JOB_POSTINGS[4].id,
    candidateId: "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
    cvVersionId: null,
    uploadedCvUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    coverLetter:
      "Em vừa tốt nghiệp chuyên ngành CNTT và đã hoàn thành đồ án xây dựng nền tảng tuyển dụng bằng ReactJS. Em rất mong có cơ hội được học hỏi tại Global Media Vietnam.",
    status: "ACCEPTED",
    appliedAt: "2026-09-25T09:20:00Z",
    updatedAt: "2026-10-10T11:00:00Z",
    job: MOCK_JOB_POSTINGS[4],
  },
  {
    id: "e5f6a7b8-6c72-4b49-c851-c6f6c9cb4b15",
    jobId: MOCK_JOB_POSTINGS[0].id,
    candidateId: "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
    cvVersionId: "0d55e7ee-44f4-4d30-a65c-d9c5af5cf6c8",
    uploadedCvUrl: null,
    coverLetter:
      "Tôi mong muốn thử sức với các bài toán chịu tải cao và tối ưu hóa Frontend Architecture.",
    status: "REJECTED",
    appliedAt: "2026-09-20T13:10:00Z",
    updatedAt: "2026-09-28T16:45:00Z",
    job: MOCK_JOB_POSTINGS[0],
  },
  {
    id: "f6a7b8c9-7d83-4c50-d962-d7a7d0dc5c26",
    jobId: MOCK_JOB_POSTINGS[1].id,
    candidateId: "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
    cvVersionId: null,
    uploadedCvUrl:
      "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    coverLetter:
      "Em có kiến thức cơ bản về Docker, GitHub Actions và .NET. Em xin ứng tuyển để rèn luyện kỹ năng phát triển hệ thống thực tế.",
    status: "INTERVIEW",
    appliedAt: "2026-10-14T07:50:00Z",
    updatedAt: "2026-10-18T01:30:00Z",
    job: MOCK_JOB_POSTINGS[1],
  },
];

// Nếu muốn giả lập luôn cấu trúc bọc nguyên bản của API 10 (có data, meta, correlationId):
export const MOCK_APPLICATIONS_RESPONSE = {
  data: MOCK_APPLICATIONS,
  meta: {
    page: 1,
    pageSize: 20,
    totalItems: MOCK_APPLICATIONS.length,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  },
  correlationId: "5f1c0d68-9a3f-4c85-bf50-4a7c17c1e2af",
};

export const MOCK_CVS: CVItem[] = [
  {
    id: "b3e6ae75-3264-47ec-94c6-e2f1f7a70c9d",
    title: "CV Fullstack Developer (English)",
    templateId: "6a6c7345-ec6f-4b09-bf05-2a4a4a2e5a80",
    template: {
      id: "6a6c7345-ec6f-4b09-bf05-2a4a4a2e5a80",
      code: "modern_two_column",
      name: "Modern Elegant",
    },
    language: "en",
    isPublic: true,
    candidateId: "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
    createdAt: "2026-10-15T09:00:00Z",
    updatedAt: "2026-10-17T11:20:00Z",
    // Test trường hợp không có ảnh -> Sẽ tự render khung Skeleton vẽ sẵn
    thumbnailUrl:
      "https://www.topcv.vn/cv/snapshot/template-cv/mau-cv-tieu-chuan-it-kinh-nghiem-_AwMBBgcFDlZRVAYCWQwLUgBVB1ACUlQAAlsHUg57b4.webp?t=1763723169&color=F6F6F6&template_name=default_junior&lang=vi",
  },
  {
    id: "c4f7bf86-4375-48fd-a5d7-f3g2g8b81d0e",
    title: "CV UI/UX & Frontend (Tiếng Việt)",
    templateId: "7b7d8456-fd7a-5c1a-cf16-3b5b5b3f6b91",
    template: {
      id: "7b7d8456-fd7a-5c1a-cf16-3b5b5b3f6b91",
      code: "tech_minimalist",
      name: "Tech Minimalist",
    },
    language: "vi",
    isPublic: false,
    candidateId: "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
    createdAt: "2026-10-10T08:30:00Z",
    updatedAt: "2026-10-12T14:45:00Z",
    thumbnailUrl:
      "https://www.topcv.vn/cv/snapshot/template-cv/mau-cv-toi-gian-2-_BQIFVQdWDgNUDgJXVlcNCw0KDwxSV1ZTVFAJBge3ff.webp?t=1762145812&color=263A4D&template_name=minimalism_v2&lang=vi",
  },
  {
    id: "d5g8cf97-5486-49ge-b6e8-g4h3h9c92e1f",
    title: "CV AI & Machine Learning Research",
    templateId: "8c8e9567-ge8b-6d2b-dg27-4c6c6c4g7c02",
    template: {
      id: "8c8e9567-ge8b-6d2b-dg27-4c6c6c4g7c02",
      code: "harvard_classic",
      name: "Harvard Academic",
    },
    language: "en",
    isPublic: true,
    candidateId: "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
    createdAt: "2026-09-28T14:15:00Z",
    updatedAt: "2026-10-05T09:10:00Z",
    // Test trường hợp có ảnh thumbnail mẫu
    thumbnailUrl:
      "https://www.topcv.vn/cv/snapshot/template-cv/mau-cv-senior-_B1tfBFEAUgALBAgBBl0MD1wECQBQAQFQAwIAAw44ec.webp?t=1756265781&color=000000&template_name=senior_v2&lang=vi",
  },
  {
    id: "e6h9dg08-6597-40hf-c7f9-h5i4i0d03f2g",
    title: "CV Chuyên viên Phân tích Dữ liệu",
    templateId: "9d9f0678-hf9c-7e3c-eh38-5d7d7d5h8d13",
    template: {
      id: "9d9f0678-hf9c-7e3c-eh38-5d7d7d5h8d13",
      code: "creative_clean",
      name: "Creative Modern",
    },
    language: "vi",
    isPublic: false,
    candidateId: "7d9e6f7a-08d8-4e2a-8f68-5d0cb4f47e4a",
    createdAt: "2026-09-15T16:00:00Z",
    updatedAt: "2026-09-25T10:30:00Z",
    thumbnailUrl:
      "https://www.topcv.vn/cv/snapshot/template-cv/mau-cv-clarity-_A1QFA1EGBwJXUVcACgcPAA1RVAVcUlcBBwYEAg90e5.webp?t=1751514549&color=2E2E2E&template_name=clarity&lang=vi",
  },
];
