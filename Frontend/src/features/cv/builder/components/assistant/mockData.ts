import type {
  CvSectionSuggestion,
  SkillGapAnalysis,
  CvScoreData,
  SuggestedJobItem,
  TargetJobOption,
  PreparedCvSection,
} from "./types";

/**
 * Danh sách công việc mục tiêu mẫu có sẵn trong hệ thống để ứng viên lựa chọn
 */
export const MOCK_TARGET_JOBS: TargetJobOption[] = [
  {
    id: "job-mock-1",
    title: "Senior Frontend Engineer (React/TypeScript)",
    companyName: "VNG Corporation",
    location: "Thành phố Hồ Chí Minh",
    salaryText: "35 – 50 triệu VNĐ",
    experienceLevel: "Từ 3 - 5 năm kinh nghiệm",
    workMode: "Toàn thời gian (Tại văn phòng)",
    description:
      "Chịu trách nhiệm kiến trúc và phát triển giao diện ứng dụng web quy mô lớn, phục vụ hàng triệu người dùng hoạt động mỗi ngày. Làm chủ hệ sinh thái React hiện đại, thiết kế các giải pháp tối ưu hóa hiệu năng Core Web Vitals và phát triển Design System chuẩn mực.",
    skills: [
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Next.js",
      "State Management (Zustand)",
      "Web Performance (LCP/INP)",
      "RESTful API",
      "Git",
    ],
    responsibilities: [
      "Kiến trúc và triển khai các tính năng phức tạp trên nền tảng Web App bằng React 19, TypeScript và Vite.",
      "Tối ưu hiệu năng tải trang, chỉ số LCP, FID/INP và khả năng responsive đa màn hình.",
      "Xây dựng và duy trì thư viện thành phần dùng chung (Design System / Component Library).",
      "Phối hợp chặt chẽ với Product Owner, UI/UX Designer và Backend Engineers.",
      "Tham gia review code, định hướng kỹ thuật và chia sẻ kiến thức cho các thành viên trong nhóm.",
    ],
    requirements: [
      "Tối thiểu 3 năm kinh nghiệm thực chiến phát triển ứng dụng web hiện đại với React và TypeScript.",
      "Nắm vững JavaScript chuyên sâu (Event Loop, Closures, Async/Await, Memory Management).",
      "Kinh nghiệm làm chủ CSS hiện đại, Tailwind CSS, Responsive Design và CSS Animations.",
      "Hiểu biết sâu sắc về tối ưu hóa hiệu năng trình duyệt, Web Vitals và Network Caching.",
      "Kỹ năng tư duy logic tốt, khả năng tự giải quyết vấn đề và giao tiếp làm việc nhóm hiệu quả.",
    ],
    benefits: [
      "Mức lương cạnh tranh theo năng lực (35 – 50 triệu VNĐ) + Thưởng hiệu quả kinh doanh.",
      "Gói bảo hiểm sức khỏe toàn diện cao cấp cho nhân viên và người thân.",
      "Môi trường làm việc năng động, lộ trình thăng tiến rõ ràng lên Tech Lead / Architect.",
      "Trang bị máy tính Macbook Pro cấu hình cao và phụ cấp ăn trưa, gửi xe.",
    ],
  },
  {
    id: "job-mock-2",
    title: "Fullstack Developer (.NET & React)",
    companyName: "FPT Software",
    location: "Hà Nội / Hybrid",
    salaryText: "25 – 40 triệu VNĐ",
    experienceLevel: "Từ 2 - 4 năm kinh nghiệm",
    workMode: "Toàn thời gian (Hybrid)",
    description:
      "Tham gia xây dựng các hệ thống doanh nghiệp (Enterprise) cho khách hàng toàn cầu. Phát triển các dịch vụ backend hiệu năng cao với .NET 10 Clean Architecture và giao diện Frontend trực quan bằng React/TypeScript.",
    skills: [
      "C# / .NET 10",
      "Clean Architecture",
      "CQRS & MediatR",
      "React",
      "TypeScript",
      "Entity Framework Core",
      "PostgreSQL / SQL Server",
      "Docker",
    ],
    responsibilities: [
      "Thiết kế và lập trình RESTful APIs chuẩn Clean Architecture 4 tầng, áp dụng CQRS và MediatR.",
      "Phát triển giao diện người dùng tương tác cao với React, TanStack Query và Tailwind CSS.",
      "Thiết kế cơ sở dữ liệu quan hệ, tối ưu truy vấn EF Core và xử lý Transaction.",
      "Viết tài liệu API, tham gia Unit Test và tích hợp CI/CD tự động.",
    ],
    requirements: [
      "Từ 2 năm kinh nghiệm làm việc với C# .NET và React.",
      "Hiểu rõ kiến trúc Clean Architecture, nguyên lý SOLID và Design Patterns.",
      "Thành thạo ORM (EF Core), hiểu sâu về lập trình bất đồng bộ (async/await).",
      "Có tư duy tốt về UI/UX và bảo mật ứng dụng web.",
    ],
    benefits: [
      "Lương tháng 13 + thưởng dự án hàng quý.",
      "Cơ hội onsite nước ngoài (Nhật Bản, Singapore, Châu Âu).",
      "Hỗ trợ thi các chứng chỉ quốc tế Microsoft Azure, AWS.",
      "Chế độ làm việc linh hoạt (2 ngày WFH/tuần).",
    ],
  },
  {
    id: "job-mock-3",
    title: "Senior Backend Developer (.NET Core/PostgreSQL)",
    companyName: "Techcombank",
    location: "Hà Nội",
    salaryText: "40 – 60 triệu VNĐ",
    experienceLevel: "Từ 4 - 6 năm kinh nghiệm",
    workMode: "Toàn thời gian (Tại văn phòng)",
    description:
      "Xây dựng hạ tầng thanh toán số và vi dịch vụ (Microservices) chịu tải cao phục vụ hàng triệu khách hàng ngân hàng điện tử. Đảm bảo tính nhất quán dữ liệu, bảo mật và tính sẵn sàng cao 99.99%.",
    skills: [
      ".NET Core",
      "PostgreSQL",
      "Redis Caching",
      "Kafka / RabbitMQ",
      "Microservices",
      "Docker / Kubernetes",
      "High Concurrency",
    ],
    responsibilities: [
      "Thiết kế và triển khai các dịch vụ thanh toán và quản lý giao dịch tài chính.",
      "Tối ưu hóa cơ sở dữ liệu PostgreSQL cho các bảng dữ liệu hàng trăm triệu bản ghi.",
      "Triển khai kiến trúc Event-Driven với Apache Kafka và Redis Distributed Cache.",
      "Theo dõi hệ thống qua Prometheus, Grafana và OpenTelemetry.",
    ],
    requirements: [
      "Tối thiểu 4 năm kinh nghiệm phát triển hệ thống backend với .NET Core.",
      "Kinh nghiệm thực tế xử lý bài toán concurrency, locking, distributed transaction.",
      "Hiểu biết sâu sắc về SQL Tuning, Indexing và Query Execution Plan.",
      "Ưu tiên ứng viên có kinh nghiệm trong lĩnh vực Fintech, Banking hoặc E-Commerce.",
    ],
    benefits: [
      "Mức thu nhập hấp dẫn lên đến 60 triệu VNĐ + Thưởng kết quả kinh doanh ngân hàng.",
      "Vay vốn ưu đãi mua nhà/xe dành cho cán bộ nhân viên.",
      "Gói khám sức khỏe định kỳ VIP tại bệnh viện quốc tế.",
    ],
  },
  {
    id: "job-mock-4",
    title: "UI/UX & Web Performance Engineer",
    companyName: "MoMo (M-Service)",
    location: "Thành phố Hồ Chí Minh",
    salaryText: "30 – 45 triệu VNĐ",
    experienceLevel: "Từ 2 - 4 năm kinh nghiệm",
    workMode: "Toàn thời gian",
    description:
      "Tối ưu trải nghiệm số cho siêu ứng dụng MoMo trên nền tảng web và webview. Chuyển hóa các bản thiết kế Figma sáng tạo thành giao diện mượt mà, tốc độ phản hồi tính bằng mili-giây.",
    skills: [
      "React",
      "Tailwind CSS",
      "Framer Motion",
      "GSAP",
      "Accessibility (a11y)",
      "Mobile Webview Optimization",
      "Figma to Code",
    ],
    responsibilities: [
      "Lập trình giao diện người dùng mượt mà, tích hợp animation tinh tế bằng Motion và GSAP.",
      "Tối ưu tốc độ tải trang ban đầu (First Contentful Paint < 1s) cho môi trường mạng di động 4G/5G.",
      "Đảm bảo tuân thủ tiêu chuẩn Accessibility (A11y) và trải nghiệm cảm ứng hoàn hảo.",
    ],
    requirements: [
      "Ít nhất 2 năm kinh nghiệm chuyên sâu về Frontend UI và Animation.",
      "Mắt thẩm mỹ tốt, kỹ lưỡng đến từng pixel (pixel-perfect).",
      "Thành thạo công cụ đo lường hiệu năng Lighthouse, Chrome DevTools Performance.",
    ],
    benefits: [
      "Môi trường công nghệ Fintech hàng đầu Việt Nam.",
      "Cung cấp bữa trưa miễn phí tại công ty, pantry đồ uống phong phú.",
      "Chính sách bảo hiểm sức khỏe cao cấp MoMo Care.",
    ],
  },
  {
    id: "job-mock-5",
    title: "Software Engineering Lead",
    companyName: "Shopee Vietnam",
    location: "Thành phố Hồ Chí Minh",
    salaryText: "50 – 75 triệu VNĐ",
    experienceLevel: "Trên 5 năm kinh nghiệm",
    workMode: "Toàn thời gian",
    description:
      "Dẫn dắt kỹ thuật cho đội ngũ kỹ sư phần mềm phát triển các giải pháp thương mại điện tử quy mô lớn. Quyết định kiến trúc hệ thống, chuẩn hóa quy trình kỹ thuật và thúc đẩy đổi mới công nghệ.",
    skills: [
      "Technical Leadership",
      "System Design",
      "Distributed Systems",
      "Microservices",
      "Mentorship",
      "Agile / Scrum",
    ],
    responsibilities: [
      "Định hình kiến trúc và chiến lược kỹ thuật cho phân hệ sản phẩm quan trọng.",
      "Hướng dẫn, đào tạo và phát triển năng lực cho các kỹ sư trong team.",
      "Giải quyết các nút thắt cổ chai về hiệu năng và mở rộng hệ thống (scalability).",
      "Đảm bảo tiến độ bàn giao sản phẩm với chất lượng code cao nhất.",
    ],
    requirements: [
      "Từ 5 năm kinh nghiệm phát triển phần mềm, trong đó ít nhất 1 năm làm vai trò Lead.",
      "Kinh nghiệm dày dặn về thiết kế hệ thống phân tán chịu tải lớn.",
      "Kỹ năng lãnh đạo, giao tiếp và giải quyết xung đột xuất sắc.",
    ],
    benefits: [
      "Chế độ đãi ngộ hàng đầu thị trường công nghệ.",
      "Thưởng cổ phiếu và các quyền lợi đặc biệt cho cấp quản lý kỹ thuật.",
      "Môi trường đa văn hóa, làm việc cùng các chuyên gia hàng đầu khu vực.",
    ],
  },
];

/**
 * Sinh đề xuất mẫu thông minh theo từng section có nội dung thực tế của CV,
 * bám sát chuẩn Google XYZ và ngữ cảnh của Job mục tiêu đã chọn.
 */
export function createMockSuggestionsForSections(
  sections: PreparedCvSection[],
  targetJob: TargetJobOption,
): CvSectionSuggestion[] {
  return sections.map((sec, idx) => {
    let suggestedText = "";
    let reason = "";

    switch (sec.sectionType) {
      case "OBJECTIVE":
        suggestedText = `Kỹ sư phần mềm định hướng vị trí ${targetJob.title} với nền tảng kỹ thuật vững chắc và tư duy sản phẩm nhạy bén. Tập trung kiến tạo các giải pháp kỹ thuật hiệu năng cao, tối ưu hóa trải nghiệm người dùng và đóng góp vào mục tiêu phát triển bền vững của ${targetJob.companyName}.`;
        reason = `Tối ưu câu văn theo công thức Google XYZ, hướng thẳng vào vị trí ${targetJob.title} tại ${targetJob.companyName}.`;
        break;

      case "EXPERIENCE":
        suggestedText = `${sec.content}\n\n[Đề xuất tối ưu hóa theo chuẩn Google XYZ]:\n• Chủ trì thiết kế kiến trúc và triển khai các tính năng cốt lõi cho vị trí ${targetJob.title}, giúp rút ngắn 30% thời gian phát hành sản phẩm.\n• Tối ưu hiệu năng truy vấn và tải trang, giảm 40% độ trễ hệ thống và cải thiện chỉ số hài lòng của người dùng.\n• Chuẩn hóa quy trình kiểm thử và CI/CD, giảm thiểu 25% lỗi phát sinh trong môi trường production.`;
        reason =
          "Bổ sung số liệu đo lường định lượng và động từ hành động mạnh (Chủ trì, Tối ưu, Chuẩn hóa).";
        break;

      case "SKILLS":
        suggestedText = `[Kỹ năng chuyên môn cốt lõi]:\n${sec.content}\n\n[Từ khóa đề xuất bổ sung theo JD ${targetJob.title}]:\n• ${targetJob.skills?.slice(0, 5).join(", ") || "System Architecture, Performance Optimization, Clean Architecture, CI/CD, Agile/Scrum"}.`;
        reason = `Đồng bộ từ vựng kỹ thuật chuẩn hóa theo yêu cầu tuyển dụng của ${targetJob.companyName}.`;
        break;

      case "PROJECTS":
        suggestedText = `${sec.content}\n\n[Điểm nhấn giá trị gia tăng]:\n• Áp dụng kiến trúc Clean Architecture giúp mở rộng module dễ dàng và dễ bảo trì.\n• Đạt hiệu năng xử lý ổn định với độ sẵn sàng 99.9%, hỗ trợ hàng ngàn người dùng đồng thời.`;
        reason = "Làm nổi bật tác động kỹ thuật và giá trị thực tế của dự án.";
        break;

      case "EDUCATION":
        suggestedText = `${sec.content}\n• Tốt nghiệp chuyên ngành Công nghệ thông tin với nền tảng thuật toán, cấu trúc dữ liệu và kỹ thuật phần mềm vững chắc.`;
        reason = "Nhấn mạnh nền tảng học thuật bổ trợ trực tiếp cho công việc.";
        break;

      case "CERTIFICATIONS":
        suggestedText = `${sec.content}\n• Chứng chỉ chuyên môn quốc tế chứng minh năng lực kỹ thuật và cam kết không ngừng nâng cao trình độ.`;
        reason = "Khẳng định giá trị của chứng chỉ chuyên môn.";
        break;

      case "AWARDS":
        suggestedText = `${sec.content}\n• Thành tích ghi nhận sự cống hiến và năng lực vượt trội trong quá trình học tập và làm việc.`;
        reason = "Làm nổi bật mức độ cạnh tranh và năng lực cá nhân.";
        break;

      default:
        suggestedText = sec.content;
        reason = "Đề xuất chuẩn hóa câu chữ và cấu trúc mạch lạc hơn.";
        break;
    }

    return {
      id: `sug-${sec.sectionKey}-${Date.now()}-${idx}`,
      sectionType: sec.sectionType,
      sectionKey: sec.sectionKey,
      sectionTitle: sec.sectionTitle,
      originalText: sec.content,
      suggestedText,
      status: "ready",
      reason,
    };
  });
}

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
      assessedAt: "3 ngày trước",
      summary: "Phiên bản khởi tạo ban đầu, các mô tả kinh nghiệm còn ngắn gọn.",
    },
    {
      id: "score-h2",
      score: 78,
      assessedAt: "Hôm nay",
      summary: "Đã bổ sung thêm số liệu định lượng và hoàn thiện mục dự án.",
    },
  ],
};

export const MOCK_SUGGESTED_JOBS: SuggestedJobItem[] = [
  {
    id: "job-sug-1",
    title: "Senior Frontend Engineer (React/TypeScript)",
    companyName: "VNG Corporation",
    location: "TP. Hồ Chí Minh",
    salaryText: "35 - 50 triệu",
    matchPercentage: 92,
  },
  {
    id: "job-sug-2",
    title: "Frontend Developer (Next.js & Tailwind)",
    companyName: "Tiki Corporation",
    location: "TP. Hồ Chí Minh",
    salaryText: "25 - 35 triệu",
    matchPercentage: 86,
  },
  {
    id: "job-sug-3",
    title: "Web UI/UX Developer",
    companyName: "FPT Software",
    location: "Đà Nẵng",
    salaryText: "20 - 30 triệu",
    matchPercentage: 74,
  },
];
