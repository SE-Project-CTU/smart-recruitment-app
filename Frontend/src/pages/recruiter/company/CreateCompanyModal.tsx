import { useState } from "react";
import { Building2, X, Plus } from "lucide-react";
import Button from "@/components/Button";
import { companyService } from "@/services/companyService";
import type { CompanyItem, CreateCompanyPayload } from "@/types/company";

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCompany: CompanyItem) => void;
}

export function CreateCompanyModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCompanyModalProps) {
  const [formData, setFormData] = useState<CreateCompanyPayload>({
    name: "",
    taxCode: "",
    email: "",
    phone: "",
    address: "",
    website: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name.trim() ||
      !formData.taxCode.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim()
    ) {
      setError("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const created = await companyService.createCompany(formData);
      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi tạo doanh nghiệp. Vui lòng thử lại.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-xl sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="size-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-main">
                Tạo hồ sơ Doanh nghiệp mới
              </h2>
              <p className="text-xs text-text-muted">
                Bạn sẽ tự động trở thành Chủ sở hữu (Owner) của doanh nghiệp này
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-text-muted hover:bg-slate-100 hover:text-text-main transition-colors"
          >
            <X className="size-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Tên doanh nghiệp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Công ty Cổ phần Công nghệ SmartHire"
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Mã số thuế (MST) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="taxCode"
                value={formData.taxCode}
                onChange={handleChange}
                placeholder="Ví dụ: 0102030405"
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Email liên hệ <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@company.com"
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+84 28 1234 5678"
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Website chính thức
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://company.com"
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Địa chỉ trụ sở chính <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Giới thiệu về doanh nghiệp
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả ngắn về sứ mệnh, lĩnh vực hoạt động, văn hóa công ty..."
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none resize-none"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Plus}
              isLoading={isLoading}
            >
              Tạo doanh nghiệp
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
