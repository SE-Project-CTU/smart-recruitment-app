import { useState, useRef } from "react";
import { Building2, X, Plus, Upload, Trash2, Loader2 } from "lucide-react";
import Button from "@/components/Button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { getApiErrorMessage } from "@/api/errorHandler";
import { useCreateCompany } from "@/hooks/queries/useCompany";
import { useUploadImage } from "@/hooks/queries/useMedia";
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

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createCompany, isPending } = useCreateCompany();
  const { mutateAsync: uploadImage, isPending: isUploadingLogo } = useUploadImage();

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleLogoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const media = await uploadImage(file);
      setLogoPreview(media.fileUrl);
      setFormData((prev) => ({
        ...prev,
        logoUrl: media.fileUrl,
        logoFileId: media.id,
      }));
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          "Tải ảnh logo thất bại. Vui lòng kiểm tra định dạng và kích thước ảnh.",
        ),
      );
    } finally {
      e.target.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData((prev) => ({
      ...prev,
      logoUrl: undefined,
      logoFileId: undefined,
    }));
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
      setError(null);
      const created = await createCompany(formData);
      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      setError(
        getApiErrorMessage(
          err,
          "Có lỗi xảy ra khi tạo doanh nghiệp. Vui lòng thử lại.",
        ),
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
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
          {/* Logo Upload Section */}
          <div className="rounded-xl border border-border bg-bg/50 p-3.5">
            <label className="block text-xs font-semibold text-text-main mb-2">
              Logo doanh nghiệp (Không bắt buộc)
            </label>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0 overflow-hidden rounded-xl border border-border bg-white p-1">
                <CompanyLogo
                  logoUrl={logoPreview}
                  name={formData.name || "Company"}
                  size="md"
                />
                {isUploadingLogo && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 text-white backdrop-blur-xs">
                    <Loader2 className="size-5 animate-spin" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoFileChange}
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  icon={isUploadingLogo ? Loader2 : Upload}
                  disabled={isUploadingLogo}
                  onClick={() => fileInputRef.current?.click()}
                  className="py-1.5 px-3 text-xs"
                >
                  {isUploadingLogo
                    ? "Đang tải ảnh..."
                    : logoPreview
                    ? "Đổi logo"
                    : "Tải logo"}
                </Button>

                {logoPreview && (
                  <Button
                    type="button"
                    variant="secondary"
                    icon={Trash2}
                    disabled={isUploadingLogo}
                    onClick={handleRemoveLogo}
                    className="py-1.5 px-3 text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                  >
                    Gỡ
                  </Button>
                )}
                <span className="text-[11px] text-text-muted">
                  JPG, PNG, WEBP &lt; 5MB
                </span>
              </div>
            </div>
          </div>

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
            <Button variant="secondary" onClick={onClose} disabled={isPending || isUploadingLogo}>
              Hủy
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Plus}
              isLoading={isPending || isUploadingLogo}
            >
              Tạo doanh nghiệp
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
