import {
  Globe,
  MapPin,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react";
import { MorphIcon } from "morphicons/react";
import { BookmarkCheck, Bookmark } from "lucide";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import Button from "@/components/Button";
import { CompanyLogo } from "./CompanyLogo";
import { useAuthStore } from "@/stores/authStore";
import type { CompanyItem } from "@/types/company";

export interface CompanyCardProps {
  company: CompanyItem;
  isBookmarked?: boolean;
  onToggleBookmark?: (id: string) => void;
  onViewDetail: (company: CompanyItem) => void;
  onCreateJob?: (company: CompanyItem) => void;
  userRole?: "Owner" | "Member";
  actionText?: string;
  showBookmark?: boolean;
  showVerificationStatus?: boolean;
}

export function CompanyCard({
  company,
  isBookmarked = false,
  onToggleBookmark,
  onViewDetail,
  onCreateJob,
  userRole,
  actionText = "Xem chi tiết",
  showBookmark = true,
  showVerificationStatus,
}: CompanyCardProps) {
  const user = useAuthStore((state) => state.user);
  const isRecruiterOrAdmin = user?.roles?.some(
    (r) => r === "Recruiter" || r === "Admin",
  );
  const role = userRole || company.membership?.role;
  const status = company.verificationStatus;

  // Candidate thông thường hoặc người dùng không có quyền quản lý không thể xem thông tin xác minh công ty
  const canSeeVerification =
    showVerificationStatus ??
    Boolean(isRecruiterOrAdmin || company.membership || role);

  return (
    <div className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors duration-200 hover:border-primary/40">
      <div className="flex items-start gap-3.5">
        <CompanyLogo logoUrl={company.logoUrl} name={company.name} size="md" />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm leading-snug font-semibold text-text-main transition-colors group-hover:text-primary">
                {company.name}
              </h3>
              <p className="mt-0.5 text-xs text-text-muted">
                MST: {company.taxCode}
              </p>
            </div>

            {showBookmark && onToggleBookmark && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      onClick={() => onToggleBookmark(company.id)}
                      type="button"
                      className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:bg-secondary-light/40 hover:text-primary"
                    >
                      <MorphIcon
                        className="size-4"
                        icon={isBookmarked ? BookmarkCheck : Bookmark}
                      />
                    </button>
                  }
                />
                <TooltipPanel>{isBookmarked ? "Bỏ lưu" : "Lưu"}</TooltipPanel>
              </Tooltip>
            )}
          </div>
        </div>
      </div>

      {/* Badges: Trạng thái duyệt (chỉ cho Recruiter/Admin) & Vai trò thành viên */}
      {(canSeeVerification || role) && (
        <div className="flex flex-wrap items-center gap-2">
          {canSeeVerification && (
            <>
              {status === "Verified" && (
                <span className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                  <CheckCircle2 className="size-3" />
                  Đã xác thực
                </span>
              )}
              {status === "Pending" && (
                <span className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  <Clock className="size-3" />
                  Chờ duyệt
                </span>
              )}
              {status === "Rejected" && (
                <span className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-700">
                  <AlertCircle className="size-3" />
                  Từ chối
                </span>
              )}
            </>
          )}

          {role === "Owner" && (
            <span className="inline-flex items-center rounded-md border border-purple-200 bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700">
              Chủ sở hữu
            </span>
          )}
          {role === "Member" && (
            <span className="inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
              Thành viên
            </span>
          )}
        </div>
      )}

      <p className="line-clamp-2 text-xs leading-relaxed text-text-main">
        {company.description || "Chưa có phần giới thiệu chi tiết."}
      </p>

      <div className="flex flex-col gap-1.5 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <MapPin className="size-3.5 shrink-0" />
          <span className="truncate">{company.address}</span>
        </div>
        {company.website && (
          <div className="flex items-center gap-2">
            <Globe className="size-3.5 shrink-0" />
            <a
              href={company.website}
              target="_blank"
              rel="noreferrer"
              className="truncate text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {company.website.replace(/^https?:\/\//, "")}
            </a>
          </div>
        )}
      </div>

      <div className="mt-auto flex items-center justify-end gap-2 border-t border-border pt-3.5">
        {onCreateJob && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="secondary"
                  icon={Plus}
                  disabled={status !== "Verified"}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCreateJob(company);
                  }}
                  className="px-3! py-1.5! text-xs!"
                >
                  Tạo JD nhanh
                </Button>
              }
            />
            {status !== "Verified" && (
              <TooltipPanel>
                Doanh nghiệp cần được duyệt trước khi đăng tin tuyển dụng
                (BR-01)
              </TooltipPanel>
            )}
          </Tooltip>
        )}

        <Button
          variant="secondary"
          icon={ChevronRight}
          onClick={() => onViewDetail(company)}
          className="px-3! py-1.5! text-xs!"
        >
          {actionText}
        </Button>
      </div>
    </div>
  );
}
