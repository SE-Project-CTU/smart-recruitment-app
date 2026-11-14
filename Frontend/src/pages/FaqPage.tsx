import React, { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  ChevronDown,
  ThumbsUp,
  ThumbsDown,
  Mail,
  Phone,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { PATHS } from "@/constants/paths";
import { Button, Footer } from "@/components/common";
import { OfficeGirl2NoBg, EmptyState } from "@/assets/images/decoration";

// =============================================================================
// FAQ DATA DEFINITION
// =============================================================================

export interface FaqItem {
  id: string;
  category: "cv_ai" | "job_apply" | "recruiter" | "account_security";
  question: string;
  answer: string | React.ReactNode;
  tags: string[];
}

export interface FaqCategory {
  id: "all" | "cv_ai" | "job_apply" | "recruiter" | "account_security";
  label: string;
}

const FAQ_CATEGORIES: FaqCategory[] = [
  { id: "all", label: "Tất cả" },
  { id: "cv_ai", label: "Tạo CV & Trợ lý AI" },
  { id: "job_apply", label: "Tìm việc & Ứng tuyển" },
  { id: "recruiter", label: "Đăng tin & Tuyển dụng" },
  { id: "account_security", label: "Tài khoản & Bảo mật" },
];

const FAQ_ITEMS: FaqItem[] = [
  // --- Nhóm 1: Tạo CV & AI ---
  {
    id: "cv-1",
    category: "cv_ai",
    question:
      "SmartHire AI hỗ trợ viết CV và tính điểm tương thích như thế nào?",
    answer:
      "SmartHire sử dụng mô hình AI kết hợp công nghệ trích xuất vector để so khớp khách quan giữa hồ sơ CV của bạn với bản mô tả công việc. AI phân tích đa chiều: kỹ năng chuyên môn, kinh nghiệm thực chiến và mức độ phù hợp. Quan trọng nhất, AI luôn giữ vai trò cố vấn đồng hành: chỉ đưa ra gợi ý hoàn thiện câu từ, tối ưu từ khóa ngành nghề mà tuyệt đối không tự ý chỉnh sửa hay ghi đè nội dung của bạn.",
    tags: ["AI", "Điểm tương thích", "Gợi ý", "So khớp JD"],
  },
  {
    id: "cv-2",
    category: "cv_ai",
    question: "Tôi có thể xuất CV ra định dạng PDF hoặc in trực tiếp không?",
    answer:
      "Có. Trình tạo CV của SmartHire tích hợp công cụ render chuẩn pixel theo khổ giấy A4 tiêu chuẩn. Bạn có thể nhấn 'Tải xuống PDF' hoặc 'In trực tiếp' với bố cục được bảo toàn chính xác 100%, không bị xô lệch lề hay vỡ phông chữ khi gửi cho nhà tuyển dụng.",
    tags: ["Xuất PDF", "In ấn", "Khổ giấy A4", "Tải xuống"],
  },
  {
    id: "cv-3",
    category: "cv_ai",
    question:
      "SmartHire có tự động chỉnh sửa thông tin hoặc câu từ trong CV của tôi không?",
    answer:
      "Tuyệt đối không. Triết lý của SmartHire là tôn trọng quyền sở hữu thông tin của ứng viên. Tất cả các gợi ý tối ưu từ trợ lý AI (cải thiện văn phong, thêm số liệu định lượng, sửa lỗi ngữ pháp) đều hiển thị dưới dạng đề xuất. Bạn toàn quyền quyết định 'Áp dụng' hay 'Bỏ qua'.",
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
    question:
      "Làm thế nào để theo dõi tiến độ xét duyệt hồ sơ sau khi ứng tuyển?",
    answer:
      "Ngay sau khi nộp hồ sơ, bạn có thể truy cập mục 'Theo dõi hồ sơ' trên thanh điều hướng cá nhân. Tại đây, trạng thái hồ sơ được cập nhật minh bạch qua từng giai đoạn: Đã gửi -> Nhà tuyển dụng đã xem -> Hẹn phỏng vấn -> Trúng tuyển hoặc Chưa phù hợp kèm lý do (nếu có).",
    tags: ["Theo dõi", "Trạng thái ứng tuyển", "Tiến độ xét duyệt"],
  },
  {
    id: "job-2",
    category: "job_apply",
    question:
      "Tôi có thể hủy ứng tuyển hoặc cập nhật lại CV sau khi đã gửi đi không?",
    answer:
      "Khi hồ sơ ở trạng thái 'Đã gửi' và nhà tuyển dụng chưa mở xem, bạn vẫn có thể rút đơn ứng tuyển hoặc nộp lại phiên bản CV mới nhất. Một khi nhà tuyển dụng đã chuyển sang trạng thái xét duyệt hoặc xếp lịch phỏng vấn, hồ sơ sẽ được khóa để đảm bảo tính minh bạch cho quy trình tuyển dụng.",
    tags: ["Hủy nộp đơn", "Cập nhật CV", "Đổi hồ sơ"],
  },
  {
    id: "job-3",
    category: "job_apply",
    question:
      "Làm sao để nhận gợi ý việc làm phù hợp nhất với kỹ năng của tôi?",
    answer:
      "Hệ thống SmartHire liên tục đối soát kỹ năng trong hồ sơ mặc định của bạn với các tin tuyển dụng mới mở. Bạn có thể bật tính năng 'Bật thông báo việc làm phù hợp' trong Cài đặt tài khoản để nhận email và thông báo đẩy ngay khi có vị trí có điểm tương đồng trên 80%.",
    tags: ["Gợi ý việc làm", "Điểm tương thích", "Thông báo"],
  },
  {
    id: "job-4",
    category: "job_apply",
    question:
      "Nhà tuyển dụng có xem được các CV khác mà tôi không chọn để nộp không?",
    answer:
      "Không. Nhà tuyển dụng chỉ xem được duy nhất bản snapshot của CV mà bạn đã chỉ định tại thời điểm nộp đơn cho công việc đó. Các phiên bản CV khác trong kho lưu trữ của bạn hoàn toàn riêng tư.",
    tags: ["Bảo mật CV", "Quyền riêng tư", "Hồ sơ ứng tuyển"],
  },

  // --- Nhóm 3: Đăng tin & Tuyển dụng ---
  {
    id: "recruiter-1",
    category: "recruiter",
    question:
      "Quy trình đăng tin tuyển dụng mới dành cho doanh nghiệp diễn ra như thế nào?",
    answer:
      "Nhà tuyển dụng đăng nhập vào bảng điều khiển doanh nghiệp, chọn 'Tạo tin tuyển dụng'. Hệ thống hỗ trợ nhập liệu thông minh với các trường chức danh, địa điểm làm việc, mức lương tự động định dạng tiền tệ và bộ kỹ năng tiêu chuẩn. Tin đăng sau khi tạo sẽ được kích hoạt ngay lập tức để tiếp cận các ứng viên tiềm năng.",
    tags: ["Đăng tin", "Tuyển dụng", "Mô tả công việc"],
  },
  {
    id: "recruiter-2",
    category: "recruiter",
    question: "Tính năng xem CV trực tuyến hoạt động như thế nào?",
    answer:
      "Nhà tuyển dụng có thể xem hồ sơ ứng viên trực tiếp trên trình duyệt mà không cần tải file về máy. Trình xem CV hỗ trợ hiển thị bố cục chuẩn hóa, ảnh đại diện, danh sách dự án, trình độ học vấn cùng điểm tương thích tính toán tự động giữa CV và yêu cầu bài đăng.",
    tags: ["Xem CV trực tuyến", "Sàng lọc ứng viên", "Xem nhanh"],
  },
  {
    id: "recruiter-3",
    category: "recruiter",
    question:
      "Doanh nghiệp có thể quản lý trạng thái ứng viên theo quy trình nhiều vòng không?",
    answer:
      "Có. SmartHire cung cấp bảng quản lý trạng thái trực quan: tiếp nhận hồ sơ, đánh dấu phù hợp, gửi lời mời phỏng vấn và gửi thông báo kết quả qua email tự động chỉ với một thao tác.",
    tags: ["Quy trình tuyển dụng", "Quản lý ứng viên", "Phỏng vấn"],
  },

  // --- Nhóm 4: Tài khoản & Bảo mật ---
  {
    id: "sec-1",
    category: "account_security",
    question: "Tôi có thể đăng nhập bằng tài khoản Google không?",
    answer:
      "Có. SmartHire hỗ trợ đăng nhập nhanh một chạm bằng tài khoản Google. Dữ liệu được mã hóa an toàn qua giao thức bảo mật tiêu chuẩn, giúp bạn truy cập nhanh chóng mà không cần ghi nhớ thêm mật khẩu phức tạp.",
    tags: ["Google", "Đăng nhập nhanh", "Bảo mật"],
  },
  {
    id: "sec-2",
    category: "account_security",
    question:
      "Dữ liệu cá nhân và thông tin trong CV có bị tiết lộ cho bên thứ ba không?",
    answer:
      "SmartHire cam kết tuân thủ nghiêm ngặt các tiêu chuẩn bảo mật dữ liệu. Thông tin cá nhân (số điện thoại, email, địa chỉ) chỉ hiển thị cho các nhà tuyển dụng mà bạn chủ động nộp hồ sơ. Chúng tôi tuyệt đối không bán hoặc chia sẻ dữ liệu người dùng cho bất kỳ bên quảng cáo nào.",
    tags: ["Cam kết bảo mật", "Không lộ thông tin", "Dữ liệu riêng tư"],
  },
  {
    id: "sec-3",
    category: "account_security",
    question: "Làm thế nào để đổi mật khẩu hoặc xóa tài khoản vĩnh viễn?",
    answer:
      "Bạn vào mục 'Cài đặt tài khoản' rồi chọn 'Bảo mật' để đổi mật khẩu mới. Nếu muốn xóa tài khoản, bạn chọn 'Yêu cầu xóa tài khoản'. Toàn bộ hồ sơ, phiên bản CV và lịch sử ứng tuyển sẽ được hủy hoàn toàn khỏi hệ thống theo quy định quyền riêng tư.",
    tags: ["Đổi mật khẩu", "Xóa tài khoản", "Cài đặt"],
  },
];

// =============================================================================
// SEARCH KEYWORD HIGHLIGHTER
// =============================================================================

function highlightMatch(text: string, query: string): React.ReactNode {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        className="rounded-xs bg-secondary-light/80 px-0.5 font-semibold text-primary"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

// =============================================================================
// MAIN FAQ PAGE COMPONENT
// =============================================================================

export function FaqPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<FaqCategory["id"]>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIds, setOpenFaqIds] = useState<Record<string, boolean>>({
    "cv-1": true,
  });
  const [feedbackGiven, setFeedbackGiven] = useState<
    Record<string, "yes" | "no">
  >({});
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = "Câu hỏi thường gặp | SmartHire";
  }, []);

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
    <div className="min-h-screen bg-bg text-text-main antialiased caret-primary selection:bg-secondary-light selection:text-primary">
      {/* =====================================================================
          1. HERO SECTION: Clean, Focused & Restrained
          ===================================================================== */}
      <section className="relative overflow-hidden border-b border-border bg-bg-white-blue/70 pt-20 pb-10 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20 3xl:pt-32 3xl:pb-24">
        <div className="relative z-10 container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 3xl:max-w-[105rem] 3xl:px-16">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left: Heading & Search Input */}
            <div className="flex flex-col gap-5 text-center lg:col-span-7 lg:text-left xl:col-span-8">
              <div>
                <h1 className="xs:text-3xl text-2xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl 3xl:text-6xl">
                  Câu hỏi thường gặp
                </h1>
                <p className="xs:text-sm mx-auto mt-2.5 max-w-2xl text-xs leading-relaxed text-text-muted sm:mt-3 sm:text-base lg:mx-0 3xl:max-w-4xl 3xl:text-lg">
                  Giải đáp mọi thắc mắc về tạo CV chuẩn AI, tính điểm tương
                  thích công việc và quy trình ứng tuyển trên SmartHire.
                </p>
              </div>

              {/* Minimal Search Bar */}
              <div className="relative mx-auto w-full max-w-2xl lg:mx-0 3xl:max-w-3xl">
                <div className="relative flex items-center rounded-full border border-border bg-surface shadow-xs transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                  <Search className="ml-3.5 size-4.5 shrink-0 text-text-muted sm:ml-5 sm:size-5" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm câu hỏi, từ khóa trợ giúp..."
                    className="w-full min-w-0 bg-transparent px-2.5 py-2.5 text-xs text-text-main placeholder:text-text-muted focus:outline-none sm:px-4 sm:py-3.5 sm:text-base 3xl:py-4.5 3xl:text-lg"
                    aria-label="Tìm kiếm câu hỏi"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      className="hover:bg-neutral-bg mr-1 shrink-0 cursor-pointer rounded-full p-1 text-text-muted transition-colors hover:text-text-main sm:mr-2 sm:p-1.5"
                      title="Xóa tìm kiếm"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X className="size-3.5 sm:size-4" />
                    </button>
                  )}
                  <div className="shrink-0 pr-1.5 sm:pr-2">
                    <Button
                      variant="primary"
                      size="md"
                      className="px-3! py-1.5! text-xs! shadow-none! sm:px-5! sm:py-2! sm:text-sm!"
                    >
                      Tìm kiếm
                    </Button>
                  </div>
                </div>

                {/* Popular Keywords (Responsive wrapped items, no dangling dots) */}
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-1.5 text-xs text-text-muted sm:text-sm lg:justify-start">
                  <span className="shrink-0 font-medium text-text-muted">
                    Gợi ý:
                  </span>
                  {[
                    "Tạo CV",
                    "Điểm tương thích",
                    "Xuất PDF",
                    "Tiến độ hồ sơ",
                    "Bảo mật",
                  ].map((tag, idx, arr) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <button
                        type="button"
                        onClick={() => setSearchQuery(tag)}
                        className="cursor-pointer text-primary transition-colors hover:underline"
                      >
                        {tag}
                      </button>
                      {idx < arr.length - 1 && (
                        <span
                          className="text-border select-none"
                          aria-hidden="true"
                        >
                          •
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Character Image */}
            <div className="relative hidden justify-center lg:col-span-5 lg:flex xl:col-span-4">
              <div className="relative flex h-72 w-64 items-center justify-center xl:h-84 xl:w-76 3xl:h-96 3xl:w-88">
                <div className="absolute inset-0 rounded-3xl bg-secondary/20" />
                <img
                  src={OfficeGirl2NoBg}
                  alt="Chuyên viên hỗ trợ SmartHire"
                  className="relative z-10 max-h-full object-contain drop-shadow-sm filter"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. ACCORDION FAQ SECTION: Unified Category Tabs & Quiet Design
          ===================================================================== */}
      <section className="bg-bg py-8 sm:py-12 lg:py-16 3xl:py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 3xl:max-w-5xl">
          {/* Category Tabs: Scrollable on mobile with margin bleed and proper padding */}
          <div
            role="tablist"
            aria-label="Danh mục câu hỏi"
            className="no-scrollbar -mx-4 flex items-center justify-start gap-1.5 overflow-x-auto px-4 pt-1 pb-3 sm:mx-0 sm:justify-center sm:px-0 sm:pb-5"
          >
            {FAQ_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`relative shrink-0 cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none sm:px-4 sm:py-2 sm:text-sm ${
                    isActive
                      ? "bg-primary text-surface shadow-xs"
                      : "text-text-muted hover:bg-surface hover:text-text-main"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action Bar: Responsive Counter & Expand/Collapse without wrapping breakage */}
          <div className="mt-2 mb-5 flex flex-col gap-2 border-t border-border pt-3.5 text-xs text-text-muted sm:mt-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:pt-4 sm:text-sm">
            <div className="min-w-0 leading-relaxed">
              Hiển thị{" "}
              <span className="font-semibold text-primary">
                {filteredFaqs.length}
              </span>{" "}
              câu hỏi
              {searchQuery && (
                <span className="break-words">
                  {" "}
                  cho từ khóa{" "}
                  <span className="font-medium text-text-main">
                    "{searchQuery}"
                  </span>
                </span>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-3 self-end whitespace-nowrap sm:self-auto">
              <button
                type="button"
                onClick={() => toggleAll(true)}
                className="cursor-pointer transition-colors hover:text-primary"
              >
                Mở tất cả
              </button>
              <span className="text-border select-none">•</span>
              <button
                type="button"
                onClick={() => toggleAll(false)}
                className="cursor-pointer transition-colors hover:text-primary"
              >
                Thu gọn
              </button>
            </div>
          </div>

          {/* FAQ Accordion List: Clean, Uncluttered, Responsive Typography */}
          <div className="space-y-3 sm:space-y-3.5">
            <AnimatePresence mode="wait">
              {filteredFaqs.length > 0 ? (
                <motion.div
                  key={`${selectedCategory}-${searchQuery}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-3"
                >
                  {filteredFaqs.map((faq) => {
                    const isOpen = !!openFaqIds[faq.id];
                    return (
                      <div
                        key={faq.id}
                        className={`overflow-hidden rounded-xl border bg-surface transition-colors duration-150 ${
                          isOpen
                            ? "border-primary/40 shadow-xs"
                            : "border-border hover:border-border/80"
                        }`}
                      >
                        <button
                          type="button"
                          id={`faq-btn-${faq.id}`}
                          aria-controls={`faq-panel-${faq.id}`}
                          onClick={() => toggleFaq(faq.id)}
                          aria-expanded={isOpen}
                          className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none sm:gap-4 sm:px-6 sm:py-4.5"
                        >
                          <h2 className="xs:text-sm text-xs leading-snug font-semibold break-words text-text-main sm:text-base">
                            {highlightMatch(faq.question, searchQuery)}
                          </h2>

                          <motion.div
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="shrink-0 p-0.5 text-text-muted sm:p-1"
                          >
                            <ChevronDown className="size-4 sm:size-4.5" />
                          </motion.div>
                        </button>

                        {/* Accordion Content */}
                        <AnimatePresence initial={false}>
                          {isOpen && (
                            <motion.div
                              id={`faq-panel-${faq.id}`}
                              role="region"
                              aria-labelledby={`faq-btn-${faq.id}`}
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{
                                duration: 0.25,
                                ease: "easeOut",
                              }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-border/50 px-4 pt-3 pb-4 text-xs leading-relaxed text-text-muted sm:px-6 sm:pb-5 sm:text-sm sm:leading-relaxed">
                                <p className="max-w-prose text-text-main/90">
                                  {typeof faq.answer === "string"
                                    ? highlightMatch(faq.answer, searchQuery)
                                    : faq.answer}
                                </p>

                                {/* Responsive Feedback Interaction */}
                                <div className="xs:flex-row xs:items-center xs:justify-between mt-4 flex flex-col gap-2.5 border-t border-border/40 pt-3 text-xs text-text-muted">
                                  <span className="leading-tight">
                                    Câu trả lời này có hữu ích không?
                                  </span>
                                  <div className="flex shrink-0 items-center gap-2">
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      icon={ThumbsUp}
                                      onClick={() =>
                                        handleFeedback(faq.id, "yes")
                                      }
                                      className={
                                        feedbackGiven[faq.id] === "yes"
                                          ? "border-emerald-300! bg-emerald-50! font-medium! text-emerald-700! ring-0!"
                                          : "hover:bg-neutral-bg! border-border! text-text-muted! ring-0! hover:text-text-main!"
                                      }
                                    >
                                      Hữu ích
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      size="sm"
                                      icon={ThumbsDown}
                                      onClick={() =>
                                        handleFeedback(faq.id, "no")
                                      }
                                      className={
                                        feedbackGiven[faq.id] === "no"
                                          ? "border-amber-300! bg-amber-50! font-medium! text-amber-700! ring-0!"
                                          : "hover:bg-neutral-bg! border-border! text-text-muted! ring-0! hover:text-text-main!"
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
                      </div>
                    );
                  })}
                </motion.div>
              ) : (
                /* Empty Search State: Clean & Direct */
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center rounded-2xl border border-border bg-surface p-6 text-center sm:p-12"
                >
                  <img
                    src={EmptyState}
                    alt="Không tìm thấy câu hỏi"
                    className="mb-4 size-32 object-contain sm:size-48"
                  />
                  <h3 className="text-sm font-bold text-primary sm:text-lg">
                    Không tìm thấy câu hỏi phù hợp
                  </h3>
                  <p className="mt-1.5 max-w-md text-xs leading-relaxed text-text-muted sm:text-sm">
                    Không có câu hỏi nào khớp với từ khóa "{searchQuery}". Bạn
                    hãy thử tìm bằng cụm từ khác ngắn gọn hơn hoặc gửi yêu cầu
                    tới đội ngũ hỗ trợ.
                  </p>
                  <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button
                      variant="secondary"
                      size="md"
                      icon={RotateCcw}
                      onClick={() => setSearchQuery("")}
                      className="w-full! sm:w-auto!"
                    >
                      Xóa bộ lọc
                    </Button>
                    <Link to={PATHS.CONTACT} className="w-full sm:w-auto">
                      <Button
                        variant="primary"
                        size="md"
                        className="w-full! sm:w-auto!"
                      >
                        Gửi yêu cầu hỗ trợ
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
          3. FALLBACK CTA: Restrained, High-Contrast & Responsive
          ===================================================================== */}
      <section className="border-t border-border bg-surface py-10 lg:py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-primary p-6 text-surface shadow-xs sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 items-center gap-6 sm:gap-8 lg:grid-cols-12">
              <div className="flex flex-col gap-3 text-center lg:col-span-8 lg:text-left">
                <h2 className="xs:text-2xl text-xl font-bold tracking-tight text-surface sm:text-3xl">
                  Bạn vẫn chưa tìm thấy câu trả lời mong muốn?
                </h2>
                <p className="max-w-2xl text-xs leading-relaxed text-surface/85 sm:text-sm">
                  Đội ngũ chuyên viên tư vấn của SmartHire luôn đồng hành hỗ trợ
                  bạn 24/7 trong suốt quá trình tạo CV, kết nối nhà tuyển dụng
                  và theo dõi hồ sơ ứng tuyển.
                </p>

                <div className="xs:flex-row xs:gap-5 mt-2 flex flex-col items-center justify-center gap-3 text-xs text-surface/90 sm:text-sm lg:justify-start">
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Phone className="size-4 shrink-0 text-secondary" />
                    <span>
                      Hotline:{" "}
                      <strong className="font-semibold text-surface">
                        1900 6868
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 whitespace-nowrap">
                    <Mail className="size-4 shrink-0 text-secondary" />
                    <span>
                      Email:{" "}
                      <strong className="font-semibold text-surface">
                        support@smarthire.vn
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center justify-center lg:col-span-4 lg:justify-end">
                <Link to={PATHS.CONTACT} className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    className="hover:bg-neutral-bg! w-full! bg-surface! py-2.5! text-xs! font-semibold! text-primary! shadow-xs! sm:w-auto! sm:py-3! sm:text-sm!"
                  >
                    Gửi yêu cầu hỗ trợ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. FOOTER: Shared Brand Footer
          ===================================================================== */}
      <Footer />
    </div>
  );
}

export default FaqPage;
