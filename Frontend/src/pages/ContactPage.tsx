import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/common";
import { toast } from "@/hooks/use-toast";

export function ContactPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: "candidate",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ họ tên, email và nội dung liên hệ.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    // Giả lập gửi liên hệ
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({
        title: "Gửi liên hệ thành công",
        description: "Chúng tôi đã nhận được yêu cầu và sẽ phản hồi qua email trong thời gian sớm nhất.",
      });
    }, 800);
  };

  return (
    <div className="min-h-screen bg-bg text-text-main">
      {/* Hero Header */}
      <section className="relative overflow-hidden border-b border-border bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <MessageSquare className="size-3.5" />
            <span>Liên hệ chúng tôi</span>
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-text-main sm:text-4xl">
            Chúng Tôi Luôn Sẵn Sàng Lắng Nghe
          </h1>
          <p className="mt-3 text-sm text-text-muted sm:text-base">
            Bạn cần tư vấn giải pháp tuyển dụng hoặc hỗ trợ trong quá trình tìm việc?
            Hãy để lại thông tin, SmartHire sẽ liên hệ lại với bạn ngay.
          </p>
        </div>
      </section>

      {/* Main Content: Info & Form */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Cột trái: Thông tin văn phòng & Kênh hỗ trợ (5 cols) */}
          <div className="flex flex-col gap-6 lg:col-span-5">
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-main sm:text-xl">
                Thông tin liên hệ
              </h2>
              <p className="mt-1 text-xs text-text-muted sm:text-sm">
                Kết nối với bộ phận chăm sóc khách hàng và đội ngũ kỹ thuật SmartHire.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <MapPin className="size-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-main sm:text-sm">
                      Địa chỉ trụ sở
                    </h4>
                    <p className="mt-0.5 text-xs text-text-muted leading-relaxed">
                      Khu Công nghệ Cao, Phường Tân Phú, TP. Thủ Đức, TP. Hồ Chí Minh
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Mail className="size-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-main sm:text-sm">
                      Email hỗ trợ
                    </h4>
                    <p className="mt-0.5 text-xs text-text-muted">
                      support@smarthire.vn
                    </p>
                    <p className="text-xs text-text-muted">
                      contact@smarthire.vn
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Phone className="size-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-main sm:text-sm">
                      Hotline tư vấn
                    </h4>
                    <p className="mt-0.5 text-xs text-text-muted">
                      1900 6868 (8:00 - 18:00)
                    </p>
                    <p className="text-xs text-text-muted">
                      (+84) 28 7300 8888
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Clock className="size-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-text-main sm:text-sm">
                      Thời gian làm việc
                    </h4>
                    <p className="mt-0.5 text-xs text-text-muted">
                      Thứ 2 - Thứ 6: 08:00 - 17:30
                    </p>
                    <p className="text-xs text-text-muted">
                      Thứ 7: 08:00 - 12:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Khối cam kết */}
            <div className="rounded-2xl border border-border bg-surface p-6">
              <div className="flex items-center gap-3 text-status-success">
                <CheckCircle2 className="size-5" />
                <h3 className="text-sm font-bold text-text-main">
                  Phản hồi trong 24 giờ
                </h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-text-muted">
                Mọi thắc mắc của ứng viên và doanh nghiệp gửi qua biểu mẫu sẽ được
                chuyên viên hỗ trợ tiếp nhận và phản hồi chậm nhất trong 1 ngày làm việc.
              </p>
            </div>
          </div>

          {/* Cột phải: Form liên hệ (7 cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-main sm:text-xl">
                Gửi tin nhắn trực tiếp
              </h2>
              <p className="mt-1 text-xs text-text-muted sm:text-sm">
                Điền thông tin vào mẫu bên dưới, chúng tôi sẽ liên hệ lại với bạn.
              </p>

              {isSubmitted ? (
                <div className="mt-8 rounded-2xl border border-status-success/30 bg-status-success/10 p-8 text-center">
                  <CheckCircle2 className="mx-auto size-12 text-status-success" />
                  <h3 className="mt-3 text-base font-bold text-text-main sm:text-lg">
                    Cảm ơn bạn đã liên hệ!
                  </h3>
                  <p className="mt-1 text-xs text-text-muted sm:text-sm">
                    Yêu cầu của bạn đã được ghi nhận. Đội ngũ SmartHire sẽ gửi phản hồi
                    tới hòm thư <span className="font-semibold text-text-main">{formData.email}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFormData({
                        fullName: "",
                        email: "",
                        phone: "",
                        role: "candidate",
                        subject: "",
                        message: "",
                      });
                    }}
                    className="mt-6 inline-flex cursor-pointer text-xs font-semibold text-primary hover:underline"
                  >
                    Gửi yêu cầu khác
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Họ và tên */}
                    <div>
                      <label className="block text-xs font-semibold text-text-main">
                        Họ và tên <span className="text-status-error">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Nguyễn Văn A"
                        required
                        className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-semibold text-text-main">
                        Địa chỉ Email <span className="text-status-error">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@example.com"
                        required
                        className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Số điện thoại */}
                    <div>
                      <label className="block text-xs font-semibold text-text-main">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="0912 345 678"
                        className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm"
                      />
                    </div>

                    {/* Vai trò */}
                    <div>
                      <label className="block text-xs font-semibold text-text-main">
                        Bạn là ai?
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm"
                      >
                        <option value="candidate">Ứng viên tìm việc</option>
                        <option value="recruiter">Nhà tuyển dụng / Doanh nghiệp</option>
                        <option value="partner">Đối tác hợp tác</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Tiêu đề */}
                  <div>
                    <label className="block text-xs font-semibold text-text-main">
                      Tiêu đề yêu cầu
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Cần hỗ trợ đăng tin tuyển dụng / lỗi ứng tuyển..."
                      className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm"
                    />
                  </div>

                  {/* Nội dung tin nhắn */}
                  <div>
                    <label className="block text-xs font-semibold text-text-main">
                      Nội dung tin nhắn <span className="text-status-error">*</span>
                    </label>
                    <textarea
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Mô tả chi tiết vấn đề hoặc nhu cầu hợp tác của bạn..."
                      required
                      className="mt-1.5 w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-xs text-text-main placeholder:text-text-muted/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm"
                    />
                  </div>

                  {/* Nút gửi */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      isLoading={isSubmitting}
                      icon={Send}
                      iconPosition="right"
                      className="w-full justify-center py-2.5! text-xs! font-semibold! sm:w-auto sm:px-6! sm:text-sm!"
                    >
                      Gửi tin nhắn liên hệ
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;

