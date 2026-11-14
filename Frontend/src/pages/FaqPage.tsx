import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  HelpCircle,
  MessageSquare,
  FileText,
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/common";
import { PATHS } from "@/constants/paths";

interface FaqItem {
  id: string;
  category: "all" | "candidate" | "recruiter" | "cv" | "account";
  question: string;
  answer: string;
}

const FAQ_CATEGORIES = [
  { id: "all", label: "Tất cả", icon: Sparkles },
  { id: "candidate", label: "Ứng viên & Tìm việc", icon: HelpCircle },
  { id: "recruiter", label: "Nhà tuyển dụng", icon: Building2 },
  { id: "cv", label: "Tạo & Quản lý CV", icon: FileText },
  { id: "account", label: "Tài khoản & Bảo mật", icon: ShieldCheck },
] as const;

const FAQ_DATA: FaqItem[] = [
  {
    id: "faq-1",
    category: "candidate",
    question: "Làm sao để tìm kiếm và lọc việc làm phù hợp trên SmartHire?",
    answer:
      "Bạn có thể vào trang 'Tìm việc làm', sử dụng thanh tìm kiếm theo chức danh hoặc từ khóa kỹ năng. Bạn có thể kết hợp các bộ lọc chi tiết gồm: địa điểm (Tỉnh/Thành, Quận/Huyện), mức lương, hình thức làm việc (Remote, Hybrid, On-site) và cấp bậc kinh nghiệm để tìm công việc mong muốn nhanh nhất.",
  },
  {
    id: "faq-2",
    category: "candidate",
    question: "Ứng tuyển công việc trên SmartHire có mất phí không?",
    answer:
      "Hoàn toàn miễn phí 100%. Mọi tính năng dành cho ứng viên bao gồm: tìm kiếm việc làm, lưu tin tuyển dụng, tạo và tải CV chuẩn ATS, theo dõi tiến độ ứng tuyển trực tuyến đều được cung cấp miễn phí.",
  },
  {
    id: "faq-3",
    category: "cv",
    question: "CV tạo trên SmartHire có tương thích với hệ thống quét ATS không?",
    answer:
      "Có. Tất cả các mẫu CV trên SmartHire đều được tối ưu hóa cấu trúc tiêu chuẩn một cột hoặc hai cột rõ ràng, phông chữ chuẩn in ấn và mã hóa văn bản chuẩn UTF-8, đảm bảo các phần mềm ATS quét chính xác thông tin học vấn, kỹ năng và kinh nghiệm.",
  },
  {
    id: "faq-4",
    category: "cv",
    question: "Tôi có thể xuất CV ra định dạng nào?",
    answer:
      "Bạn có thể tải CV về máy dưới định dạng PDF chất lượng cao khổ A4 tiêu chuẩn. Ngoài ra, bạn có thể tạo liên kết xem trực tuyến công khai để chia sẻ trực tiếp với nhà tuyển dụng.",
  },
  {
    id: "faq-5",
    category: "recruiter",
    question: "Doanh nghiệp cần chuẩn bị những gì để đăng tin tuyển dụng?",
    answer:
      "Nhà tuyển dụng cần đăng ký tài khoản Recruiter, tạo hồ sơ công ty với mã số thuế và giấy tờ xác minh pháp lý. Sau khi đội ngũ SmartHire xét duyệt hồ sơ doanh nghiệp (thường trong vòng 24 giờ làm việc), bạn có thể đăng tin tuyển dụng và tiếp nhận hồ sơ ứng viên ngay lập tức.",
  },
  {
    id: "faq-6",
    category: "recruiter",
    question: "Làm thế nào để quản lý các thành viên HR trong cùng một công ty?",
    answer:
      "Chủ sở hữu hoặc Quản trị viên của công ty có thể gửi lời mời tham gia qua email cho các chuyên viên tuyển dụng khác tại mục 'Quản lý công ty' > 'Thành viên'. Bạn có thể phân quyền vai trò (Admin, Recruiter, Member) linh hoạt cho từng nhân sự.",
  },
  {
    id: "faq-7",
    category: "account",
    question: "Tôi bị quên mật khẩu hoặc muốn đổi mật khẩu thì làm thế nào?",
    answer:
      "Nếu bạn đăng nhập bằng Email/Password, bạn có thể vào trang 'Hồ sơ cá nhân' > 'Đổi mật khẩu' để cập nhật. Nếu bạn đăng nhập nhanh bằng Google OAuth, mật khẩu được bảo vệ trực tiếp qua tài khoản Google của bạn.",
  },
  {
    id: "faq-8",
    category: "account",
    question: "Dữ liệu cá nhân và CV của tôi được bảo mật như thế nào?",
    answer:
      "SmartHire cam kết tuân thủ nghiêm ngặt chính sách bảo vệ dữ liệu cá nhân. CV của bạn chỉ được chia sẻ tới các nhà tuyển dụng khi bạn chủ động nộp hồ sơ, hoặc khi bạn chủ động bật chế độ 'Công khai hồ sơ' trên hệ thống.",
  },
];

export function FaqPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>("faq-1");

  const filteredFaqs = useMemo(() => {
    return FAQ_DATA.filter((item) => {
      const matchCategory =
        selectedCategory === "all" || item.category === selectedCategory;
      const query = searchQuery.trim().toLowerCase();
      const matchQuery =
        !query ||
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query);
      return matchCategory && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-bg text-text-main">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <HelpCircle className="size-3.5" />
            <span>Trung tâm trợ giúp SmartHire</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
            Câu Hỏi Thường Gặp (FAQs)
          </h1>
          <p className="mt-3 text-sm text-text-muted sm:text-base">
            Giải đáp mọi thắc mắc của bạn về việc tìm kiếm việc làm, tạo CV chuẩn
            và quy trình tuyển dụng trên SmartHire.
          </p>

          {/* Ô tìm kiếm câu hỏi */}
          <div className="relative mx-auto mt-8 max-w-xl">
            <Search className="absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm câu hỏi hoặc từ khóa trợ giúp..."
              className="w-full rounded-2xl border border-border bg-bg py-3.5 pr-4 pl-11 text-sm text-text-main placeholder:text-text-muted/60 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 pb-8">
          {FAQ_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium transition-all sm:text-sm ${
                  isSelected
                    ? "bg-primary text-white shadow-sm"
                    : "border border-border bg-surface text-text-muted hover:border-text-muted/30 hover:text-text-main"
                }`}
              >
                <Icon className="size-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFaqs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center">
              <HelpCircle className="mx-auto size-10 text-text-muted/50" />
              <p className="mt-3 text-sm font-semibold text-text-main">
                Không tìm thấy câu hỏi phù hợp
              </p>
              <p className="mt-1 text-xs text-text-muted">
                Thử tìm với từ khóa khác hoặc liên hệ trực tiếp với bộ phận hỗ trợ
              </p>
            </div>
          ) : (
            filteredFaqs.map((faq) => {
              const isOpen = openFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="overflow-hidden rounded-2xl border border-border bg-surface transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                    className="flex w-full items-center justify-between gap-4 p-5 text-left text-sm font-semibold text-text-main sm:text-base"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={`size-4.5 shrink-0 text-text-muted transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-border/60 bg-bg/50 px-5 pt-3 pb-5 text-xs leading-relaxed text-text-muted sm:text-sm">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* CTA Liên hệ hỗ trợ */}
        <div className="mt-12 rounded-2xl border border-border bg-surface p-6 text-center sm:p-8">
          <MessageSquare className="mx-auto size-8 text-primary" />
          <h3 className="mt-3 text-base font-bold text-text-main sm:text-lg">
            Vẫn chưa tìm được câu trả lời?
          </h3>
          <p className="mt-1 text-xs text-text-muted sm:text-sm">
            Đội ngũ tư vấn viên của SmartHire luôn sẵn sàng lắng nghe và giải đáp mọi yêu cầu của bạn.
          </p>
          <div className="mt-5">
            <Link to={PATHS.CONTACT}>
              <Button
                variant="primary"
                icon={ArrowRight}
                iconPosition="right"
                className="px-5! py-2.5! text-xs! font-semibold! sm:text-sm!"
              >
                Gửi yêu cầu liên hệ
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default FaqPage;

