import { useState, useEffect } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import {
  Save,
  Lock,
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Button from "@/components/Button";
import { companyService } from "@/services/companyService";
import type { CompanyOutletContext } from "./CompanyDetailLayout";
import type { UpdateCompanyPayload } from "@/types/company";

export function CompanySettingsTab() {
  const { company, isOwner, setCompany, refreshCompany } =
    useOutletContext<CompanyOutletContext>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UpdateCompanyPayload>({
    name: company.name,
    email: company.email,
    phone: company.phone,
    address: company.address,
    website: company.website,
    description: company.description,
  });

  const [isLoading, setIsLoading] = useState(false);
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
    });
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
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover"
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.email?.trim() || !formData.phone?.trim()) {
      setErrorMsg("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }

    try {
      setIsLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const updated = await companyService.updateCompany(company.id, formData);
      setCompany(updated);
      await refreshCompany();
      setSuccessMsg("Cập nhật thông tin doanh nghiệp thành công!");
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : "Có lỗi xảy ra khi lưu thông tin. Vui lòng thử lại.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-bold text-text-main sm:text-lg">
          Cập nhật thông tin doanh nghiệp
        </h2>
        <p className="text-xs text-text-muted">
          Chỉnh sửa thông tin liên hệ, hồ sơ giới thiệu công ty (dành riêng cho Chủ sở hữu)
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs font-medium text-emerald-800 shadow-2xs">
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-4 text-xs font-medium text-rose-800 shadow-2xs">
          <AlertCircle className="size-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-3xl border border-border bg-surface p-6 shadow-2xs space-y-5">
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

        <div className="rounded-3xl border border-border bg-surface p-6 shadow-2xs space-y-5">
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
            isLoading={isLoading}
            className="px-6"
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </div>
  );
}
