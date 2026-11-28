export interface BlogAuthor {
  name: string;
  role: string;
  avatar: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  categorySlug: string;
  imageUrl: string;
  author: BlogAuthor;
  publishedAt: string;
  readTime: string;
  views: number;
  likes: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  tags: string[];
}

export const BLOG_CATEGORIES = [
  { id: "all", name: "Tất cả", slug: "all" },
  { id: "cv-tips", name: "Viết CV chuẩn ATS", slug: "cv-tips" },
  { id: "interview", name: "Kỹ năng phỏng vấn", slug: "interview" },
  { id: "salary", name: "Đàm phán lương", slug: "salary" },
  { id: "career-growth", name: "Phát triển sự nghiệp", slug: "career-growth" },
  { id: "tech-trends", name: "Xu hướng & AI", slug: "tech-trends" },
  { id: "workplace", name: "Văn hóa công sở", slug: "workplace" },
] as const;

export const POPULAR_TAGS = [
  "#VietCV",
  "#ATS",
  "#PhongVan",
  "#STARMethod",
  "#LuongThuong",
  "#AI",
  "#RemoteWork",
  "#GenZ",
  "#LinkedIn",
  "#PersonalBranding",
  "#ThuViec",
  "#Teamwork",
] as const;

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    slug: "ai-trong-tuyen-dung-2026-bi-quyet-vuot-qua-ats",
    title:
      "Ứng dụng AI trong tuyển dụng 2026: Bí quyết để CV của bạn vượt qua vòng quét tự động ATS",
    excerpt:
      "Hơn 85% doanh nghiệp hàng đầu hiện nay áp dụng hệ thống ATS kết hợp AI để sàng lọc hồ sơ. Khám phá cách cấu trúc từ khóa, định dạng chuẩn và tối ưu ngữ nghĩa giúp CV luôn lọt vào mắt xanh nhà tuyển dụng.",
    category: "Xu hướng & AI",
    categorySlug: "tech-trends",
    imageUrl:
      "https://cl-wpml.careerlink.vn/cam-nang-viec-lam/wp-content/uploads/2026/03/16143457/ky-nang-su-dung-ai-trong-cong-viec-1024x559.jpg",
    author: {
      name: "Trần Minh Anh",
      role: "Trưởng nhóm Tư vấn Hướng nghiệp SmartHire",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2026-11-05",
    readTime: "6 phút đọc",
    views: 4520,
    likes: 342,
    isFeatured: true,
    tags: ["#AI", "#VietCV", "#ATS", "#TechTrends"],
    content: [
      "Hệ thống theo dõi ứng viên (Applicant Tracking System - ATS) không còn là khái niệm xa lạ. Tuy nhiên, bước sang năm 2026, ATS đã được nâng cấp mạnh mẽ với mô hình ngôn ngữ lớn (LLM) và vector embedding, cho phép phân tích ngữ cảnh chuyên môn sâu sắc thay vì chỉ đếm từ khóa cứng nhắc.",
      "Để CV của bạn đạt điểm tương thích (Match Score) cao nhất trên các hệ thống như SmartHire, bạn cần nắm rõ 3 nguyên tắc cốt lõi: định dạng tiêu chuẩn một cột rõ ràng, tích hợp từ khóa hành động định lượng (Action Verbs + Impact Metrics) và đối chiếu chính xác các kỹ năng cốt lõi được yêu cầu trong bản tin tuyển dụng.",
      "Đặc biệt, đừng bao giờ 'nhồi nhét từ khóa ẩn' (invisible keywords) bằng chữ màu trắng. Các thuật toán AI hiện đại sẽ gắn cờ gian lận và loại bỏ hồ sơ ngay lập tức. Thay vào đó, hãy mô tả chân thực các thành tích của bạn theo công thức XYZ của Google: Đã hoàn thành [X], đo lường bằng [Y], bằng cách thực hiện [Z].",
      "Hãy sử dụng công cụ kiểm tra độ tương thích CV trên SmartHire trước khi gửi hồ sơ để nhận các đề xuất tối ưu câu từ tự nhiên và gia tăng cơ hội nhận lời mời phỏng vấn lên gấp 3 lần.",
    ],
  },
  {
    id: "blog-2",
    slug: "chien-luoc-dam-phan-luong-tang-20-35-phan-tram",
    title:
      "Chiến lược đàm phán lương: 5 nguyên tắc vàng giúp bạn tăng 20-35% thu nhập khi chuyển việc",
    excerpt:
      "Đàm phán lương không phải cuộc mặc cả, mà là buổi thảo luận chuyên nghiệp xác lập giá trị bạn mang lại. Nắm vững nghệ thuật đưa ra khoảng lương mục tiêu và thương lượng phúc lợi bổ sung.",
    category: "Đàm phán lương",
    categorySlug: "salary",
    imageUrl:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Nguyễn Hải Đăng",
      role: "Chuyên gia Đãi ngộ & Nhân tài (C&B Lead)",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2026-11-04",
    readTime: "7 phút đọc",
    views: 3890,
    likes: 289,
    isTrending: true,
    tags: ["#LuongThuong", "#DamPhan", "#CareerGrowth"],
    content: [
      "Nhiều ứng viên thường có tâm lý ngại ngùng hoặc sợ mất offer khi nói về mức lương mong muốn. Thực tế, nhà tuyển dụng chuyên nghiệp luôn kỳ vọng ứng viên biết rõ giá trị của mình trên thị trường lao động.",
      "Bước đầu tiên là khảo sát kỹ lưỡng dải lương chuẩn (Market Benchmark) cho vị trí và số năm kinh nghiệm của bạn trên các báo cáo lương uy tín. Khi được hỏi mức lương mong đợi, hãy đưa ra một khoảng linh hoạt (Range) thay vì con số cố định, và để mức sàn của khoảng đó là con số bạn thực sự hài lòng.",
      "Ngoài lương cứng, tổng đãi ngộ (Total Compensation) bao gồm: thưởng hiệu suất (Performance Bonus), số ngày phép năm, phụ cấp đào tạo, bảo hiểm sức khỏe cao cấp và quyền mua cổ phần (ESOP). Đôi khi, thương lượng linh hoạt các quyền lợi này còn mang lại giá trị thực tế cao hơn so với lương thuần.",
    ],
  },
  {
    id: "blog-3",
    slug: "mau-don-xin-nghi-viec-chuan-2026-va-cach-viet-chuyen-nghiep",
    title:
      "Mẫu đơn xin nghỉ việc chuẩn 2026 và quy trình bàn giao giữ trọn sự tôn trọng đôi bên",
    excerpt:
      "Cách bạn rời đi quyết định danh tiếng nghề nghiệp lâu dài. Hướng dẫn soạn thảo thư từ nhiệm lịch thiệp, tuân thủ quy định pháp luật và để lại ấn tượng tốt đẹp với đồng nghiệp.",
    category: "Văn hóa công sở",
    categorySlug: "workplace",
    imageUrl:
      "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Lê Thị Thu Thảo",
      role: "HRBP Director",
      avatar:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2026-11-03",
    readTime: "5 phút đọc",
    views: 5120,
    likes: 410,
    isTrending: true,
    tags: ["#CongSo", "#ChuyenNghiep", "#HRBP"],
    content: [
      "Thế giới nghề nghiệp trong một ngành hẹp thường nhỏ hơn bạn nghĩ. Một bức thư xin nghỉ việc chuẩn mực và thái độ tích cực trong thời gian chuyển giao sẽ mở ra nhiều cánh cửa cơ hội và lời giới thiệu (Reference Check) đắt giá trong tương lai.",
      "Một lá đơn xin nghỉ việc chuyên nghiệp nên bao gồm 4 phần: Thông báo rõ ràng ngày làm việc cuối cùng theo hợp đồng lao động; Lời cảm ơn chân thành đến ban lãnh đạo và đồng đội; Cam kết bàn giao công việc chi tiết; và Lời chúc tốt đẹp cho sự phát triển của công ty.",
      "Tránh tuyệt đối việc xả bức xúc hoặc chỉ trích chính sách trong đơn xin nghỉ việc. Mọi góp ý mang tính xây dựng nên được chia sẻ khéo léo trong buổi phỏng vấn thôi việc (Exit Interview).",
    ],
  },
  {
    id: "blog-4",
    slug: "tra-loi-cau-hoi-diem-yeu-lon-nhat-theo-star",
    title:
      "Vượt qua câu hỏi phỏng vấn hóc búa: 'Điểm yếu lớn nhất của bạn là gì?' theo phương pháp STAR",
    excerpt:
      "Đừng trả lời 'Tôi là người cầu toàn' hay 'Tôi làm việc quá chăm chỉ'. Học cách bộc lộ điểm cần cải thiện một cách khéo léo, thể hiện tinh thần cầu thị và năng lực tự nhận thức cao.",
    category: "Kỹ năng phỏng vấn",
    categorySlug: "interview",
    imageUrl:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Hoàng Đức Duy",
      role: "Tech Recruiter & Career Coach",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2026-11-02",
    readTime: "5 phút đọc",
    views: 3410,
    likes: 215,
    isTrending: true,
    tags: ["#PhongVan", "#STARMethod", "#KyNang"],
    content: [
      "Nhà tuyển dụng hỏi câu này không phải để tìm cớ loại bạn, mà để kiểm tra mức độ tự nhận thức (Self-awareness) và hành động cụ thể bạn đã thực hiện để khắc phục hạn chế của bản thân.",
      "Công thức vàng khi trả lời: Chọn một điểm yếu THẬT nhưng không phải là kỹ năng sống còn bắt buộc của vị trí; Giải thích bối cảnh nó đã ảnh hưởng thế nào trong quá khứ; và quan trọng nhất là nêu bật các giải pháp bạn đang áp dụng (khóa học, công cụ, thói quen mới) và kết quả cải thiện đã đạt được.",
      "Ví dụ: 'Trước đây tôi gặp khó khăn trong việc thuyết trình trước đám đông. Tôi đã chủ động tham gia câu lạc bộ Toastmasters và tình nguyện dẫn dắt các buổi chia sẻ nội bộ. Hiện tại tôi đã tự tin trình bày dự án trước ban giám đốc một cách mạch lạc.'",
    ],
  },
  {
    id: "blog-5",
    slug: "viet-kinh-nghiem-lam-viec-hut-mat-nha-tuyen-dung-6-giay",
    title:
      "Cách viết phần 'Kinh nghiệm làm việc' trong CV khiến nhà tuyển dụng dừng lại trong 6 giây đầu",
    excerpt:
      "Đừng chỉ liệt kê mô tả công việc như bản phân công nhiệm vụ. Biến từng gạch đầu dòng thành câu chuyện thành tích định lượng với các chỉ số kinh doanh ấn tượng.",
    category: "Viết CV chuẩn ATS",
    categorySlug: "cv-tips",
    imageUrl:
      "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Trần Minh Anh",
      role: "Trưởng nhóm Tư vấn Hướng nghiệp SmartHire",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2026-11-01",
    readTime: "6 phút đọc",
    views: 2980,
    likes: 245,
    isTrending: true,
    tags: ["#VietCV", "#ATS", "#CVChuan"],
    content: [
      "Nhà tuyển dụng trung bình chỉ dành 6 đến 8 giây để quét nhanh một hồ sơ ứng viên trước khi quyết định xem tiếp hay chuyển sang người khác. Phần kinh nghiệm làm việc chính là thỏi nam châm giữ chân họ.",
      "Thay vì viết: 'Chịu trách nhiệm quản lý fanpage và viết bài', hãy viết: 'Xây dựng chiến lược nội dung đa kênh, tăng trưởng 120% tương tác tự nhiên và mang lại hơn 300 khách hàng tiềm năng mỗi tháng với ngân sách tối ưu 25%'.",
      "Sắp xếp kinh nghiệm theo trình tự thời gian đảo ngược (kinh nghiệm gần nhất lên đầu), sử dụng font chữ dễ đọc như Montserrat hoặc Inter, và đảm bảo ngắt đoạn thoáng đãng, dễ quét thông tin.",
    ],
  },
  {
    id: "blog-6",
    slug: "xay-dung-thuong-hieu-ca-nhan-tren-linkedin",
    title:
      "Xây dựng thương hiệu cá nhân trên LinkedIn: Từng bước tối ưu Headline, About và mạng lưới kết nối",
    excerpt:
      "Biến trang cá nhân LinkedIn của bạn thành cỗ máy thu hút lời mời việc làm tự động từ các Headhunter và doanh nghiệp uy tín mà không cần nộp hồ sơ chủ động.",
    category: "Phát triển sự nghiệp",
    categorySlug: "career-growth",
    imageUrl:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Phạm Quốc Toàn",
      role: "Talent Acquisition Specialist",
      avatar:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2026-10-30",
    readTime: "8 phút đọc",
    views: 3120,
    likes: 198,
    tags: ["#LinkedIn", "#PersonalBranding", "#Networking"],
    content: [
      "Thuật toán tìm kiếm của LinkedIn hoạt động tương tự như Google SEO. Một tiêu đề (Headline) chứa các từ khóa chuyên ngành chuẩn mực kết hợp tuyên ngôn giá trị sẽ giúp hồ sơ của bạn luôn xuất hiện trong top đầu kết quả của nhà tuyển dụng.",
      "Phần 'About' không nên là bản copy thô từ CV, mà hãy viết theo lối kể chuyện (Storytelling): Tại sao bạn yêu thích lĩnh vực này, những bài toán thú vị bạn từng giải quyết và sứ mệnh nghề nghiệp bạn đang theo đuổi.",
      "Hãy tích cực bình luận có chiều sâu dưới các bài đăng chuyên ngành của các chuyên gia trong ngành ít nhất 3 lần mỗi tuần để mở rộng vòng kết nối giá trị cao.",
    ],
  },
  {
    id: "blog-7",
    slug: "gen-z-noi-cong-so-vuot-qua-imposter-syndrome",
    title:
      "Gen Z nơi công sở: Định vị giá trị thực tế, vượt qua hội chứng kẻ giả mạo (Imposter Syndrome)",
    excerpt:
      "Cảm giác 'mình không đủ giỏi' hay 'mình may mắn mới được nhận' là trạng thái tâm lý phổ biến của hơn 70% người trẻ đi làm. Bí quyết xây dựng sự tự tin nội tại và giải phóng tiềm năng.",
    category: "Văn hóa công sở",
    categorySlug: "workplace",
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Lê Thị Thu Thảo",
      role: "HRBP Director",
      avatar:
        "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2026-10-28",
    readTime: "6 phút đọc",
    views: 2650,
    likes: 310,
    tags: ["#GenZ", "#TamLyCongSo", "#ImposterSyndrome"],
    content: [
      "Hội chứng kẻ giả mạo thường tấn công mạnh nhất vào những người cầu tiến và có trách nhiệm cao. Bạn luôn lo sợ người khác sẽ phát hiện ra mình không tài năng như họ nghĩ.",
      "Một cách hiệu quả để đối phó là lập riêng một tài liệu mang tên 'Tủ sách chiến thắng' (Brag Sheet), nơi bạn ghi lại mọi lời khen từ cấp trên, phản hồi tích cực từ khách hàng và các số liệu dự án đã hoàn thành.",
      "Nhận thức rằng không ai biết tất cả mọi thứ ngay từ ngày đầu. Khả năng học hỏi nhanh và dám đặt câu hỏi đúng mới là tài sản lớn nhất của thế hệ trẻ trong môi trường làm việc hiện đại.",
    ],
  },
  {
    id: "blog-8",
    slug: "xu-huong-lam-viec-hybrid-va-giao-tiep-bat-dong-bo",
    title:
      "Xu hướng làm việc Hybrid & Remote: Cách xây dựng kỷ luật và giao tiếp bất đồng bộ (Asynchronous)",
    excerpt:
      "Làm việc từ xa không chỉ đơn thuần là ngồi ở nhà mở laptop. Làm chủ kỹ năng viết tài liệu rõ ràng, quản lý thời gian cá nhân và giữ cân bằng giữa công việc và cuộc sống.",
    category: "Xu hướng & AI",
    categorySlug: "tech-trends",
    imageUrl:
      "https://images.unsplash.com/photo-1593642532400-2682810df593?auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Hoàng Đức Duy",
      role: "Tech Recruiter & Career Coach",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2026-10-25",
    readTime: "7 phút đọc",
    views: 2790,
    likes: 180,
    tags: ["#RemoteWork", "#Hybrid", "#Productivity"],
    content: [
      "Giao tiếp bất đồng bộ (Asynchronous Communication) là nền móng của các doanh nghiệp toàn cầu. Thay vì gọi họp liên tục, hãy rèn luyện kỹ năng truyền đạt ý tưởng mạch lạc bằng văn bản kèm đầy đủ ngữ cảnh để đồng đội có thể phản hồi khi sẵn sàng.",
      "Thiết lập ranh giới làm việc rõ ràng: Chuẩn bị một góc làm việc riêng biệt, tắt thông báo công việc sau giờ hành chính và chủ động cập nhật tiến độ công việc trước khi cấp trên yêu cầu.",
      "Chủ động lên lịch các cuộc gặp gỡ trực tiếp định kỳ cùng đội ngũ để nuôi dưỡng sự gắn kết tinh thần và thấu hiểu nhau sâu sắc hơn.",
    ],
  },
  {
    id: "blog-9",
    slug: "nhay-viec-hay-o-lai-bo-tieu-chi-4-chieu",
    title:
      "Nhảy việc hay ở lại? Bộ tiêu chí 4 chiều giúp bạn ra quyết định sự nghiệp sáng suốt",
    excerpt:
      "Đang cảm thấy bế tắc nhưng phân vân không biết có nên nộp đơn xin nghỉ? Phân tích 4 trụ cột: Học hỏi, Thu nhập, Văn hóa và Lộ trình thăng tiến để có câu trả lời rõ ràng.",
    category: "Phát triển sự nghiệp",
    categorySlug: "career-growth",
    imageUrl:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    author: {
      name: "Nguyễn Hải Đăng",
      role: "Chuyên gia Đãi ngộ & Nhân tài (C&B Lead)",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2026-10-22",
    readTime: "6 phút đọc",
    views: 3400,
    likes: 270,
    tags: ["#DinhHuong", "#PhatTrien", "#DecisionMaking"],
    content: [
      "Quyết định chuyển việc khi đang cảm xúc tiêu cực nhất thời thường dẫn đến hối tiếc. Bạn cần một ma trận đánh giá khách quan dựa trên dữ liệu thực tế của chính mình.",
      "4 trụ cột cần cân nhắc: 1. Năng lực học hỏi (Bạn còn học được gì mới không?); 2. Mức thu nhập (Có cạnh tranh so với thị trường không?); 3. Môi trường & Văn hóa (Bạn có được tôn trọng và an toàn tâm lý không?); 4. Tầm nhìn tổ chức (Công ty có đang tăng trưởng ổn định?).",
      "Nếu có từ 2 trụ cột trở lên không còn đáp ứng được nguyện vọng của bạn trong suốt 6 tháng liên tiếp, đó là tín hiệu rõ ràng cho thấy đã đến lúc bạn bước ra khỏi vùng an toàn.",
    ],
  },
];
