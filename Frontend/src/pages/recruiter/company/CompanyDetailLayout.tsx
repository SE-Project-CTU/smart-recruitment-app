import { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  NavLink,
  Outlet,
} from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Users,
  Settings,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import { companyService } from "@/services/companyService";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import type { CompanyItem } from "@/types/company";
import { PATHS } from "@/constants/paths";

export interface CompanyOutletContext {
  company: CompanyItem;
  setCompany: React.Dispatch<React.SetStateAction<CompanyItem | null>>;
  refreshCompany: () => Promise<void>;
  isOwner: boolean;
}

export function CompanyDetailLayout() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const [company, setCompany] = useState<CompanyItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await companyService.getCompanyDetail(companyId);
      setCompany(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải thông tin doanh nghiệp",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [companyId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-36 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-44 animate-pulse rounded-3xl border border-border bg-surface/50" />
        <div className="h-10 w-80 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-96 animate-pulse rounded-3xl border border-border bg-surface/50" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-surface py-20 text-center">
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertCircle className="size-7" />
        </div>
        <h2 className="text-lg font-bold text-text-main">
          {error || "Doanh nghiệp không tồn tại"}
        </h2>
        <p className="mt-1.5 text-xs text-text-muted">
          Vui lòng kiểm tra lại đường dẫn hoặc quay về danh sách công ty.
        </p>
        <button
          onClick={() => navigate(PATHS.RECRUITER.COMPANY_MANAGEMENT)}
          type="button"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-primary-hover"
        >
          <ArrowLeft className="size-4" />
          Về danh sách công ty
        </button>
      </div>
    );
  }

  const isOwner = company.membership?.role === "Owner";
  const status = company.verificationStatus;

  return (
    <div className="space-y-6">
      {/* 1. Nút Back ra danh sách công ty */}
      <div>
        <button
          onClick={() => navigate(PATHS.RECRUITER.COMPANY_MANAGEMENT)}
          type="button"
          className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted transition-colors hover:text-text-main"
        >
          <ArrowLeft className="size-4" />
          <span>Danh sách công ty</span>
        </button>
      </div>

      {/* 2. Banner Header Công ty: Logo, Tên, MST, Status & Role */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 sm:items-center">
            <div className="shrink-0 rounded-2xl border border-border p-1 bg-white shadow-2xs">
              <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="lg" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-lg font-bold text-text-main sm:text-2xl truncate">
                  {company.name}
                </h1>

                {/* Status Badge */}
                {status === "Verified" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="size-3.5" />
                    Đã duyệt
                  </span>
                )}
                {status === "Pending" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                    <Clock className="size-3.5" />
                    Chờ duyệt
                  </span>
                )}
                {status === "Rejected" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                    <AlertCircle className="size-3.5" />
                    Từ chối
                  </span>
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted">
                <span>MST: <strong className="font-semibold text-text-main">{company.taxCode}</strong></span>
                <span>•</span>
                <span>{company.address}</span>
                {company.website && (
                  <>
                    <span>•</span>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <span>{company.website.replace(/^https?:\/\//, "")}</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* User's Role in this Company */}
          <div className="flex shrink-0 items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-2xl border px-3.5 py-2 text-xs font-semibold ${
                isOwner
                  ? "border-purple-200 bg-purple-50/80 text-purple-700"
                  : "border-sky-200 bg-sky-50/80 text-sky-700"
              }`}
            >
              {isOwner ? (
                <ShieldCheck className="size-4 text-purple-600" />
              ) : (
                <UserCheck className="size-4 text-sky-600" />
              )}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">
                  Vai trò của bạn
                </p>
                <p className="text-xs font-bold leading-tight">
                  {isOwner ? "Chủ sở hữu (Owner)" : "Thành viên (HR)"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Thanh Navigation Tabs */}
      <div className="flex border-b border-border">
        <nav className="flex space-x-1 sm:space-x-3" aria-label="Tabs">
          <NavLink
            to="overview"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:border-slate-300 hover:text-text-main"
              }`
            }
          >
            <Building2 className="size-4" />
            <span>Tổng quan</span>
          </NavLink>

          <NavLink
            to="members"
            className={({ isActive }) =>
              `inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:border-slate-300 hover:text-text-main"
              }`
            }
          >
            <Users className="size-4" />
            <span>Thành viên</span>
          </NavLink>

          {/* CHỈ HIỂN THỊ TAB CẬP NHẬT NẾU LÀ OWNER */}
          {isOwner && (
            <NavLink
              to="settings"
              className={({ isActive }) =>
                `inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-text-muted hover:border-slate-300 hover:text-text-main"
                }`
              }
            >
              <Settings className="size-4" />
              <span>Cập nhật thông tin</span>
            </NavLink>
          )}
        </nav>
      </div>

      {/* 4. Sub-page Content (Outlet) */}
      <div>
        <Outlet
          context={{
            company,
            setCompany,
            refreshCompany: fetchDetail,
            isOwner,
          }}
        />
      </div>
    </div>
  );
}
