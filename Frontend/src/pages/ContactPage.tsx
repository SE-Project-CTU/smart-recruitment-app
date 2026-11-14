import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  HelpCircle,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Building2,
  UserCheck,
  Handshake,
} from "lucide-react";
import { Button, Footer } from "@/components/common";
import {
  ContactSupportIllustration,
  MessageSentIllustration,
} from "@/assets/images/decoration";
import { PATHS } from "@/constants/paths";
import { toast } from "@/hooks/use-toast";

// =============================================================================
// ANIMATION VARIANTS (Impeccable Purposeful Motion)
// =============================================================================

const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: easeOutExpo,
    },
  },
};

// =============================================================================
// ROLE & TOPIC PRESETS
// =============================================================================

interface RoleOption {
  id: "candidate" | "recruiter" | "partner" | "other";
  label: string;
  icon: React.ElementType;
}

const ROLES: RoleOption[] = [
  { id: "candidate", label: "Ứng viên tìm việc", icon: UserCheck },
  { id: "recruiter", label: "Nhà tuyển dụng", icon: Building2 },
  { id: "partner", label: "Đối tác hợp tác", icon: Handshake },
  { id: "other", label: "Mục đích khác", icon: Sparkles },
];

const TOPIC_PRESETS = [
  "Tư vấn gói giải pháp tuyển dụng",
  "Hỗ trợ tối ưu điểm tương thích AI",
  "Báo cáo sự cố kỹ thuật",
  "Hợp tác truyền thông & đối tác",
  "Yêu cầu xuất hóa đơn doanh nghiệp",
];

// =============================================================================
// MAIN COMPONENT: ContactPage
// =============================================================================

export function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "candidate" as RoleOption["id"],
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleSelect = (roleId: RoleOption["id"]) => {
    setFormData((prev) => ({ ...prev, role: roleId }));
  };

  const handleTopicClick = (topic: string) => {
    setFormData((prev) => ({ ...prev, subject: topic }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.fullName.trim() ||
      !formData.email.trim() ||
      !formData.message.trim()
    ) {
      toast({
        title: "Vui lòng hoàn tất thông tin",
        description: "Họ và tên, địa chỉ email và nội dung tin nhắn là bắt buộc.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Giả lập gửi thông tin liên hệ
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Đã gửi thông tin liên hệ",
        description:
          "SmartHire đã tiếp nhận yêu cầu và sẽ phản hồi qua email trong vòng 24 giờ làm việc.",
      });
    }, 850);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setFormData({
      fullName: "",
      email: "",
      phone: "",
      role: "candidate",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen bg-bg text-text-main antialiased selection:bg-secondary-light selection:text-primary caret-primary">
      {/* =====================================================================
          1. HERO HEADER: Restrained & Authoritative (No Kicker Pills)
          ===================================================================== */}
      <section className="relative overflow-hidden border-b border-border bg-bg-white-blue/60 pt-14 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-20">
        <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 3xl:max-w-[105rem]">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Left Column: Heading, Value Proposition & Quick Help Link */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
              className="flex flex-col text-center lg:col-span-7 lg:text-left xl:col-span-7"
            >
              <h1 className="text-3xl font-bold tracking-tight text-primary xs:text-4xl sm:text-5xl lg:text-5xl 3xl:text-6xl">
                Chúng tôi luôn sẵn sàng hỗ trợ bạn
              </h1>

              <p className="mx-auto mt-3 max-w-2xl text-xs leading-relaxed text-text-muted xs:text-sm sm:mt-4 sm:text-base lg:mx-0 3xl:max-w-3xl 3xl:text-lg">
                Dù bạn là ứng viên cần đồng hành trong lộ trình tạo CV chuẩn AI hay doanh nghiệp đang tìm kiếm giải pháp tuyển dụng thông minh, đội ngũ chuyên viên SmartHire luôn ở đây để lắng nghe.
              </p>

              {/* Direct Redirect to FAQ */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-text-muted sm:text-sm lg:justify-start">
                <span>Bạn cần câu trả lời tức thì?</span>
                <Link
                  to={PATHS.FAQS}
                  className="inline-flex items-center gap-1 font-semibold text-primary underline-offset-4 transition-colors hover:underline hover:text-primary-dark"
                >
                  <HelpCircle className="size-3.5 sm:size-4" />
                  <span>Tra cứu trung tâm trợ giúp (FAQs)</span>
                  <ArrowUpRight className="size-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Floating Storyset Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15, ease: easeOutExpo }}
              className="relative hidden justify-center lg:col-span-5 lg:flex xl:col-span-5"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative flex h-64 w-72 items-center justify-center sm:h-80 sm:w-88 3xl:h-96 3xl:w-105"
              >
                <img
                  src={ContactSupportIllustration}
                  alt="Chuyên viên hỗ trợ SmartHire"
                  className="relative z-10 max-h-full object-contain drop-shadow-sm filter"
                />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. MAIN SECTION: Direct Information & Interactive Form
          ===================================================================== */}
      <section className="py-10 sm:py-14 lg:py-16 3xl:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 3xl:max-w-[105rem]">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Left: Contact Channels & Commitments (5 cols) */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="flex flex-col gap-6 lg:col-span-5"
            >
              {/* Direct Channels Card */}
              <motion.div
                variants={itemVariants}
                className="overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8"
              >
                <h2 className="text-lg font-bold text-text-main sm:text-xl">
                  Thông tin kết nối trực tiếp
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-text-muted sm:text-sm">
                  Liên hệ qua các kênh chính thức của SmartHire để được tiếp nhận và xử lý nhanh chóng.
                </p>

                <div className="mt-6 space-y-5">
                  {/* Hotline */}
                  <a
                    href="tel:19006868"
                    className="group flex items-start gap-3.5 rounded-xl p-2.5 transition-colors hover:bg-neutral-bg"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary-light/70 text-primary transition-transform group-hover:scale-105">
                      <Phone className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-text-main sm:text-sm">
                          Hotline tư vấn
                        </h4>
                        <span className="rounded-full bg-secondary-light/60 px-2 py-0.5 text-[10px] font-medium text-primary">
                          Miễn phí cước
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm font-bold text-primary group-hover:underline">
                        1900 6868
                      </p>
                      <p className="text-xs text-text-muted">
                        (+84) 28 7300 8888 (Quốc tế)
                      </p>
                    </div>
                  </a>

                  {/* Email */}
                  <a
                    href="mailto:support@smarthire.vn"
                    className="group flex items-start gap-3.5 rounded-xl p-2.5 transition-colors hover:bg-neutral-bg"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary-light/70 text-primary transition-transform group-hover:scale-105">
                      <Mail className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-semibold text-text-main sm:text-sm">
                          Email tiếp nhận
                        </h4>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                          Phản hồi &lt; 2h
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs font-medium text-text-main group-hover:text-primary sm:text-sm">
                        support@smarthire.vn
                      </p>
                      <p className="text-xs text-text-muted">
                        contact@smarthire.vn
                      </p>
                    </div>
                  </a>

                  {/* Office Address */}
                  <div className="flex items-start gap-3.5 p-2.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary-light/70 text-primary">
                      <MapPin className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-text-main sm:text-sm">
                        Trụ sở chính
                      </h4>
                      <p className="mt-0.5 text-xs leading-relaxed text-text-muted sm:text-sm">
                        Tầng 12, Tòa nhà Sheraton, đường 30/4, Phường Ninh Kiều, Cần Thơ
                      </p>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div className="flex items-start gap-3.5 p-2.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary-light/70 text-primary">
                      <Clock className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-text-main sm:text-sm">
                        Khung giờ làm việc
                      </h4>
                      <p className="mt-0.5 text-xs text-text-muted sm:text-sm">
                        Thứ Hai – Thứ Sáu: 08:00 – 18:00
                      </p>
                      <p className="text-xs text-text-muted sm:text-sm">
                        Thứ Bảy: 08:00 – 12:00 (Hỗ trợ trực tuyến)
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Security & Service Guarantee Card */}
              <motion.div
                variants={itemVariants}
                className="rounded-2xl border border-border bg-surface p-6 shadow-xs"
              >
                <div className="flex items-center gap-3 text-status-success">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-text-main sm:text-sm">
                      Cam kết chất lượng dịch vụ
                    </h3>
                    <p className="text-[11px] text-text-muted sm:text-xs">
                      Bảo mật thông tin 100% theo tiêu chuẩn kiểm duyệt nội bộ
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-text-muted">
                  Mọi yêu cầu gửi tới SmartHire được chuyển thẳng tới đúng bộ phận chuyên trách. Chúng tôi cam kết phản hồi minh bạch, chi tiết và không làm phiền thông tin ngoài phạm vi tư vấn.
                </p>
              </motion.div>
            </motion.div>

            {/* Right: Interactive Contact Form / Success State (7 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: 0.1, ease: easeOutExpo }}
              className="lg:col-span-7"
            >
              <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8 lg:p-10">
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    /* =========================================================
                       SUCCESS CONFIRMATION STATE (Storyset Pana Illustration)
                       ========================================================= */
                    <motion.div
                      key="success-state"
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.4, ease: easeOutExpo }}
                      className="flex flex-col items-center py-6 text-center sm:py-10"
                    >
                      <motion.div
                        initial={{ y: 10 }}
                        animate={{ y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                        className="relative mb-6 size-48 sm:size-56"
                      >
                        <img
                          src={MessageSentIllustration}
                          alt="Gửi tin nhắn thành công"
                          className="size-full object-contain"
                        />
                      </motion.div>

                      <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="size-4" />
                        <span>Tiếp nhận yêu cầu thành công</span>
                      </div>

                      <h3 className="mt-3 text-xl font-bold tracking-tight text-primary sm:text-2xl">
                        Cảm ơn bạn đã gửi liên hệ!
                      </h3>

                      <p className="mt-2 max-w-md text-xs leading-relaxed text-text-muted sm:text-sm">
                        Yêu cầu của bạn đã được ghi nhận vào hệ thống. Chuyên viên chăm sóc khách hàng của SmartHire sẽ kiểm tra và phản hồi trực tiếp tới email{" "}
                        <strong className="font-semibold text-text-main">
                          {formData.email}
                        </strong>{" "}
                        trong vòng 24 giờ.
                      </p>

                      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        <Button
                          variant="secondary"
                          size="md"
                          onClick={handleResetForm}
                          className="w-full! sm:w-auto!"
                        >
                          Gửi yêu cầu khác
                        </Button>
                        <Link to={PATHS.HOME} className="w-full sm:w-auto">
                          <Button
                            variant="primary"
                            size="md"
                            className="w-full! sm:w-auto!"
                          >
                            Quay về trang chủ
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    /* =========================================================
                       ACTIVE CONTACT FORM (Polished, Accessible, Micro-motion)
                       ========================================================= */
                    <motion.div
                      key="form-state"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div>
                        <h2 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl">
                          Gửi tin nhắn yêu cầu hỗ trợ
                        </h2>
                        <p className="mt-1 text-xs leading-relaxed text-text-muted sm:text-sm">
                          Điền chi tiết nội dung bạn quan tâm, chúng tôi sẽ phân bổ chuyên viên phù hợp hỗ trợ bạn.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        {/* 1. Role Selection Chips */}
                        <div>
                          <label className="block text-xs font-semibold text-text-main sm:text-sm">
                            Bạn là ai? <span className="text-status-error">*</span>
                          </label>
                          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {ROLES.map((role) => {
                              const isSelected = formData.role === role.id;
                              const IconComponent = role.icon;
                              return (
                                <button
                                  key={role.id}
                                  type="button"
                                  onClick={() => handleRoleSelect(role.id)}
                                  className={`relative flex cursor-pointer items-center justify-center gap-2 rounded-xl border p-2.5 text-center text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    isSelected
                                      ? "border-primary bg-primary/5 font-semibold text-primary shadow-xs"
                                      : "border-border bg-bg text-text-muted hover:border-border/80 hover:bg-neutral-bg hover:text-text-main"
                                  }`}
                                >
                                  <IconComponent className="size-4 shrink-0" />
                                  <span className="truncate">{role.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Personal Info: Name & Email */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="fullName"
                              className="block text-xs font-semibold text-text-main"
                            >
                              Họ và tên <span className="text-status-error">*</span>
                            </label>
                            <input
                              id="fullName"
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              placeholder="Ví dụ: Nguyễn Văn A"
                              required
                              className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/60 transition-all duration-150 focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10 focus:outline-none sm:text-sm"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor="email"
                              className="block text-xs font-semibold text-text-main"
                            >
                              Địa chỉ Email <span className="text-status-error">*</span>
                            </label>
                            <input
                              id="email"
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="name@example.com"
                              required
                              className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/60 transition-all duration-150 focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10 focus:outline-none sm:text-sm"
                            />
                          </div>
                        </div>

                        {/* 3. Phone & Preset Topic Suggestions */}
                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-xs font-semibold text-text-main"
                          >
                            Số điện thoại liên hệ
                          </label>
                          <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Ví dụ: 0912 345 678"
                            className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/60 transition-all duration-150 focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10 focus:outline-none sm:text-sm"
                          />
                        </div>

                        {/* 4. Subject with Quick Chips */}
                        <div>
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="subject"
                              className="block text-xs font-semibold text-text-main"
                            >
                              Chủ đề yêu cầu
                            </label>
                            <span className="text-[11px] text-text-muted">
                              Gợi ý chủ đề nhanh
                            </span>
                          </div>

                          {/* Quick Topic Pills */}
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            {TOPIC_PRESETS.map((topic) => (
                              <button
                                key={topic}
                                type="button"
                                onClick={() => handleTopicClick(topic)}
                                className={`cursor-pointer rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                                  formData.subject === topic
                                    ? "border-primary bg-primary text-surface font-medium"
                                    : "border-border/70 bg-bg text-text-muted hover:border-primary/40 hover:text-text-main"
                                }`}
                              >
                                {topic}
                              </button>
                            ))}
                          </div>

                          <input
                            id="subject"
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Nhập tiêu đề hoặc bấm chọn gợi ý bên trên..."
                            className="mt-2 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/60 transition-all duration-150 focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10 focus:outline-none sm:text-sm"
                          />
                        </div>

                        {/* 5. Message Textarea */}
                        <div>
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="message"
                              className="block text-xs font-semibold text-text-main"
                            >
                              Nội dung chi tiết <span className="text-status-error">*</span>
                            </label>
                            <span className="text-[11px] text-text-muted">
                              {formData.message.length} ký tự
                            </span>
                          </div>
                          <textarea
                            id="message"
                            name="message"
                            rows={4}
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Mô tả cụ thể nhu cầu tư vấn doanh nghiệp, góp ý tính năng hoặc vấn đề bạn đang gặp phải..."
                            required
                            className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs leading-relaxed text-text-main placeholder:text-text-muted/60 transition-all duration-150 focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10 focus:outline-none sm:text-sm"
                          />
                        </div>

                        {/* 6. Action Submit Button */}
                        <div className="pt-2">
                          <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            isLoading={isSubmitting}
                            icon={Send}
                            iconPosition="right"
                            className="w-full! justify-center py-2.5! text-xs! font-semibold! shadow-xs! sm:w-auto sm:px-8! sm:py-3! sm:text-sm!"
                          >
                            Gửi yêu cầu hỗ trợ
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. FOOTER: Shared Brand Footer
          ===================================================================== */}
      <Footer />
    </div>
  );
}

export default ContactPage;
