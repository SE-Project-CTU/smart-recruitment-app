import { useState, useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  Building2,
  Briefcase,
  Info,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import {
  CompanyHeroHeader,
  CompanyOverviewTab,
  CompanyActiveJobsTab,
  CompanySidebarInfo,
  JoinCompanyRequestModal,
  AuthPromptModal,
} from "./components";
import {
  useCompanyDetail,
  useMyFollowedCompanies,
  useFollowCompany,
  useUnfollowCompany,
} from "@/hooks/queries/useCompany";
import { useCompanyActivePublicJobs } from "@/hooks/queries/useJob";
import { useAuthStore } from "@/stores/authStore";
import { PATHS } from "@/constants/paths";
import Button from "@/components/common/Button";

type CompanyTabKey = "overview" | "jobs";

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Quản lý Tab hiển thị ("overview" | "jobs")
  const currentTab = (searchParams.get("tab") as CompanyTabKey) || "overview";
  const setTab = (tab: CompanyTabKey) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === "overview") {
        next.delete("tab");
      } else {
        next.set("tab", tab);
      }
      return next;
    });
  };

  // 2. Auth Context
  const user = useAuthStore((state) => state.user);
  const isCandidate =
    user?.roles?.some((r) => r.toLowerCase() === "candidate") ?? false;

  // 3. Query dữ liệu chi tiết công ty (API 2)
  const {
    data: company,
    isLoading: isLoadingCompany,
    isError,
  } = useCompanyDetail(id);

  // 4. Query danh sách việc làm đang mở của công ty (để lấy số lượng cho tab & sidebar)
  const { data: jobsData } = useCompanyActivePublicJobs(id, {
    page: 1,
    pageSize: 1,
  });
  const activeJobCount = jobsData?.meta?.totalItems ?? 0;

  // 5. Query & Mutation Trạng thái Theo dõi (Candidate)
  const { data: followedData } = useMyFollowedCompanies();
  const followMutation = useFollowCompany();
  const unfollowMutation = useUnfollowCompany();

  const isFollowing = useMemo(() => {
    if (!isCandidate || !id || !followedData?.items) return false;
    return followedData.items.some((c) => c.id === id);
  }, [isCandidate, id, followedData]);

  const isFollowingLoading =
    followMutation.isPending || unfollowMutation.isPending;

  const handleToggleFollow = () => {
    if (!id) return;
    if (isFollowing) {
      unfollowMutation.mutate(id);
    } else {
      followMutation.mutate(id);
    }
  };

  // 6. Quản lý trạng thái Yêu cầu gia nhập của Recruiter ngoài
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isPendingJoinRequest, setIsPendingJoinRequest] = useState<boolean>(
    () => {
      if (!id || typeof window === "undefined") return false;
      return sessionStorage.getItem(`sr_join_pending_${id}`) === "true";
    },
  );

  const handleJoinSuccess = () => {
    if (id) {
      sessionStorage.setItem(`sr_join_pending_${id}`, "true");
      setIsPendingJoinRequest(true);
    }
  };

  // 7. Quản lý Modal nhắc đăng nhập cho khách vãng lai
  const [authPromptOpen, setAuthPromptOpen] = useState(false);
  const [authActionText, setAuthActionText] = useState("");

  const handleOpenAuthPrompt = (actionText: string) => {
    setAuthActionText(actionText);
    setAuthPromptOpen(true);
  };

  // 8. Trạng thái Loading Skeleton
  if (isLoadingCompany) {
    return (
      <div className="container mx-auto min-h-[70vh] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-xs text-text-muted">
          <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
          <ChevronRight className="size-3.5 text-slate-300" />
          <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
        </div>

        {/* Hero Banner Skeleton */}
        <div className="overflow-hidden rounded-3xl border border-border bg-surface p-6 shadow-xs">
          <div className="h-44 w-full animate-pulse rounded-2xl bg-slate-200 sm:h-56" />
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="-mt-14 size-24 animate-pulse rounded-2xl border-4 border-surface bg-slate-300 sm:size-28" />
            <div className="flex-1 space-y-2">
              <div className="h-6 w-1/3 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-slate-200" />
            </div>
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="h-10 w-48 animate-pulse rounded-xl bg-slate-200" />
            <div className="h-64 animate-pulse rounded-2xl border border-border bg-surface p-6" />
          </div>
          <div className="space-y-4 lg:col-span-4">
            <div className="h-44 animate-pulse rounded-2xl border border-border bg-surface p-6" />
            <div className="h-56 animate-pulse rounded-2xl border border-border bg-surface p-6" />
          </div>
        </div>
      </div>
    );
  }

  // 9. Trạng thái Không tìm thấy công ty (404)
  if (isError || !company) {
    return (
      <div className="container mx-auto flex min-h-[65vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-4 flex size-16 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-rose-600">
          <Building2 className="size-8" />
        </div>
        <h1 className="text-xl font-bold text-text-main">
          Không tìm thấy thông tin doanh nghiệp
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          Doanh nghiệp bạn đang tìm kiếm không tồn tại, đường dẫn có thể đã thay
          đổi hoặc hồ sơ tạm thời chưa khả dụng trên hệ thống SmartHire.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <Link to={PATHS.SEARCH_JOB}>
            <Button
              variant="primary"
              icon={ArrowLeft}
              className="px-4! py-2! text-xs!"
            >
              Khám phá việc làm khác
            </Button>
          </Link>
          <Link to={PATHS.HOME}>
            <Button variant="secondary" className="px-4! py-2! text-xs!">
              Trang chủ
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-white-blue/50 pt-30 pb-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-5 flex items-center gap-2 text-xs text-text-muted">
          <Link
            to={PATHS.HOME}
            className="transition-colors hover:text-primary"
          >
            Trang chủ
          </Link>
          <ChevronRight className="size-3 text-text-muted/60" />
          <Link
            to={PATHS.SEARCH_JOB}
            className="transition-colors hover:text-primary"
          >
            Việc làm
          </Link>
          <ChevronRight className="size-3 text-text-muted/60" />
          <span className="max-w-xs truncate font-medium text-text-main">
            {company.name}
          </span>
        </div>

        {/* 1. Hero Header Doanh Nghiệp */}
        <CompanyHeroHeader
          company={company}
          isFollowing={isFollowing}
          isFollowingLoading={isFollowingLoading}
          isPendingJoinRequest={isPendingJoinRequest}
          onToggleFollow={handleToggleFollow}
          onOpenJoinModal={() => setIsJoinModalOpen(true)}
          onOpenAuthPrompt={handleOpenAuthPrompt}
        />

        {/* 2. Thanh Điều Hướng Tabs */}
        <div className="mt-8 flex border-b border-border">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
              currentTab === "overview"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            <Info className="size-4" />
            <span>Giới thiệu chung</span>
          </button>

          <button
            type="button"
            onClick={() => setTab("jobs")}
            className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-all ${
              currentTab === "jobs"
                ? "border-primary text-primary"
                : "border-transparent text-text-muted hover:text-text-main"
            }`}
          >
            <Briefcase className="size-4" />
            <span>Vị trí tuyển dụng</span>
            {activeJobCount > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  currentTab === "jobs"
                    ? "bg-primary/10 text-primary"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {activeJobCount}
              </span>
            )}
          </button>
        </div>

        {/* 3. Bố Cục Thân Trang (2 Cột Desktop / Xếp Chồng Mobile) */}
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Cột chính (Trái - 8/12) */}
          <main className="lg:col-span-8">
            {currentTab === "overview" ? (
              <CompanyOverviewTab company={company} />
            ) : (
              <CompanyActiveJobsTab
                companyId={company.id}
                companyName={company.name}
                companyLogoUrl={company.logoUrl}
              />
            )}
          </main>

          {/* Cột phụ (Phải - 4/12 - Sticky Sidebar) */}
          <aside className="space-y-6 lg:col-span-4">
            <div className="sticky top-20">
              <CompanySidebarInfo
                company={company}
                followerCount={0}
                activeJobCount={activeJobCount}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Modal Yêu cầu Gia nhập (Dành cho Recruiter ngoài) */}
      <JoinCompanyRequestModal
        open={isJoinModalOpen}
        onOpenChange={setIsJoinModalOpen}
        company={company}
        onSuccess={handleJoinSuccess}
      />

      {/* Modal Nhắc Đăng nhập (Dành cho Khách vãng lai) */}
      <AuthPromptModal
        open={authPromptOpen}
        onOpenChange={setAuthPromptOpen}
        actionText={authActionText}
      />
    </div>
  );
}

export default CompanyDetailPage;
