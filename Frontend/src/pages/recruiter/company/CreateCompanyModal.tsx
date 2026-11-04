import { useState, useRef } from "react";
import {
  Building2,
  X,
  Plus,
  Upload,
  Trash2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/common/Button";
import { toast } from "@/components/ui/toast";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { getApiErrorMessage, getApiFieldErrors } from "@/api/errorHandler";
import { useCreateCompany } from "@/hooks/queries/useCompany";
import { useUploadImage } from "@/hooks/queries/useMedia";
import type { CompanyItem, CreateCompanyPayload } from "@/types";
import { cn } from "@/lib/utils";

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCompany: CompanyItem) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  const [logoError, setLogoError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: createCompany, isPending } = useCreateCompany();
  const { mutateAsync: uploadImage, isPending: isUploadingLogo } =
    useUploadImage();

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleLogoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLogoError(null);
      const media = await uploadImage(file);
      setLogoPreview(media.fileUrl);
      setFormData((prev) => ({
        ...prev,
        logoUrl: media.fileUrl,
        logoFileId: media.id,
      }));
    } catch (err: unknown) {
      const msg = getApiErrorMessage(
        err,
        "Tải ảnh logo thất bại. Vui lòng kiểm tra định dạng và kích thước ảnh (< 5MB).",
      );
      setLogoError(msg);
      toast.add({
        type: "destructive",
        title: "Tải logo thất bại",
        description: msg,
      });
    } finally {
      e.target.value = "";
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoError(null);
    setFormData((prev) => ({
      ...prev,
      logoUrl: undefined,
      logoFileId: undefined,
    }));
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    const name = formData.name.trim();
    if (!name) {
      errors.name = "Vui lòng nhập tên doanh nghiệp.";
    } else if (name.length < 2) {
      errors.name = "Tên doanh nghiệp phải có ít nhất 2 ký tự.";
    } else if (name.length > 200) {
      errors.name = "Tên doanh nghiệp không được vượt quá 200 ký tự.";
    }

    const taxCode = formData.taxCode.trim();
    if (!taxCode) {
      errors.taxCode = "Vui lòng nhập mã số thuế.";
    } else if (taxCode.length > 20) {
      errors.taxCode = "Mã số thuế không được vượt quá 20 ký tự.";
    }

    const email = formData.email.trim();
    if (!email) {
      errors.email = "Vui lòng nhập email liên hệ.";
    } else if (!EMAIL_REGEX.test(email)) {
      errors.email = "Email không đúng định dạng (vd: contact@company.com).";
    }

    const phone = formData.phone.trim();
    if (!phone) {
      errors.phone = "Vui lòng nhập số điện thoại.";
    } else if (phone.length < 7 || phone.length > 30) {
      errors.phone = "Số điện thoại phải từ 7 đến 30 ký tự.";
    }

    const address = formData.address.trim();
    if (!address) {
      errors.address = "Vui lòng nhập địa chỉ trụ sở chính.";
    } else if (address.length < 5) {
      errors.address = "Địa chỉ phải có ít nhất 5 ký tự.";
    }

    const website = formData.website?.trim();
    if (website) {
      try {
        new URL(website);
      } catch {
        errors.website =
          "Website phải là URL hợp lệ (vd: https://company.com).";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    try {
      setFieldErrors({});
      const created = await createCompany(formData);
      toast.add({
        type: "success",
        title: "Tạo công ty thành công",
        description: `Doanh nghiệp "${created.name}" đã được khởi tạo thành công.`,
      });
      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      const apiErrors = getApiFieldErrors(err);
      if (Object.keys(apiErrors).length > 0) {
        setFieldErrors(apiErrors);
      } else {
        const msg = getApiErrorMessage(
          err,
          "Có lỗi xảy ra khi tạo doanh nghiệp. Vui lòng thử lại.",
        );
        toast.add({
          type: "destructive",
          title: "Tạo doanh nghiệp thất bại",
          description: msg,
        });
      }
    }
  };

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs duration-200">
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 sm:p-7">
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
                Thành viên đầu tiên sẽ tham gia với tư cách Chủ sở hữu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-slate-100 hover:text-text-main"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-2">
          {/* Logo Upload Section */}
          <div className="rounded-xl border border-border bg-bg/50 p-3.5">
            <label className="mb-2 block text-xs font-semibold text-text-main">
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
                  variant="secondary"
                  icon={isUploadingLogo ? Loader2 : Upload}
                  disabled={isUploadingLogo}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3! py-1.5! text-xs!"
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
                    className="border-rose-200! px-3! py-1.5! text-xs! text-rose-600! ring-rose-200! hover:bg-rose-50! hover:text-rose-700!"
                  >
                    Gỡ
                  </Button>
                )}
                <span className="text-[11px] text-text-muted">
                  JPG, PNG, WEBP &lt; 5MB
                </span>
              </div>
            </div>
            {/* Chừa khoảng trống báo lỗi logo nếu có */}
            {logoError && (
              <div className="animate-in fade-in mt-2 flex items-center gap-1 text-[11px] text-status-error duration-150">
                <AlertCircle className="size-3.5 shrink-0" />
                <span>{logoError}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
            {/* Tên doanh nghiệp */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-text-main">
                Tên doanh nghiệp <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Công ty Cổ phần Công nghệ SmartHire"
                className={cn(
                  "w-full rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-text-main transition-colors outline-none placeholder:text-text-muted focus:ring-1",
                  fieldErrors.name
                    ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
                    : "border-border focus:border-primary focus:ring-primary/20",
                )}
              />
              <div className="mt-1 min-h-5 text-[11px] leading-tight text-status-error">
                {fieldErrors.name && (
                  <span className="animate-in fade-in flex items-center gap-1 duration-150">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{fieldErrors.name}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Mã số thuế */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-main">
                Mã số thuế (MST) <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                name="taxCode"
                value={formData.taxCode}
                onChange={handleChange}
                placeholder="Ví dụ: 0102030405"
                className={cn(
                  "w-full rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-text-main transition-colors outline-none placeholder:text-text-muted focus:ring-1",
                  fieldErrors.taxCode
                    ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
                    : "border-border focus:border-primary focus:ring-primary/20",
                )}
              />
              <div className="mt-1 min-h-5 text-[11px] leading-tight text-status-error">
                {fieldErrors.taxCode && (
                  <span className="animate-in fade-in flex items-center gap-1 duration-150">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{fieldErrors.taxCode}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Email liên hệ */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-main">
                Email liên hệ <span className="text-status-error">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@company.com"
                className={cn(
                  "w-full rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-text-main transition-colors outline-none placeholder:text-text-muted focus:ring-1",
                  fieldErrors.email
                    ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
                    : "border-border focus:border-primary focus:ring-primary/20",
                )}
              />
              <div className="mt-1 min-h-5 text-[11px] leading-tight text-status-error">
                {fieldErrors.email && (
                  <span className="animate-in fade-in flex items-center gap-1 duration-150">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Số điện thoại */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-main">
                Số điện thoại <span className="text-status-error">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+84 28 1234 5678"
                className={cn(
                  "w-full rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-text-main transition-colors outline-none placeholder:text-text-muted focus:ring-1",
                  fieldErrors.phone
                    ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
                    : "border-border focus:border-primary focus:ring-primary/20",
                )}
              />
              <div className="mt-1 min-h-5 text-[11px] leading-tight text-status-error">
                {fieldErrors.phone && (
                  <span className="animate-in fade-in flex items-center gap-1 duration-150">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Website chính thức */}
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-text-main">
                Website chính thức
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://company.com"
                className={cn(
                  "w-full rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-text-main transition-colors outline-none placeholder:text-text-muted focus:ring-1",
                  fieldErrors.website
                    ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
                    : "border-border focus:border-primary focus:ring-primary/20",
                )}
              />
              <div className="mt-1 min-h-5 text-[11px] leading-tight text-status-error">
                {fieldErrors.website && (
                  <span className="animate-in fade-in flex items-center gap-1 duration-150">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{fieldErrors.website}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Địa chỉ trụ sở chính */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-text-main">
                Địa chỉ trụ sở chính{" "}
                <span className="text-status-error">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Số nhà, tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP"
                className={cn(
                  "w-full rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-text-main transition-colors outline-none placeholder:text-text-muted focus:ring-1",
                  fieldErrors.address
                    ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
                    : "border-border focus:border-primary focus:ring-primary/20",
                )}
              />
              <div className="mt-1 min-h-5 text-[11px] leading-tight text-status-error">
                {fieldErrors.address && (
                  <span className="animate-in fade-in flex items-center gap-1 duration-150">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{fieldErrors.address}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Giới thiệu về doanh nghiệp */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-semibold text-text-main">
                Giới thiệu về doanh nghiệp
              </label>
              <textarea
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả ngắn về sứ mệnh, lĩnh vực hoạt động, văn hóa công ty..."
                className={cn(
                  "w-full resize-none rounded-xl border bg-bg px-3.5 py-2.5 text-sm text-text-main transition-colors outline-none placeholder:text-text-muted focus:ring-1",
                  fieldErrors.description
                    ? "border-rose-400 focus:border-status-error focus:ring-status-error/20"
                    : "border-border focus:border-primary focus:ring-primary/20",
                )}
              />
              <div className="mt-1 min-h-5 text-[11px] leading-tight text-status-error">
                {fieldErrors.description && (
                  <span className="animate-in fade-in flex items-center gap-1 duration-150">
                    <AlertCircle className="size-3 shrink-0" />
                    <span>{fieldErrors.description}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isPending || isUploadingLogo}
            >
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
