import { useState, useEffect, useRef } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Save,
  Lock,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Upload,
  Trash2,
  Loader2,
} from "lucide-react";
import Button from "@/components/Button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { getApiErrorMessage } from "@/api/errorHandler";
import { useUpdateCompany } from "@/hooks/queries/useCompany";
import { useUploadImage } from "@/hooks/queries/useMedia";
import type { CompanyOutletContext } from "./CompanyDetailLayout";
import type { UpdateCompanyPayload } from "@/types/company";

export function CompanySettingsTab() {
  const { company, isOwner, refreshCompany } =
    useOutletContext<CompanyOutletContext>();
  const navigate = useNavigate();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: updateCompany, isPending: isLoading } = useUpdateCompany();
  const { mutateAsync: uploadImage, isPending: isUploadingLogo } = useUploadImage();

  const [logoPreview, setLogoPreview] = useState<string | null>(
    company.logoUrl ?? null,
  );

  const [formData, setFormData] = useState<UpdateCompanyPayload>({
    name: company.name,
    email: company.email,
    phone: company.phone,
    address: company.address,
    website: company.website,
    description: company.description,
    logoUrl: company.logoUrl,
    logoFileId: company.logoFileId,
  });

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      name: company.name,
      email: company.email,
      phone: company.phone,
      address: company.address,
      website: company.website,
      description: company.description,
      logoUrl: company.logoUrl,
      logoFileId: company.logoFileId,
    });
    setLogoPreview(company.logoUrl ?? null);
  }, [company]);

  // Role Guard: Nếu không phải Owner, từ chối quyền truy cập
  if (!isOwner) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-surface p-8 text-center sm:py-16">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
          <ShieldAlert className="size-7" />
        </div>
        <h2 className="text-base font-bold text-text-main sm:text-lg">
          Quyền truy cập bị giới hạn
        </h2>
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-text-muted">
          Chỉ <strong>Chủ sở hữu (Owner)</strong> của doanh nghiệp mới có quyền chỉnh sửa thông tin công ty. Bạn hiện đang là Thành viên (HR) thông thường.
        </p>
        <button
          onClick={() => navigate("../overview")}
          type="button"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white hover:bg-primary-hover"
        >
          <ArrowLeft className="size-4" />
          Về trang Tổng quan
        </button>
      </div>
    );
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSuccessMsg(null);
    setErrorMsg(null);
  };

  const handleLogoFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      const media = await uploadImage(file);
      setLogoPreview(media.fileUrl);
      setFormData((prev) => ({
        ...prev,
        logoUrl: media.fileUrl,
        logoFileId: media.id,
      }));
      setSuccessMsg("Đã tải logo lên thành công! Nhấn 'Lưu thay đổi' để hoàn tất cập nhật.");
    } catch (err: unknown) {
      setErrorMsg(
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
      logoUrl: null,
      logoFileId: null,
    }));
    setSuccessMsg("Đã gỡ logo. Nhấn 'Lưu thay đổi' để hoàn tất cập nhật.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.phone?.trim()) {
      setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    try {
      setErrorMsg(null);
      setSuccessMsg(null);
      await updateCompany({ id: company.id, payload: formData });
      await refreshCompany();
      setSuccessMsg("Cập nhật thông tin doanh nghiệp thành công!");
    } catch (err: unknown) {
      setErrorMsg(
        getApiErrorMessage(
          err,
          "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.",
        ),
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold text-text-main sm:text-lg">
          Cập nhật thông tin doanh nghiệp
        </h2>
        <p className="text-xs text-text-muted">
          Chỉnh sửa nhận diện thương hiệu, thông tin liên hệ và hồ sơ giới thiệu công ty (dành riêng cho Chủ sở hữu)
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-800">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800">
          <AlertCircle className="size-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Logo & Nhận diện thương hiệu */}
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Logo & Nhận diện thương hiệu
          </h3>

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative group shrink-0">
              <div className="overflow-hidden rounded-2xl border border-border bg-white p-1">
                <CompanyLogo
                  logoUrl={logoPreview}
                  name={formData.name || company.name}
                  size="lg"
                />
              </div>
              {isUploadingLogo && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-white backdrop-blur-xs">
                  <Loader2 className="size-6 animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div>
                <p className="text-sm font-semibold text-text-main">
                  Logo chính thức của doanh nghiệp
                </p>
                <p className="text-xs text-text-muted leading-relaxed">
                  Logo sẽ hiển thị trên trang tin tuyển dụng công khai, danh thiếp công ty và thông báo gửi đến ứng viên. Định dạng hỗ trợ: JPG, PNG, WEBP (tối đa 5 MB).
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
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
                    ? "Đang tải ảnh lên..."
                    : logoPreview
                    ? "Thay đổi logo"
                    : "Tải logo lên"}
                </Button>

                {logoPreview && (
                  <Button
                    type="button"
                    variant="secondary"
                    icon={Trash2}
                    disabled={isUploadingLogo}
                    onClick={handleRemoveLogo}
                    className="py-1.5 px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
                  >
                    Gỡ logo
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Thông tin định danh pháp lý */}
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Thông tin định danh pháp lý
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Tên doanh nghiệp <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            {/* MST là Read-only / Locked */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-text-main">
                  Mã số thuế (MST)
                </label>
                <span className="flex items-center gap-1 text-[11px] text-text-muted font-medium">
                  <Lock className="size-3" />
                  Cố định theo giấy phép
                </span>
              </div>
              <input
                type="text"
                value={company.taxCode}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-border bg-slate-100/70 px-3.5 py-2.5 text-sm text-text-muted font-mono"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Thông tin liên hệ & Địa điểm */}
        <div className="rounded-3xl border border-border bg-surface p-6 space-y-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
            Thông tin liên hệ & Địa điểm
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Email nhận thông báo tuyển dụng <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Số điện thoại hotline <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Website công ty
              </label>
              <input
                type="url"
                name="website"
                value={formData.website || ""}
                onChange={handleChange}
                placeholder="https://example.com"
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Địa chỉ trụ sở chính <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address || ""}
                onChange={handleChange}
                className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-text-main mb-1.5">
                Mô tả giới thiệu doanh nghiệp
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description || ""}
                onChange={handleChange}
                placeholder="Mô tả về doanh nghiệp, môi trường làm việc..."
                className="w-full resize-none rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-text-main outline-none focus:border-primary focus:ring-1 focus:ring-primary/20"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="submit"
            variant="primary"
            icon={Save}
            isLoading={isLoading || isUploadingLogo}
            className="px-6"
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
}
