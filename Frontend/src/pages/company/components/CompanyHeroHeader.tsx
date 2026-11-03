import { useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Globe,
  ShieldCheck,
  Building2,
  ExternalLink,
  UserPlus,
  ArrowUpRight,
  Clock,
  Sparkles,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import Button from "@/components/common/Button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import { useAuthStore } from "@/stores/authStore";
import { PATHS } from "@/constants/paths";
import type { CompanyItem } from "@/types/company";

export interface CompanyHeroHeaderProps {
  company: CompanyItem;
  isFollowing: boolean;
  isFollowingLoading?: boolean;
  isPendingJoinRequest?: boolean;
  onToggleFollow: () => void;
  onOpenJoinModal: () => void;
  onOpenAuthPrompt: (actionText: string) => void;
}

export function CompanyHeroHeader({
  company,
  isFollowing,
  isFollowingLoading = false,
  isPendingJoinRequest = false,
  onToggleFollow,
  onOpenJoinModal,
  onOpenAuthPrompt,
}: CompanyHeroHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = Boolean(user);

  const isCandidate =
    user?.roles?.some((r) => r.toLowerCase() === "candidate") ?? false;
  const isRecruiter =
    user?.roles?.some(
      (r) => r.toLowerCase() === "recruiter" || r.toLowerCase() === "hr",
    ) ?? false;

  const isVerified = company.verificationStatus === "Verified";

  // Kiểm tra nếu recruiter này đã là thành viên chính thức
  const isCompanyMember =
    isRecruiter && company.membership?.status === "Active";

  const [isHoveredFollow, setIsHoveredFollow] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-surface shadow-xs">
      {/* 1. Cover Banner với gradient thương hiệu */}
      <div className="relative h-44 w-full bg-gradient-to-r from-slate-900 via-primary/85 to-primary sm:h-56">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-10" />
        <div className="absolute right-6 bottom-4 hidden items-center gap-1.5 rounded-full bg-black/25 px-3 py-1 text-xs font-medium text-white/90 backdrop-blur-md sm:flex">
          <Sparkles className="size-3.5 text-amber-300" />
          <span>Hồ sơ doanh nghiệp tuyển dụng</span>
        </div>
      </div>

      {/* 2. Main Profile Info */}
      <div className="relative px-5 pt-0 pb-6 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          {/* Logo & Identity */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="-mt-14 shrink-0 rounded-2xl border-4 border-surface bg-surface p-1 shadow-md sm:-mt-16">
              <CompanyLogo
                logoUrl={company.logoUrl}
                name={company.name}
                size="lg"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-bold tracking-tight text-text-main sm:text-2xl">
                  {company.name}
                </h1>

                {isVerified && (
                  <Tooltip>
                    <TooltipTrigger className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                      <ShieldCheck className="size-3.5 shrink-0" />
                      <span>Đã xác minh</span>
                    </TooltipTrigger>
                    <TooltipPanel>
                      Doanh nghiệp đã được SmartHire xác thực giấy phép & mã số
                      thuế
                    </TooltipPanel>
                  </Tooltip>
                )}
              </div>

              {/* Quick metadata chips */}
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
                {company.address && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="size-3.5 shrink-0 text-text-muted/70" />
                    <span className="truncate max-w-xs">{company.address}</span>
                  </div>
                )}

                {company.taxCode && (
                  <div className="flex items-center gap-1.5">
                    <Building2 className="size-3.5 shrink-0 text-text-muted/70" />
                    <span>MST: {company.taxCode}</span>
                  </div>
                )}

                {company.website && (
                  <a
                    href={
                      company.website.startsWith("http")
                        ? company.website
                        : `https://${company.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="size-3.5 shrink-0" />
                    <span className="truncate max-w-40">
                      {company.website.replace(/^https?:\/\//, "")}
                    </span>
                    <ExternalLink className="size-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Contextual Action Button Group */}
          <div className="flex items-center gap-2.5 self-start sm:self-end">
            {/* Case 1: Candidate đã đăng nhập */}
            {isCandidate && (
              <Button
                variant={isFollowing ? "outline" : "primary"}
                onClick={onToggleFollow}
                disabled={isFollowingLoading}
                onMouseEnter={() => setIsHoveredFollow(true)}
                onMouseLeave={() => setIsHoveredFollow(false)}
                className="text-xs px-4 py-2 flex items-center gap-2 transition-all"
              >
                {isFollowing ? (
                  <BookmarkCheck className="size-4 text-primary" />
                ) : (
                  <Bookmark className="size-4" />
                )}
                <span>
                  {isFollowing
                    ? isHoveredFollow
                      ? "Bỏ theo dõi"
                      : "Đang theo dõi"
                    : "Theo dõi công ty"}
                </span>
              </Button>
            )}

            {/* Case 2: Recruiter là thành viên công ty này */}
            {isCompanyMember && (
              <Link
                to={PATHS.RECRUITER.COMPANAY_MANAGEMENT_OVERVIEW.replace(
                  ":companyId",
                  company.id,
                )}
              >
                <Button
                  variant="outline"
                  className="text-xs px-4 py-2 flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                >
                  <ArrowUpRight className="size-4" />
                  <span>Quản lý công ty</span>
                </Button>
              </Link>
            )}

            {/* Case 3: Recruiter ngoài (chưa thuộc công ty) */}
            {isRecruiter && !isCompanyMember && (
              <>
                {isPendingJoinRequest ? (
                  <Button
                    variant="outline"
                    disabled
                    className="text-xs px-4 py-2 flex items-center gap-1.5 bg-slate-50 text-slate-500 border-slate-200 cursor-not-allowed"
                  >
                    <Clock className="size-4" />
                    <span>Yêu cầu đang chờ duyệt</span>
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={onOpenJoinModal}
                    className="text-xs px-4 py-2 flex items-center gap-1.5"
                  >
                    <UserPlus className="size-4" />
                    <span>Yêu cầu gia nhập</span>
                  </Button>
                )}
              </>
            )}

            {/* Case 4: Khách chưa đăng nhập */}
            {!isAuthenticated && (
              <>
                <Button
                  variant="primary"
                  onClick={() => onOpenAuthPrompt("theo dõi doanh nghiệp")}
                  className="text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  <Bookmark className="size-4" />
                  <span>Theo dõi công ty</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => onOpenAuthPrompt("gửi yêu cầu gia nhập")}
                  className="hidden text-xs px-4 py-2 items-center gap-1.5 sm:flex"
                >
                  <UserPlus className="size-4" />
                  <span>Gia nhập đội ngũ</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompanyHeroHeader;
