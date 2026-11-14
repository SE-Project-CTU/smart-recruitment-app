import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Button, Footer } from "@/components/common";
import {
  ContactSupportIllustration,
  MessageSentIllustration,
} from "@/assets/images/decoration";
import { PATHS } from "@/constants/paths";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@/hooks/use-toast";

// =============================================================================
// ROLE & CONTEXTUAL TOPIC PRESETS
// =============================================================================

type RoleId = "candidate" | "recruiter" | "partner" | "other";

interface RoleOption {
  id: RoleId;
  label: string;
}

const ROLES: RoleOption[] = [
  { id: "candidate", label: "Ứng viên tìm việc" },
  { id: "recruiter", label: "Nhà tuyển dụng" },
  { id: "partner", label: "Đối tác hợp tác" },
  { id: "other", label: "Khác" },
];

const ROLE_TOPICS: Record<RoleId, string[]> = {
  candidate: [
    "Hỗ trợ tính điểm tương thích AI",
    "Lỗi định dạng xuất CV PDF",
    "Theo dõi tiến độ hồ sơ ứng tuyển",
  ],
  recruiter: [
    "Tư vấn giải pháp tuyển dụng",
    "Hỗ trợ duyệt và quản lý tin đăng",
    "Yêu cầu xuất hóa đơn doanh nghiệp",
  ],
  partner: [
    "Hợp tác truyền thông & sự kiện",
    "Tích hợp hệ sinh thái việc làm",
    "Tài trợ chương trình hướng nghiệp",
  ],
  other: [
    "Báo cáo sự cố bảo mật hoặc tài khoản",
    "Góp ý tính năng và trải nghiệm sản phẩm",
    "Thắc mắc chính sách và điều khoản",
  ],
};

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  message?: string;
}

// =============================================================================
// MAIN COMPONENT: ContactPage (Distilled, Quiet, Impeccable Craft)
// =============================================================================

export function ContactPage() {
  const user = useAuthStore((state) => state.user);

  // Khởi tạo form state mượt mà từ user session
  const [formData, setFormData] = useState(() => {
    const isRecruiter = user?.roles?.includes("Recruiter");
    return {
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: (isRecruiter ? "recruiter" : "candidate") as RoleId,
      subject: "",
      message: "",
    };
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleRoleSelect = (roleId: RoleId) => {
    setFormData((prev) => ({ ...prev, role: roleId }));
  };

  const handleTopicClick = (topic: string) => {
    setFormData((prev) => ({
      ...prev,
      subject: prev.subject === topic ? "" : topic,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ và tên.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập địa chỉ email.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Địa chỉ email không đúng định dạng.";
      }
    }

    if (formData.phone.trim()) {
      const phoneRegex = /^(\+?84|0)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(formData.phone.trim().replace(/[\s.-]/g, ""))) {
        newErrors.phone = "Số điện thoại không đúng định dạng.";
      }
    }

    if (!formData.message.trim()) {
      newErrors.message = "Vui lòng nhập nội dung cần hỗ trợ.";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Nội dung tin nhắn tối thiểu 10 ký tự.";
    }

    setErrors(newErrors);

    if (newErrors.fullName) {
      fullNameInputRef.current?.focus();
    } else if (newErrors.email) {
      emailInputRef.current?.focus();
    } else if (newErrors.phone) {
      phoneInputRef.current?.focus();
    } else if (newErrors.message) {
      messageInputRef.current?.focus();
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Thông tin chưa hoàn tất",
        description: "Vui lòng kiểm tra lại các trường có thông báo màu đỏ.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Đã gửi thông tin",
        description: "SmartHire sẽ phản hồi qua email trong vòng 24 giờ làm việc.",
      });
    }, 800);
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setErrors({});
    setFormData({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phone: user?.phone || "",
      role: user?.roles?.includes("Recruiter") ? "recruiter" : "candidate",
      subject: "",
      message: "",
    });
  };

  const currentRoleTopics = ROLE_TOPICS[formData.role] || ROLE_TOPICS.candidate;

  return (
    <div className="min-h-screen bg-bg text-text-main antialiased selection:bg-secondary-light selection:text-primary caret-primary">
      {/* =====================================================================
          1. HERO SECTION: Clean, Typographic & Restrained (No Noisy Badges)
          ===================================================================== */}
      <section className="relative overflow-hidden border-b border-border bg-bg-white-blue/60 pt-12 pb-10 sm:pt-16 sm:pb-14 lg:pt-20 lg:pb-16">
        <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left: Heading & Value Proposition */}
            <div className="flex flex-col gap-3 text-center lg:col-span-7 lg:text-left">
              <h1 className="text-3xl font-bold tracking-tight text-primary xs:text-4xl sm:text-5xl">
                Liên hệ với chúng tôi
              </h1>
              <p className="max-w-xl text-xs leading-relaxed text-text-muted xs:text-sm sm:text-base">
                Đội ngũ SmartHire luôn sẵn sàng lắng nghe mọi thắc mắc về tạo CV chuẩn AI, định hướng tìm việc và giải pháp tuyển dụng doanh nghiệp.
              </p>

              {/* Direct Link to FAQ */}
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-text-muted sm:text-sm lg:justify-start">
                <span>Bạn muốn tra cứu câu trả lời ngay?</span>
                <Link
                  to={PATHS.FAQS}
                  className="inline-flex items-center gap-1 font-semibold text-primary transition-colors hover:underline"
                >
                  <HelpCircle className="size-3.5" />
                  <span>Xem Trung tâm trợ giúp</span>
                </Link>
              </div>
            </div>

            {/* Right: Storyset Illustration */}
            <div className="relative hidden justify-center lg:col-span-5 lg:flex">
              <div className="relative flex h-56 w-64 items-center justify-center lg:h-64 lg:w-76">
                <img
                  src={ContactSupportIllustration}
                  alt="Bộ phận hỗ trợ SmartHire"
                  className="relative z-10 max-h-full object-contain filter"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          2. MAIN CONTENT: Unified, Quiet & Focused
          ===================================================================== */}
      <section className="py-10 sm:py-14 lg:py-16">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left: Direct Channels Information (4 cols) */}
            <div className="flex flex-col gap-8 lg:col-span-4">
              <div>
                <h2 className="text-base font-bold text-text-main sm:text-lg">
                  Kênh hỗ trợ trực tiếp
                </h2>
                <p className="mt-1 text-xs text-text-muted sm:text-sm">
                  Chúng tôi tiếp nhận yêu cầu và phản hồi nhanh chóng trong giờ làm việc.
                </p>
              </div>

              {/* Channels List: Text-led, Quiet, No Noisy Boxed Icons or Colored Pills */}
              <div className="space-y-6 text-xs sm:text-sm">
                {/* Hotline */}
                <div className="border-b border-border/60 pb-5">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Phone className="size-4 text-primary" />
                    <span className="font-medium text-text-main">Hotline tư vấn</span>
                  </div>
                  <div className="mt-1.5 pl-6">
                    <a
                      href="tel:19006868"
                      className="text-base font-semibold text-primary hover:underline"
                    >
                      1900 6868
                    </a>
                    <p className="text-xs text-text-muted">
                      Miễn phí cước cuộc gọi trong nước
                    </p>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Quốc tế: (+84) 28 7300 8888
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="border-b border-border/60 pb-5">
                  <div className="flex items-center gap-2 text-text-muted">
                    <Mail className="size-4 text-primary" />
                    <span className="font-medium text-text-main">Hòm thư tiếp nhận</span>
                  </div>
                  <div className="mt-1.5 pl-6 space-y-0.5">
                    <a
                      href="mailto:support@smarthire.vn"
                      className="block font-medium text-text-main transition-colors hover:text-primary hover:underline"
                    >
                      support@smarthire.vn
                    </a>
                    <p className="text-xs text-text-muted">
                      Hỗ trợ ứng viên và xử lý kỹ thuật
                    </p>
                    <a
                      href="mailto:contact@smarthire.vn"
                      className="block pt-1 font-medium text-text-main transition-colors hover:text-primary hover:underline"
                    >
                      contact@smarthire.vn
                    </a>
                    <p className="text-xs text-text-muted">
                      Tư vấn hợp tác và doanh nghiệp
                    </p>
                  </div>
                </div>

                {/* Office Address */}
                <div className="border-b border-border/60 pb-5">
                  <div className="flex items-center gap-2 text-text-muted">
                    <MapPin className="size-4 text-primary" />
                    <span className="font-medium text-text-main">Trụ sở chính</span>
                  </div>
                  <div className="mt-1.5 pl-6">
                    <p className="leading-relaxed text-text-muted">
                      Tầng 12, Tòa nhà Sheraton, đường 30/4, Phường Ninh Kiều, Cần Thơ
                    </p>
                  </div>
                </div>

                {/* Operating Hours */}
                <div>
                  <div className="flex items-center gap-2 text-text-muted">
                    <Clock className="size-4 text-primary" />
                    <span className="font-medium text-text-main">Thời gian hoạt động</span>
                  </div>
                  <div className="mt-1.5 pl-6 space-y-0.5 text-text-muted">
                    <p>Thứ Hai – Thứ Sáu: 08:00 – 18:00</p>
                    <p>Thứ Bảy: 08:00 – 12:00 (Trực tuyến)</p>
                  </div>
                </div>
              </div>

              {/* Discreet Trust Note */}
              <div className="rounded-xl border border-border/80 bg-surface/60 p-4 text-xs text-text-muted">
                <p className="leading-relaxed">
                  Thông tin bạn cung cấp được bảo mật và chỉ sử dụng cho mục đích giải đáp yêu cầu liên hệ.
                </p>
              </div>
            </div>

            {/* Right: Contact Form (8 cols) */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl border border-border bg-surface p-6 shadow-xs sm:p-8 lg:p-10">
                <AnimatePresence mode="wait">
                  {isSubmitted ? (
                    /* =========================================================
                       CONFIRMATION STATE
                       ========================================================= */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center py-6 text-center sm:py-8"
                    >
                      <div className="mb-5 size-40 sm:size-48">
                        <img
                          src={MessageSentIllustration}
                          alt="Đã gửi tin nhắn"
                          className="size-full object-contain"
                        />
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <CheckCircle2 className="size-4 text-primary" />
                        <span>Đã tiếp nhận yêu cầu</span>
                      </div>

                      <h3 className="mt-2 text-xl font-bold tracking-tight text-text-main sm:text-2xl">
                        Cảm ơn bạn đã liên hệ
                      </h3>

                      <p className="mt-2 max-w-md text-xs leading-relaxed text-text-muted sm:text-sm">
                        SmartHire sẽ xem xét thông tin và phản hồi đến email{" "}
                        <strong className="font-semibold text-text-main">
                          {formData.email}
                        </strong>{" "}
                        trong vòng 24 giờ làm việc.
                      </p>

                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
                            Về trang chủ
                          </Button>
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    /* =========================================================
                       CONTACT FORM: Clean, Quiet & Easy to Use
                       ========================================================= */
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div className="border-b border-border/60 pb-5">
                        <h2 className="text-xl font-bold tracking-tight text-text-main sm:text-2xl">
                          Gửi tin nhắn hỗ trợ
                        </h2>
                        <p className="mt-1 text-xs text-text-muted sm:text-sm">
                          Vui lòng điền nội dung bạn cần hỗ trợ vào biểu mẫu bên dưới.
                        </p>
                      </div>

                      <form
                        onSubmit={handleSubmit}
                        noValidate
                        className="mt-6 space-y-5"
                      >
                        {/* 1. Role Selection (Clean Segmented Tabs, No Toy Icons) */}
                        <div>
                          <label
                            id="role-label"
                            className="block text-xs font-medium text-text-muted sm:text-sm"
                          >
                            Vai trò của bạn
                          </label>
                          <div
                            role="radiogroup"
                            aria-labelledby="role-label"
                            className="mt-2 flex flex-wrap gap-1.5"
                          >
                            {ROLES.map((role) => {
                              const isSelected = formData.role === role.id;
                              return (
                                <button
                                  key={role.id}
                                  role="radio"
                                  aria-checked={isSelected}
                                  type="button"
                                  onClick={() => handleRoleSelect(role.id)}
                                  className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    isSelected
                                      ? "bg-primary text-surface shadow-xs"
                                      : "border border-border bg-bg text-text-muted hover:bg-surface hover:text-text-main"
                                  }`}
                                >
                                  {role.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* 2. Full Name & Email */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          <div>
                            <label
                              htmlFor="fullName"
                              className="block text-xs font-medium text-text-main"
                            >
                              Họ và tên <span className="text-status-error">*</span>
                            </label>
                            <input
                              ref={fullNameInputRef}
                              id="fullName"
                              type="text"
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              placeholder="Nguyễn Văn A"
                              aria-invalid={!!errors.fullName}
                              aria-describedby={
                                errors.fullName ? "fullName-error" : undefined
                              }
                              className={`mt-1.5 w-full rounded-xl border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/50 transition-colors focus:bg-surface focus:outline-none sm:text-sm ${
                                errors.fullName
                                  ? "border-status-error focus:ring-1 focus:ring-status-error"
                                  : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                              }`}
                            />
                            {errors.fullName && (
                              <p
                                id="fullName-error"
                                className="mt-1 flex items-center gap-1 text-xs text-status-error"
                              >
                                <AlertCircle className="size-3 shrink-0" />
                                <span>{errors.fullName}</span>
                              </p>
                            )}
                          </div>

                          <div>
                            <label
                              htmlFor="email"
                              className="block text-xs font-medium text-text-main"
                            >
                              Địa chỉ Email <span className="text-status-error">*</span>
                            </label>
                            <input
                              ref={emailInputRef}
                              id="email"
                              type="email"
                              name="email"
                              value={formData.email}
                              onChange={handleChange}
                              placeholder="email@example.com"
                              aria-invalid={!!errors.email}
                              aria-describedby={
                                errors.email ? "email-error" : undefined
                              }
                              className={`mt-1.5 w-full rounded-xl border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/50 transition-colors focus:bg-surface focus:outline-none sm:text-sm ${
                                errors.email
                                  ? "border-status-error focus:ring-1 focus:ring-status-error"
                                  : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                              }`}
                            />
                            {errors.email && (
                              <p
                                id="email-error"
                                className="mt-1 flex items-center gap-1 text-xs text-status-error"
                              >
                                <AlertCircle className="size-3 shrink-0" />
                                <span>{errors.email}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* 3. Phone */}
                        <div>
                          <label
                            htmlFor="phone"
                            className="block text-xs font-medium text-text-main"
                          >
                            Số điện thoại liên hệ
                          </label>
                          <input
                            ref={phoneInputRef}
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="0912 345 678"
                            aria-invalid={!!errors.phone}
                            aria-describedby={
                              errors.phone ? "phone-error" : undefined
                            }
                            className={`mt-1.5 w-full rounded-xl border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/50 transition-colors focus:bg-surface focus:outline-none sm:text-sm ${
                              errors.phone
                                ? "border-status-error focus:ring-1 focus:ring-status-error"
                                : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                            }`}
                          />
                          {errors.phone && (
                            <p
                              id="phone-error"
                              className="mt-1 flex items-center gap-1 text-xs text-status-error"
                            >
                              <AlertCircle className="size-3 shrink-0" />
                              <span>{errors.phone}</span>
                            </p>
                          )}
                        </div>

                        {/* 4. Subject with Understated Quick Topic Links */}
                        <div>
                          <label
                            htmlFor="subject"
                            className="block text-xs font-medium text-text-main"
                          >
                            Chủ đề yêu cầu
                          </label>

                          <input
                            id="subject"
                            type="text"
                            name="subject"
                            value={formData.subject}
                            onChange={handleChange}
                            placeholder="Tiêu đề yêu cầu hỗ trợ..."
                            className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/50 transition-colors focus:border-primary focus:bg-surface focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm"
                          />

                          {/* Subtle text suggestion links (No chunky colorful badges) */}
                          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                            <span className="shrink-0">Gợi ý:</span>
                            {currentRoleTopics.map((topic, idx) => (
                              <span
                                key={topic}
                                className="inline-flex items-center gap-1.5 whitespace-nowrap"
                              >
                                <button
                                  type="button"
                                  onClick={() => handleTopicClick(topic)}
                                  className={`cursor-pointer transition-colors hover:text-primary hover:underline ${
                                    formData.subject === topic
                                      ? "font-semibold text-primary underline"
                                      : "text-text-muted"
                                  }`}
                                >
                                  {topic}
                                </button>
                                {idx < currentRoleTopics.length - 1 && (
                                  <span className="text-border select-none" aria-hidden="true">
                                    •
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* 5. Message Textarea */}
                        <div>
                          <div className="flex items-center justify-between">
                            <label
                              htmlFor="message"
                              className="block text-xs font-medium text-text-main"
                            >
                              Nội dung chi tiết <span className="text-status-error">*</span>
                            </label>
                            <span className="text-xs text-text-muted">
                              {formData.message.length}/1000
                            </span>
                          </div>
                          <textarea
                            ref={messageInputRef}
                            id="message"
                            name="message"
                            rows={4}
                            maxLength={1000}
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Mô tả cụ thể vấn đề hoặc nội dung cần tư vấn..."
                            aria-invalid={!!errors.message}
                            aria-describedby={
                              errors.message ? "message-error" : undefined
                            }
                            className={`mt-1.5 w-full rounded-xl border bg-bg px-3.5 py-2.5 text-xs leading-relaxed text-text-main placeholder:text-text-muted/50 transition-colors focus:bg-surface focus:outline-none sm:text-sm ${
                              errors.message
                                ? "border-status-error focus:ring-1 focus:ring-status-error"
                                : "border-border focus:border-primary focus:ring-1 focus:ring-primary"
                            }`}
                          />
                          {errors.message && (
                            <p
                              id="message-error"
                              className="mt-1 flex items-center gap-1 text-xs text-status-error"
                            >
                              <AlertCircle className="size-3 shrink-0" />
                              <span>{errors.message}</span>
                            </p>
                          )}
                        </div>

                        {/* 6. Submit Button */}
                        <div className="pt-2">
                          <Button
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={isSubmitting}
                            icon={Send}
                            iconPosition="right"
                            className="w-full! justify-center py-2.5! text-xs! font-medium! sm:w-auto sm:px-8! sm:py-2.5! sm:text-sm!"
                          >
                            Gửi yêu cầu hỗ trợ
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
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
