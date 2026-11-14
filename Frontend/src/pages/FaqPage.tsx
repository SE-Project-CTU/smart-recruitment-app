import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronDown,
  Sparkles,
  FileText,
  Briefcase,
  ShieldCheck,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Phone,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { PATHS } from "@/constants/paths";
import { Button } from "@/components/common";
import {
  OfficeGirl2NoBg,
  ResumeHolder,
  CandidateMatching,
  EmptyState,
} from "@/assets/images/decoration";

// =============================================================================
// FAQ DATA DEFINITION
// =============================================================================

export interface FaqItem {
  id: string;
  category: "cv_ai" | "job_apply" | "recruiter" | "account_security";
  question: string;
  answer: string | React.ReactNode;
  tags: string[];
  featured?: boolean;
}

export interface FaqCategory {
  id: "all" | "cv_ai" | "job_apply" | "recruiter" | "account_security";
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  bannerImage?: string;
  sketchLabel?: string;
}

const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: "all",
    label: "Tất cả câu hỏi",
    description: "Tổng hợp toàn bộ thông tin hướng dẫn và câu hỏi thường gặp",
    icon: HelpCircle,
    accentColor: "text-primary",
  },
  {
    id: "cv_ai",
    label: "Tạo CV & Trợ lý AI",
    description: "Công nghệ biên tập CV trực quan, gợi ý nội dung và tính điểm Match Score",
    icon: Sparkles,
    accentColor: "text-amber-500",
    sketchLabel: "AI Smart Assistant",
  },
  {
    id: "job_apply",
    label: "Tìm việc & Ứng tuyển",
    description: "Quy trình tìm kiếm cơ hội, nộp hồ sơ và theo dõi tiến trình tuyển dụng",
    icon: Briefcase,
    accentColor: "text-blue-500",
    sketchLabel: "Career Flow",
  },
  {
    id: "recruiter",
    label: "Đăng tin & Tuyển dụng",
    description: "Dành cho HR & Doanh nghiệp: tạo tin tuyển dụng, sàng lọc và duyệt ứng viên",
    icon: FileText,
    accentColor: "text-indigo-500",
    sketchLabel: "HR Solution",
  },
  {
    id: "account_security",
    label: "Tài khoản & Bảo mật",
    description: "Đăng nhập Google, thiết lập quyền riêng tư và chính sách an toàn dữ liệu",
    icon: ShieldCheck,
    accentColor: "text-emerald-500",
    sketchLabel: "Privacy & Safe",
  },
];

const FAQ_ITEMS: FaqItem[] = [
  // --- Nhóm 1: Tạo CV & AI ---
  {
    id: "cv-1",
    category: "cv_ai",
    question: "SmartHire AI hỗ trợ viết CV và chấm điểm tương thích (Match Score) như thế nào?",
    answer:
      "SmartHire sử dụng mô hình AI và công nghệ trích xuất vector embedding để so khớp khách quan giữa hồ sơ CV của bạn với bản mô tả công việc (JD). AI phân tích các khía cạnh: kỹ năng chuyên môn, kinh nghiệm thực chiến và mức độ phù hợp. Quan trọng nhất, AI luôn giữ vai trò cố vấn đồng hành: chỉ đưa ra gợi ý hoàn thiện câu từ, tối ưu từ khóa ngành nghề mà tuyệt đối không tự ý chỉnh sửa hay ghi đè nội dung của bạn.",
    tags: ["AI", "Match Score", "Gợi ý", "So khớp JD"],
    featured: true,
  },
  {
    id: "cv-2",
    category: "cv_ai",
    question: "Tôi có thể xuất CV ra định dạng PDF hoặc in trực tiếp không?",
    answer:
      "Có. Trình tạo CV của SmartHire tích hợp công cụ render chuẩn pixel theo khổ giấy A4 tiêu chuẩn. Bạn có thể nhấn 'Tải xuống PDF' hoặc 'In trực tiếp' với bố cục được bảo toàn chính xác 100%, không bị xô lệch lề hay vỡ phông chữ khi gửi cho nhà tuyển dụng.",
    tags: ["Xuất PDF", "In ấn", "Khổ giấy A4", "Tải xuống"],
    featured: true,
  },
  {
    id: "cv-3",
    category: "cv_ai",
    question: "SmartHire có tự động chỉnh sửa thông tin hoặc câu từ trong CV của tôi không?",
    answer:
      "Tuyệt đối không. Triết lý của SmartHire là tôn trọng quyền sở hữu thông tin của ứng viên. Tất cả các gợi ý tối ưu từ trợ lý AI (cải thiện văn phong, thêm số liệu định lượng, sửa lỗi ngữ pháp) đều hiển thị dưới dạng đề xuất (Suggestion). Bạn toàn quyền quyết định 'Áp dụng' hay 'Bỏ qua'.",
    tags: ["Bảo vệ dữ liệu", "Quyền ứng viên", "Gợi ý AI"],
  },
  {
    id: "cv-4",
    category: "cv_ai",
    question: "Tôi có thể tạo bao nhiêu phiên bản CV trên cùng một tài khoản?",
    answer:
      "Bạn có thể tạo và lưu trữ không giới hạn các phiên bản CV khác nhau (ví dụ: phiên bản tiếng Việt, tiếng Anh, CV định hướng Frontend, Backend,...). Mỗi CV có thể tùy chỉnh bố cục, màu sắc và phông chữ riêng biệt theo từng cơ hội việc làm cụ thể.",
    tags: ["Nhiều CV", "Quản lý CV", "Tùy biến mẫu"],
  },

  // --- Nhóm 2: Tìm việc & Ứng tuyển ---
  {
    id: "job-1",
    category: "job_apply",
    question: "Làm thế nào để theo dõi tiến độ xét duyệt hồ sơ sau khi ứng tuyển?",
    answer:
      "Ngay sau khi nộp hồ sơ, bạn có thể truy cập mục 'Theo dõi hồ sơ' (Application Tracking) trên thanh điều hướng cá nhân. Tại đây, trạng thái hồ sơ được cập nhật minh bạch qua từng giai đoạn: Đã gửi -> Nhà tuyển dụng đã xem -> Phù hợp / Hẹn phỏng vấn -> Trúng tuyển hoặc Chưa phù hợp kèm lý do (nếu có).",
    tags: ["Theo dõi", "Trạng thái ứng tuyển", "Tiến độ xét duyệt"],
    featured: true,
  },
  {
    id: "job-2",
    category: "job_apply",
    question: "Tôi có thể hủy ứng tuyển hoặc cập nhật lại CV sau khi đã gửi đi không?",
    answer:
      "Khi hồ sơ ở trạng thái 'Đã gửi' và nhà tuyển dụng chưa mở xem, bạn vẫn có thể rút đơn ứng tuyển hoặc nộp lại phiên bản CV mới nhất. Một khi nhà tuyển dụng đã chuyển sang trạng thái xét duyệt hoặc xếp lịch phỏng vấn, hồ sơ sẽ được khóa để đảm bảo tính minh bạch cho quy trình tuyển dụng.",
    tags: ["Hủy nộp đơn", "Cập nhật CV", "Đổi hồ sơ"],
  },
  {
    id: "job-3",
    category: "job_apply",
    question: "Làm sao để nhận gợi ý việc làm phù hợp nhất với kỹ năng của tôi?",
    answer:
      "Hệ thống SmartHire liên tục đối soát kỹ năng trong hồ sơ mặc định của bạn với các tin tuyển dụng mới mở. Bạn có thể bật tính năng 'Bật thông báo việc làm phù hợp' trong Cài đặt tài khoản để nhận email và thông báo đẩy ngay khi có vị trí có điểm tương đồng trên 80%.",
    tags: ["Gợi ý việc làm", "Matching", "Thông báo"],
  },
  {
    id: "job-4",
    category: "job_apply",
    question: "Nhà tuyển dụng có xem được các CV khác mà tôi không chọn để nộp không?",
    answer:
      "Không. Nhà tuyển dụng chỉ xem được duy nhất bản snapshot của CV mà bạn đã chỉ định tại thời điểm nộp đơn cho công việc đó. Các phiên bản CV khác trong kho lưu trữ của bạn hoàn toàn riêng tư.",
    tags: ["Bảo mật CV", "Quyền riêng tư", "Snapshot CV"],
  },

  // --- Nhóm 3: Đăng tin & Tuyển dụng ---
  {
    id: "recruiter-1",
    category: "recruiter",
    question: "Quy trình đăng tin tuyển dụng mới dành cho doanh nghiệp diễn ra như thế nào?",
    answer:
      "Nhà tuyển dụng đăng nhập vào Dashboard Doanh nghiệp, chọn 'Tạo tin tuyển dụng'. Hệ thống hỗ trợ nhập liệu thông minh với các trường chức danh, địa điểm làm việc, mức lương tự động định dạng tiền tệ và bộ kỹ năng tiêu chuẩn. Tin đăng sau khi tạo sẽ được kích hoạt ngay lập tức để tiếp cận hàng nghìn ứng viên tiềm năng.",
    tags: ["Đăng tin", "HR", "Mô tả công việc", "JD"],
    featured: true,
  },
  {
    id: "recruiter-2",
    category: "recruiter",
    question: "Tính năng xem CV trực tuyến (Online CV Viewer) hoạt động như thế nào?",
    answer:
      "Nhà tuyển dụng có thể xem hồ sơ ứng viên trực tiếp trên giao diện trình duyệt mà không cần tải file về máy. Trình xem CV hỗ trợ hiển thị bố cục chuẩn hóa, ảnh đại diện, danh sách dự án, trình độ học vấn cùng điểm Match Score tính toán tự động giữa CV và yêu cầu bài đăng.",
    tags: ["Xem CV online", "Sàng lọc ứng viên", "Không cần tải file"],
  },
  {
    id: "recruiter-3",
    category: "recruiter",
    question: "Doanh nghiệp có thể quản lý trạng thái ứng viên theo quy trình nhiều vòng không?",
    answer:
      "Có. SmartHire cung cấp bảng quản lý trạng thái Kanban/Table trực quan: tiếp nhận hồ sơ, đánh dấu phù hợp, gửi lời mời phỏng vấn và gửi thông báo kết quả qua email tự động chỉ với 1 cú nhấp chuột.",
    tags: ["Quy trình tuyển dụng", "Quản lý ứng viên", "Phỏng vấn"],
  },

  // --- Nhóm 4: Tài khoản & Bảo mật ---
  {
    id: "sec-1",
    category: "account_security",
    question: "Tôi có thể đăng nhập bằng tài khoản Google (OAuth) không?",
    answer:
      "Có. SmartHire hỗ trợ đăng nhập 1 chạm với Google Identity. Dữ liệu được mã hóa an toàn qua giao thức JWT, giúp bạn truy cập nhanh chóng mà không cần ghi nhớ thêm mật khẩu phức tạp.",
    tags: ["Google OAuth", "Đăng nhập nhanh", "JWT"],
  },
  {
    id: "sec-2",
    category: "account_security",
    question: "Dữ liệu cá nhân và thông tin trong CV có bị tiết lộ cho bên thứ ba không?",
    answer:
      "SmartHire cam kết tuân thủ nghiêm ngặt các tiêu chuẩn bảo mật dữ liệu. Thông tin cá nhân (số điện thoại, email, địa chỉ) chỉ hiển thị cho các nhà tuyển dụng mà bạn chủ động nộp hồ sơ. Chúng tôi tuyệt đối không bán hoặc chia sẻ dữ liệu người dùng cho bất kỳ bên quảng cáo nào.",
    tags: ["Cam kết bảo mật", "Không lộ thông tin", "Dữ liệu riêng tư"],
    featured: true,
  },
  {
    id: "sec-3",
    category: "account_security",
    question: "Làm thế nào để đổi mật khẩu hoặc xóa tài khoản vĩnh viễn?",
    answer:
      "Bạn vào mục 'Cài đặt tài khoản' (Settings) -> chọn 'Bảo mật' để đổi mật khẩu mới. Nếu muốn xóa tài khoản, bạn chọn 'Yêu cầu xóa tài khoản'. Toàn bộ hồ sơ, phiên bản CV và lịch sử ứng tuyển sẽ được hủy hoàn toàn khỏi hệ thống theo quy định quyền riêng tư.",
    tags: ["Đổi mật khẩu", "Xóa tài khoản", "Cài đặt"],
  },
];

// =============================================================================
// HAND-DRAWN SKETCH DOODLES (TACTILE CRAFT SVGs)
// =============================================================================

function SketchUnderline({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`overflow-visible ${className}`}
      viewBox="0 0 250 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 14C55 4 150 2 247 11C185 8 80 9 20 16"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SketchArrowCurved({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`overflow-visible ${className}`}
      viewBox="0 0 80 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M10 10C35 5 65 18 68 45M68 45L55 40M68 45L74 32"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SketchSparkle({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`overflow-visible ${className}`}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M16 2L18.5 12.5L29 16L18.5 19.5L16 30L13.5 19.5L3 16L13.5 12.5L16 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SketchLightbulbDoodle({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`overflow-visible ${className}`}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M24 6C16.27 6 10 12.27 10 20C10 24.8 12.5 28.5 15.5 31.5C17.5 33.5 18 35 18 37H30C30 35 30.5 33.5 32.5 31.5C35.5 28.5 38 24.8 38 20C38 12.27 31.73 6 24 6Z"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 41H29M21 45H27"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M24 12V18M18 20H30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

// =============================================================================
// MAIN FAQ PAGE COMPONENT
// =============================================================================

export function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory["id"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({
    "cv-1": true, // Mở sẵn câu đầu tiên để người dùng dễ nhận biết tương tác
  });
  const [feedbackGiven, setFeedbackGiven] = useState<Record<string, "yes" | "no">>({});

  // Lọc danh sách câu hỏi dựa trên từ khóa tìm kiếm và danh mục đang chọn
  const filteredFaqs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return FAQ_ITEMS.filter((item) => {
      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      if (!matchCategory) return false;
      if (!query) return true;

      const inQuestion = item.question.toLowerCase().includes(query);
      const inAnswer =
        typeof item.answer === "string"
          ? item.answer.toLowerCase().includes(query)
          : false;
      const inTags = item.tags.some((t) => t.toLowerCase().includes(query));

      return inQuestion || inAnswer || inTags;
    });
  }, [searchQuery, selectedCategory]);

  // Xử lý bật/tắt mở rộng câu hỏi
  const toggleFaq = (id: string) => {
    setOpenFaqIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Mở tất cả / Thu gọn tất cả
  const toggleAll = (expand: boolean) => {
    const newState: Record<string, boolean> = {};
    if (expand) {
      filteredFaqs.forEach((item) => {
        newState[item.id] = true;
      });
    }
    setOpenFaqIds(newState);
  };

  const handleFeedback = (faqId: string, type: "yes" | "no") => {
    setFeedbackGiven((prev) => ({
      ...prev,
      [faqId]: type,
    }));
  };

  return (
    <div className="min-h-screen bg-bg text-text-main antialiased">
      {/* =====================================================================
          1. HERO SECTION: Heading, Decorative Characters & Live Search
          ===================================================================== */}
      <section className="relative overflow-hidden bg-bg-white-blue pt-20 pb-16 lg:pt-28 lg:pb-24 3xl:pt-36 3xl:pb-32 border-b border-border">
        {/* Background Ambient Circles & Grids */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-secondary/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-28 h-80 w-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-7xl 3xl:max-w-[105rem] px-4 sm:px-6 lg:px-8 3xl:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading & Search Input */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6 text-center lg:text-left">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl 3xl:text-6xl font-bold tracking-tight text-primary leading-[1.2]">
                  Trung tâm trợ giúp &{" "}
                  <span className="relative inline-block text-primary-light">
                    Câu hỏi thường gặp
                    <SketchUnderline className="absolute -bottom-2.5 left-0 w-full text-secondary-dark" />
                  </span>
                </h1>
                <p className="mt-4 sm:mt-5 text-base sm:text-lg 3xl:text-xl text-text-muted max-w-2xl 3xl:max-w-4xl leading-relaxed">
                  Tìm hiểu mọi thông tin về tính năng tạo CV tích hợp AI, matching điểm hồ sơ, quy trình tuyển dụng và các tiêu chuẩn bảo mật dữ liệu tại SmartHire.
                </p>
              </div>

              {/* Live Search Bar */}
              <div className="relative mt-2 max-w-2xl 3xl:max-w-3xl">
                <div className="relative flex items-center shadow-lg shadow-primary/5 rounded-full bg-surface border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-secondary transition-all duration-200">
                  <Search className="size-5 sm:size-6 text-text-muted ml-5 sm:ml-6 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm: ví dụ 'tạo CV', 'Match score', 'ứng tuyển'..."
                    className="w-full bg-transparent px-4 py-3.5 sm:py-4 3xl:py-5 text-sm sm:text-base 3xl:text-lg text-text-main placeholder:text-text-muted focus:outline-none"
                    aria-label="Tìm kiếm câu hỏi"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="mr-3 p-1.5 rounded-full text-text-muted hover:text-text-main hover:bg-neutral-bg transition-colors"
                      title="Xóa tìm kiếm"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X className="size-4 sm:size-5" />
                    </button>
                  )}
                  <div className="pr-2 sm:pr-3 shrink-0">
                    <Button
                      variant="primary"
                      size="md"
                      className="shadow-none! px-5! sm:px-6!"
                    >
                      Tìm kiếm
                    </Button>
                  </div>
                </div>

                {/* Hand-drawn prompt doodle */}
                <div className="hidden sm:flex items-center gap-2 absolute -top-8 right-6 text-xs text-text-muted font-medium pointer-events-none">
                  <span className="text-primary-light">Gõ từ khóa để lọc tức thì</span>
                  <SketchArrowCurved className="size-5 text-secondary-dark rotate-12" />
                </div>

                {/* Popular Keywords Pills */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-1 text-xs sm:text-sm text-text-muted">
                  <span className="font-semibold text-text-main">Từ khóa phổ biến:</span>
                  {["Tạo CV", "Match Score", "Xuất PDF", "Trạng thái nộp", "Bảo mật"].map(
                    (tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setSearchQuery(tag)}
                        className="px-2.5 py-1 rounded-full bg-surface border border-border hover:border-secondary-dark hover:text-primary transition-colors text-xs cursor-pointer"
                      >
                        #{tag}
                      </button>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Curated Character & Tactile Sketch Composition */}
            <div className="lg:col-span-5 xl:col-span-4 hidden lg:flex justify-center relative">
              <div className="relative w-72 h-80 xl:w-88 xl:h-96 3xl:w-104 3xl:h-112 flex items-center justify-center">
                {/* Decorative background geometry */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-secondary/40 to-bg-white-blue transform -rotate-3 border border-secondary/30" />
                <div className="absolute inset-2 rounded-3xl bg-surface/80 backdrop-blur-xs transform rotate-2 border border-border" />

                {/* Main Illustration Persona */}
                <motion.img
                  src={OfficeGirl2NoBg}
                  alt="SmartHire Support Character"
                  className="relative z-10 max-h-full object-contain filter drop-shadow-xl"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                />

                {/* Tactile Sketch Speech Bubble */}
                <motion.div
                  className="absolute -top-4 -left-6 z-20 bg-surface rounded-2xl p-3 shadow-md border border-border flex items-center gap-2.5 max-w-56"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <div className="size-8 rounded-full bg-secondary-light flex items-center justify-center shrink-0">
                    <SketchLightbulbDoodle className="size-5 text-primary" />
                  </div>
                  <div className="text-xs leading-snug">
                    <span className="font-bold text-primary block">Cần giải đáp?</span>
                    <span className="text-text-muted">SmartHire luôn sẵn sàng trợ giúp</span>
                  </div>
                </motion.div>

                {/* Floating AI Match Sparkle Badge */}
                <motion.div
                  className="absolute -bottom-3 -right-4 z-20 bg-primary text-surface rounded-2xl px-3.5 py-2 shadow-md flex items-center gap-2"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.45, duration: 0.4 }}
                >
                  <SketchSparkle className="size-4 text-secondary" />
                  <span className="text-xs font-semibold">Tích hợp AI 24/7</span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. CATEGORY HIGHLIGHT CARDS (Multi-source Sketches & Visuals)
          ===================================================================== */}
      <section className="py-12 lg:py-16 3xl:py-20 border-b border-border bg-surface">
        <div className="container mx-auto max-w-7xl 3xl:max-w-[105rem] px-4 sm:px-6 lg:px-8 3xl:px-16">
          <div className="text-center max-w-3xl mx-auto mb-10 3xl:mb-14">
            <h2 className="text-2xl sm:text-3xl 3xl:text-4xl font-bold text-primary">
              Khám phá theo chủ đề chuyên sâu
            </h2>
            <p className="mt-2 text-sm sm:text-base text-text-muted">
              Lựa chọn danh mục tương ứng để duyệt nhanh câu hỏi phù hợp nhất với nhu cầu của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 3xl:gap-8">
            {/* Card 1: Tạo CV & AI */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setSelectedCategory("cv_ai");
                document.getElementById("faq-accordion-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group cursor-pointer rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                selectedCategory === "cv_ai"
                  ? "bg-bg-white-blue border-primary ring-2 ring-secondary/50 shadow-md"
                  : "bg-surface border-border hover:border-secondary hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    <Sparkles className="size-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                    AI Assistant
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary group-hover:text-primary-dark transition-colors">
                  Tạo CV & Trợ lý AI
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
                  So khớp Match Score, gợi ý câu từ, xuất file PDF A4 chuẩn xác không lỗi định dạng.
                </p>
              </div>

              {/* Visual Asset Thumbnail */}
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={ResumeHolder}
                    alt="Resume Illustration"
                    className="size-8 object-contain rounded-md"
                  />
                  <span className="text-xs font-medium text-text-muted">
                    {FAQ_ITEMS.filter((f) => f.category === "cv_ai").length} câu hỏi
                  </span>
                </div>
                <ArrowRight className="size-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>

            {/* Card 2: Tìm việc & Ứng tuyển */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setSelectedCategory("job_apply");
                document.getElementById("faq-accordion-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group cursor-pointer rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                selectedCategory === "job_apply"
                  ? "bg-bg-white-blue border-primary ring-2 ring-secondary/50 shadow-md"
                  : "bg-surface border-border hover:border-secondary hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                    <Briefcase className="size-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    Ứng viên
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary group-hover:text-primary-dark transition-colors">
                  Tìm việc & Ứng tuyển
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
                  Nộp hồ sơ 1 chạm, theo dõi tiến độ xét duyệt thời gian thực, quản lý các vị trí đã ứng tuyển.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">
                  {FAQ_ITEMS.filter((f) => f.category === "job_apply").length} câu hỏi
                </span>
                <ArrowRight className="size-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>

            {/* Card 3: Đăng tin & Tuyển dụng */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setSelectedCategory("recruiter");
                document.getElementById("faq-accordion-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group cursor-pointer rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                selectedCategory === "recruiter"
                  ? "bg-bg-white-blue border-primary ring-2 ring-secondary/50 shadow-md"
                  : "bg-surface border-border hover:border-secondary hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FileText className="size-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Doanh nghiệp
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary group-hover:text-primary-dark transition-colors">
                  Đăng tin & Tuyển dụng
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
                  Đăng JD nhanh, xem CV trực tuyến tiện lợi, lọc ứng viên theo độ tương thích thông minh.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={CandidateMatching}
                    alt="Matching preview"
                    className="size-8 object-contain rounded-md"
                  />
                  <span className="text-xs font-medium text-text-muted">
                    {FAQ_ITEMS.filter((f) => f.category === "recruiter").length} câu hỏi
                  </span>
                </div>
                <ArrowRight className="size-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>

            {/* Card 4: Tài khoản & Bảo mật */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              onClick={() => {
                setSelectedCategory("account_security");
                document.getElementById("faq-accordion-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`group cursor-pointer rounded-2xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                selectedCategory === "account_security"
                  ? "bg-bg-white-blue border-primary ring-2 ring-secondary/50 shadow-md"
                  : "bg-surface border-border hover:border-secondary hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="size-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="size-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Bảo mật
                  </span>
                </div>
                <h3 className="text-lg font-bold text-primary group-hover:text-primary-dark transition-colors">
                  Tài khoản & Bảo mật
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-text-muted leading-relaxed">
                  Xác thực OAuth Google, mã hóa bảo vệ thông tin liên hệ và chính sách riêng tư chuẩn mực.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
                <span className="text-xs font-medium text-text-muted">
                  {FAQ_ITEMS.filter((f) => f.category === "account_security").length} câu hỏi
                </span>
                <ArrowRight className="size-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. ACCORDION FAQ SECTION: Category Tabs, Filter & Smooth Motion
          ===================================================================== */}
      <section id="faq-accordion-section" className="py-12 lg:py-20 3xl:py-28 bg-neutral-bg">
        <div className="container mx-auto max-w-4xl 3xl:max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Category Tabs with Animated Pill */}
          <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 sm:pb-6 gap-2 no-scrollbar">
            {FAQ_CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative flex items-center gap-2 px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-colors duration-200 shrink-0 cursor-pointer ${
                    isActive
                      ? "text-primary bg-surface shadow-sm border border-secondary"
                      : "text-text-muted hover:text-text-main hover:bg-surface/60"
                  }`}
                >
                  <Icon className={`size-4 ${cat.accentColor}`} />
                  <span>{cat.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeCategoryPill"
                      className="absolute inset-0 rounded-full border-2 border-primary pointer-events-none"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action Bar: Counter & Expand/Collapse All */}
          <div className="flex items-center justify-between mt-6 mb-6 pt-4 border-t border-border text-xs sm:text-sm text-text-muted">
            <div>
              Hiển thị{" "}
              <span className="font-bold text-primary">{filteredFaqs.length}</span>{" "}
              câu hỏi{" "}
              {searchQuery && (
                <span>
                  phù hợp với từ khóa <span className="font-semibold text-text-main">"{searchQuery}"</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleAll(true)}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Mở tất cả
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => toggleAll(false)}
                className="hover:text-primary transition-colors cursor-pointer"
              >
                Thu gọn
              </button>
            </div>
          </div>

          {/* FAQ Accordion List with Framer Motion */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {filteredFaqs.length > 0 ? (
                <motion.div
                  key={`${selectedCategory}-${searchQuery}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3.5 sm:space-y-4"
                >
                  {filteredFaqs.map((faq, index) => {
                    const isOpen = !!openFaqIds[faq.id];
                    return (
                      <motion.div
                        key={faq.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.3 }}
                        className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isOpen
                            ? "bg-surface border-primary/40 shadow-sm"
                            : "bg-surface border-border hover:border-secondary-dark"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(faq.id)}
                          aria-expanded={isOpen}
                          className="w-full px-5 py-4 sm:px-6 sm:py-5 text-left flex items-start justify-between gap-4 cursor-pointer focus:outline-none"
                        >
                          <div className="flex items-start gap-3">
                            <span className="size-6 rounded-full bg-secondary-light text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {index + 1}
                            </span>
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-primary leading-snug">
                                {faq.question}
                              </h3>
                              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {faq.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-bg text-text-muted border border-border/80"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="p-1 rounded-full text-text-muted hover:text-primary shrink-0"
                          >
                            <ChevronDown className="size-5" />
                          </motion.div>
                        </button>

                        {/* Accordion Content with Smooth Height Transition */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
                              className="overflow-hidden"
                            >
                              <div className="px-5 sm:px-6 pb-5 pt-1 text-sm sm:text-base text-text-main/90 leading-relaxed border-t border-border/50 ml-9 sm:ml-9">
                                <p className="mt-3">{faq.answer}</p>

                                {/* Feedback Interaction Pill */}
                                <div className="mt-5 pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted">
                                  <span>Thông tin này có hữu ích với bạn không?</span>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      icon={ThumbsUp}
                                      onClick={() => handleFeedback(faq.id, "yes")}
                                      className={
                                        feedbackGiven[faq.id] === "yes"
                                          ? "bg-emerald-50! text-emerald-700! border-emerald-300! font-semibold! ring-0!"
                                          : "text-text-muted! border-border! ring-0! hover:bg-neutral-bg! hover:text-text-main!"
                                      }
                                    >
                                      Hữu ích
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      icon={ThumbsDown}
                                      onClick={() => handleFeedback(faq.id, "no")}
                                      className={
                                        feedbackGiven[faq.id] === "no"
                                          ? "bg-amber-50! text-amber-700! border-amber-300! font-semibold! ring-0!"
                                          : "text-text-muted! border-border! ring-0! hover:bg-neutral-bg! hover:text-text-main!"
                                      }
                                    >
                                      Chưa rõ
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              ) : (
                /* Empty Search State */
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl border border-border bg-surface p-8 sm:p-12 text-center flex flex-col items-center justify-center"
                >
                  <img
                    src={EmptyState}
                    alt="Không tìm thấy câu hỏi"
                    className="size-48 sm:size-60 object-contain mb-4"
                  />
                  <h3 className="text-lg sm:text-xl font-bold text-primary">
                    Không tìm thấy câu trả lời phù hợp
                  </h3>
                  <p className="mt-2 text-sm text-text-muted max-w-md">
                    Không có câu hỏi nào khớp với từ khóa "{searchQuery}". Bạn có thể thử tìm bằng từ khóa khác hoặc liên hệ trực tiếp với bộ phận chăm sóc khách hàng.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    <Button
                      variant="secondary"
                      size="md"
                      icon={RotateCcw}
                      onClick={() => setSearchQuery("")}
                    >
                      Xóa tìm kiếm
                    </Button>
                    <Link to={PATHS.CONTACT}>
                      <Button variant="primary" size="md">
                        Gửi câu hỏi hỗ trợ
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. FALLBACK CTA: Support Specialist, Quick Channels & Contact Link
          ===================================================================== */}
      <section className="py-14 lg:py-20 3xl:py-24 bg-surface border-t border-border">
        <div className="container mx-auto max-w-7xl 3xl:max-w-[105rem] px-4 sm:px-6 lg:px-8 3xl:px-16">
          <div className="relative overflow-hidden rounded-3xl bg-primary text-surface p-8 sm:p-12 lg:p-16 shadow-xl">
            {/* Ambient Background Circles */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 size-80 rounded-full bg-secondary/15 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 size-80 rounded-full bg-secondary-light/10 blur-2xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 flex flex-col gap-4 text-center lg:text-left">
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-secondary self-center lg:self-start">
                  <Sparkles className="size-4" />
                  Đội ngũ chăm sóc khách hàng SmartHire
                </span>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl 3xl:text-5xl font-bold text-surface tracking-tight leading-tight">
                  Bạn vẫn chưa tìm thấy câu trả lời mong muốn?
                </h2>

                <p className="text-sm sm:text-base 3xl:text-lg text-surface/80 max-w-2xl leading-relaxed">
                  Đừng ngần ngại liên hệ trực tiếp. Đội ngũ chuyên viên tư vấn của SmartHire luôn đồng hành hỗ trợ bạn 24/7 trong suốt quá trình tạo CV và ứng tuyển.
                </p>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 mt-4 pt-2 text-xs sm:text-sm text-surface/90">
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 text-secondary" />
                    <span>Hotline: <strong className="text-surface font-semibold">1900 6868</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="size-4 text-secondary" />
                    <span>Email: <strong className="text-surface font-semibold">support@smarthire.vn</strong></span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center justify-center lg:items-end gap-3.5">
                <Link to={PATHS.CONTACT} className="w-full sm:w-auto lg:w-full">
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="w-full! bg-surface! text-primary! hover:bg-neutral-bg! shadow-md! font-semibold!"
                  >
                    Gửi yêu cầu hỗ trợ
                  </Button>
                </Link>

                <a
                  href="mailto:support@smarthire.vn"
                  className="w-full sm:w-auto lg:w-full"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={Mail}
                    className="w-full! bg-transparent! text-surface! ring-1! ring-surface/40! hover:bg-surface/10! hover:text-surface! hover:ring-surface/70! font-semibold!"
                  >
                    Gửi email trực tiếp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FaqPage;
