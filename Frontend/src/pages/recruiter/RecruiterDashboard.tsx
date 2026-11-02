import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  FileText,
  UserCheck,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertCircle,
  Building2,
  Calendar,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Check,
  CheckCircle2,
  XCircle,
  Sparkles,
  RotateCcw,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import dayjs from "dayjs";
import Button from "@/components/common/Button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import { UserAvatar } from "@/components/common/UserAvatar";
import { CreateCompanyModal } from "./company/CreateCompanyModal";
import { useAuthStore } from "@/stores/authStore";
import { useCompanyStore } from "@/stores/companyStore";
import { useMyCompanies, useCompanyMembers } from "@/hooks/queries/useCompany";
import {
  useCompanyJobPostings,
  useRecruiterAllApplications,
} from "@/hooks/queries/useJob";
import { PATHS } from "@/constants/paths";
import { formatSalaryRange } from "@/utils/jobHelpers";
import { getTimeAgo } from "@/utils/helper";
import {
  APPLICATION_STATUS_CONFIG,
  resolveCandidateProfile,
  type RecruiterCandidateApplicationItem,
} from "@/types/application";
import type { CompanyItem, JobPostingItem } from "@/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activeCompany = useCompanyStore((s) => s.activeCompany);
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);
  const setActiveCompany = useCompanyStore((s) => s.setActiveCompany);

  // Modal tạo công ty mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Tab lọc cho Tin tuyển dụng gần đây & Ứng viên gần đây
  const [jobFilterTab, setJobFilterTab] = useState<
    "ALL" | "PUBLISHED" | "CLOSED"
  >("ALL");
  const [candidateFilterTab, setCandidateFilterTab] = useState<"ALL" | "NEW">(
    "ALL",
  );

  // Queries
  const {
    data: companiesData,
    isLoading: isLoadingCompanies,
    isError: isErrorCompanies,
    refetch: refetchCompanies,
  } = useMyCompanies();
  const companies = useMemo(() => {
    return companiesData || [];
  }, [companiesData]);

  const {
    data: jobResponse,
    isLoading: isLoadingJobs,
    isError: isErrorJobs,
    refetch: refetchJobs,
  } = useCompanyJobPostings(activeCompanyId, { page: 1, pageSize: 100 });

  const {
    data: applications,
    isLoading: isLoadingApplications,
    isError: isErrorApplications,
    refetch: refetchApplications,
  } = useRecruiterAllApplications(activeCompanyId);

  const { data: membersData, isLoading: isLoadingMembers } = useCompanyMembers(
    activeCompanyId || undefined,
  );

  const isLoadingData =
    isLoadingCompanies ||
    isLoadingJobs ||
    isLoadingApplications ||
    isLoadingMembers;

  // Tự động đồng bộ và chọn doanh nghiệp hoạt động nếu chưa có hoặc dữ liệu server thay đổi
  useEffect(() => {
    if (companies.length > 0) {
      const found = companies.find((c) => c.id === activeCompany?.id);
      if (found) {
        if (
          found.verificationStatus !== activeCompany?.verificationStatus ||
          found.name !== activeCompany?.name ||
          found.logoUrl !== activeCompany?.logoUrl
        ) {
          setActiveCompany(found);
        }
      } else {
        setActiveCompany(companies[0]);
      }
    }
  }, [companies, activeCompany, setActiveCompany]);

  // Lọc danh sách công việc & số liệu thống kê
  const allJobs: JobPostingItem[] = useMemo(() => {
    return jobResponse?.items || [];
  }, [jobResponse]);

  const activeJobs = useMemo(
    () => allJobs.filter((j) => j.status === "Published"),
    [allJobs],
  );

  const allApplications: RecruiterCandidateApplicationItem[] = useMemo(() => {
    return applications || [];
  }, [applications]);

  const newApplications = useMemo(
    () =>
      allApplications.filter(
        (a) => a.status === "Submitted" || a.status === "Received",
      ),
    [allApplications],
  );

  const inReviewApplications = useMemo(
    () =>
      allApplications.filter((a) =>
        ["Approved", "Reviewing", "Shortlisted", "Interviewing"].includes(
          a.status,
        ),
      ),
    [allApplications],
  );

  const totalMembers = membersData?.totalCount ?? 1;

  // 6 tin tuyển dụng gần đây nhất (sắp xếp giảm dần theo thời gian tạo)
  const recentJobs = useMemo(() => {
    return [...allJobs]
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 6);
  }, [allJobs]);

  // Lọc tin gần đây theo tab
  const filteredRecentJobs = useMemo(() => {
    if (jobFilterTab === "PUBLISHED") {
      return recentJobs.filter((j) => j.status === "Published");
    }
    if (jobFilterTab === "CLOSED") {
      return recentJobs.filter(
        (j) => j.status === "Closed" || j.status === "Expired",
      );
    }
    return recentJobs;
  }, [recentJobs, jobFilterTab]);

  // 6 hồ sơ ứng viên nộp gần đây nhất
  const recentApplications = useMemo(() => {
    return [...allApplications]
      .sort((a, b) => {
        const timeA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
        const timeB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 6);
  }, [allApplications]);

  // Lọc ứng viên gần đây theo tab
  const filteredRecentApplications = useMemo(() => {
    if (candidateFilterTab === "NEW") {
      return recentApplications.filter(
        (a) => a.status === "Submitted" || a.status === "Received",
      );
    }
    return recentApplications;
  }, [recentApplications, candidateFilterTab]);

  // Map số lượng ứng viên theo JobId
  const jobApplicationCountMap = useMemo(() => {
    const map = new Map<string, number>();
    allApplications.forEach((app) => {
      const jobId = app.jobId || app.job?.id;
      if (jobId) {
        map.set(jobId, (map.get(jobId) || 0) + 1);
      }
    });
    return map;
  }, [allApplications]);

  // Trạng thái công ty active
  const isVerified = activeCompany?.verificationStatus === "Verified";
  const isPending = activeCompany?.verificationStatus === "Pending";
  const isRejected = activeCompany?.verificationStatus === "Rejected";

  const handleCreateCompanySuccess = (newCompany: CompanyItem) => {
    setActiveCompany(newCompany);
    setIsCreateModalOpen(false);
  };

  // Helper tính hạn nộp hồ sơ an toàn & trực quan
  const getDeadlineMeta = (deadlineStr?: string | null) => {
    if (!deadlineStr) {
      return { text: "Không thời hạn", isUrgent: false, isExpired: false };
    }
    const d = dayjs(deadlineStr);
    if (!d.isValid()) {
      return { text: "Không xác định", isUrgent: false, isExpired: false };
    }

    const now = dayjs().startOf("day");
    const target = d.startOf("day");
    const diffDays = target.diff(now, "day");

    if (diffDays < 0) {
      return { text: "Đã hết hạn", isUrgent: false, isExpired: true };
    }
    if (diffDays === 0) {
      return { text: "Hết hạn hôm nay", isUrgent: true, isExpired: false };
    }
    if (diffDays <= 3) {
      return { text: `Còn ${diffDays} ngày`, isUrgent: true, isExpired: false };
    }
    return {
      text: `Hạn: ${d.format("DD/MM/YYYY")}`,
      isUrgent: false,
      isExpired: false,
    };
  };

  // Helper trích xuất AI Match Score an toàn
  const getAiScore = (
    app: RecruiterCandidateApplicationItem,
  ): number | null => {
    const rec = app as unknown as Record<string, unknown>;
    if (typeof rec.aiMatchScore === "number") return rec.aiMatchScore;
    if (typeof rec.matchScore === "number") return rec.matchScore;
    return null;
  };

  // Helper định dạng relative time an toàn
  const getSafeTimeAgo = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const d = dayjs(dateStr);
    if (!d.isValid()) return "—";
    return getTimeAgo(dateStr);
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* 1. Header Chào mừng & Thanh Hành động Tổng thể */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Xin chào, {user?.fullName || "Nhà tuyển dụng"}! 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Trung tâm điều hành tuyển dụng & đánh giá ứng viên thông minh
            SmartHire.
          </p>
        </div>

        {/* Nút hành động chính (Primary CTA) */}
        {activeCompany && (
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => navigate(PATHS.RECRUITER.CREATE_JOB)}
              disabled={!isVerified}
              title={
                !isVerified
                  ? "Doanh nghiệp cần được xác thực trước khi tạo tin tuyển dụng"
                  : undefined
              }
              className="h-10! rounded-full! px-5! text-xs! font-semibold!"
              aria-label="Đăng tin tuyển dụng mới"
            >
              Đăng tin tuyển dụng
            </Button>
          </div>
        )}
      </div>

      {/* Thông báo lỗi khi tải dữ liệu công ty */}
      {isErrorCompanies && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/60 p-8 text-center shadow-xs">
          <div className="flex size-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
            <AlertCircle className="size-6" />
          </div>
          <h2 className="mt-3 text-base font-semibold text-slate-900">
            Không thể tải thông tin không gian doanh nghiệp
          </h2>
          <p className="mt-1 max-w-md text-xs text-slate-600">
            Đã xảy ra lỗi khi kết nối với máy chủ. Vui lòng kiểm tra kết nối
            mạng và thử lại.
          </p>
          <Button
            variant="outline"
            icon={RotateCcw}
            onClick={() => refetchCompanies()}
            className="mt-4 h-8! px-4! text-xs! font-semibold!"
            aria-label="Thử tải lại thông tin doanh nghiệp"
          >
            Tải lại dữ liệu
          </Button>
        </div>
      )}

      {/* Trạng thái 0 công ty (Onboarding) - chỉ hiển thị khi đã nạp xong và không có công ty nào */}
      {!isLoadingCompanies && !isErrorCompanies && companies.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Chưa có không gian làm việc doanh nghiệp
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Tạo hồ sơ doanh nghiệp mới hoặc tham gia doanh nghiệp để bắt đầu
            đăng tin tuyển dụng và quản lý hồ sơ ứng viên.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="primary"
              icon={Plus}
              onClick={() => setIsCreateModalOpen(true)}
              className="rounded-full! font-semibold!"
              aria-label="Tạo hồ sơ doanh nghiệp mới"
            >
              Tạo hồ sơ doanh nghiệp
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate(PATHS.RECRUITER.COMPANY_INVITATION)}
              className="rounded-full! font-semibold!"
              aria-label="Kiểm tra các lời mời tham gia doanh nghiệp"
            >
              Kiểm tra lời mời tham gia
            </Button>
          </div>
        </div>
      )}

      {/* 2. Thẻ Workspace Doanh nghiệp Hiện tại kèm Bộ chuyển đổi Doanh nghiệp (Workspace Switcher) */}
      {activeCompany && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-sky-300">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xs">
                <CompanyLogo
                  name={activeCompany.name}
                  logoUrl={activeCompany.logoUrl}
                  size="md"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {companies.length > 1 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        className="group flex max-w-full items-center gap-1.5 truncate text-left text-lg font-bold text-slate-900 transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                        aria-label={`Chuyển đổi doanh nghiệp. Hiện tại: ${activeCompany.name}`}
                      >
                        <span className="truncate">{activeCompany.name}</span>
                        <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-hover:text-primary group-data-[popup-open]:rotate-180" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-72">
                        <DropdownMenuLabel>
                          Chuyển đổi không gian làm việc
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {companies.map((comp) => {
                          const isCurrent = comp.id === activeCompany.id;
                          return (
                            <DropdownMenuItem
                              key={comp.id}
                              onClick={() => setActiveCompany(comp)}
                              className="flex cursor-pointer items-center justify-between py-2"
                            >
                              <div className="flex min-w-0 items-center gap-2.5">
                                <div className="size-6 shrink-0 overflow-hidden rounded-md border border-slate-200">
                                  <CompanyLogo
                                    name={comp.name}
                                    logoUrl={comp.logoUrl}
                                    size="sm"
                                  />
                                </div>
                                <span
                                  className={`truncate text-xs ${isCurrent ? "font-semibold text-primary" : "text-slate-700"}`}
                                >
                                  {comp.name}
                                </span>
                              </div>
                              {isCurrent && (
                                <Check className="size-4 shrink-0 text-primary" />
                              )}
                            </DropdownMenuItem>
                          );
                        })}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setIsCreateModalOpen(true)}
                          className="cursor-pointer text-xs font-semibold text-primary"
                        >
                          <Plus className="mr-2 size-3.5" />
                          Tạo thêm doanh nghiệp mới
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <h2
                      className="max-w-full truncate text-lg font-bold text-slate-900 sm:max-w-md"
                      title={activeCompany.name}
                    >
                      {activeCompany.name}
                    </h2>
                  )}

                  {/* Trạng thái xác thực */}
                  {isVerified && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                      <ShieldCheck className="size-3.5 text-emerald-600" />
                      Đã xác thực
                    </span>
                  )}
                  {isPending && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200/80 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                      <Clock className="size-3.5 text-amber-600" />
                      Chờ kiểm duyệt
                    </span>
                  )}
                  {isRejected && (
                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-200/80 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-800">
                      <AlertCircle className="size-3.5 text-rose-600" />
                      Chưa được phê duyệt
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  {activeCompany.taxCode && (
                    <span
                      className="max-w-50 truncate"
                      title={`Mã số thuế: ${activeCompany.taxCode}`}
                    >
                      MST:{" "}
                      <span className="font-mono font-medium text-slate-700">
                        {activeCompany.taxCode}
                      </span>
                    </span>
                  )}
                  {activeCompany.email && (
                    <span
                      className="max-w-[220px] truncate"
                      title={activeCompany.email}
                    >
                      {activeCompany.email}
                    </span>
                  )}
                  {activeCompany.phone && (
                    <span
                      className="max-w-[150px] truncate"
                      title={activeCompany.phone}
                    >
                      {activeCompany.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
              <Button
                variant="secondary"
                icon={ExternalLink}
                iconSize={13}
                onClick={() =>
                  navigate(
                    PATHS.RECRUITER.COMPANAY_MANAGEMENT_OVERVIEW.replace(
                      ":companyId",
                      activeCompany.id,
                    ),
                  )
                }
                className="h-8! rounded-full! px-3.5! text-xs! font-semibold!"
                aria-label={`Xem chi tiết hồ sơ công ty ${activeCompany.name}`}
              >
                Hồ sơ công ty
              </Button>
            </div>
          </div>

          {/* Cảnh báo nếu công ty đang chờ duyệt */}
          {isPending && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200/80 bg-amber-50/70 p-3 text-xs text-amber-800">
              <Clock className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <span>
                Hồ sơ doanh nghiệp đang trong quá trình kiểm duyệt giấy phép
                kinh doanh. Tính năng{" "}
                <span className="font-semibold text-amber-900">
                  đăng tin tuyển dụng
                </span>{" "}
                sẽ tự động mở khóa ngay khi đội ngũ quản trị viên phê duyệt.
              </span>
            </div>
          )}
        </div>
      )}

      {/* 3. The Signature Move: Quy trình Tuyển dụng Liền mạch (Hiring Velocity Pipeline) */}
      {activeCompany && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="grid grid-cols-1 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {/* Stage 1: Tin đang mở */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(PATHS.RECRUITER.JOBS)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(PATHS.RECRUITER.JOBS);
                }
              }}
              aria-label="Xem danh sách tin đang tuyển dụng"
              className="group cursor-pointer p-5 transition-colors hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  1. Tin đang tuyển
                </span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Briefcase className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                {isLoadingData ? (
                  <span className="inline-block h-8 w-14 animate-pulse rounded-md bg-slate-100" />
                ) : (
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {activeJobs.length}
                  </div>
                )}
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{allJobs.length} vị trí tổng cộng</span>
                  <span className="flex items-center font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                    Quản lý tin <ChevronRight className="ml-0.5 size-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Stage 2: Hồ sơ mới nộp */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(PATHS.RECRUITER.CANDIDATES);
                }
              }}
              aria-label="Xem danh sách hồ sơ mới nộp"
              className="group cursor-pointer p-5 transition-colors hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  2. Hồ sơ mới nộp
                </span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 transition-colors group-hover:bg-amber-600 group-hover:text-white">
                  <FileText className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                {isLoadingData ? (
                  <span className="inline-block h-8 w-14 animate-pulse rounded-md bg-slate-100" />
                ) : (
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {newApplications.length}
                  </div>
                )}
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span
                    className={
                      newApplications.length > 0
                        ? "font-semibold text-amber-600"
                        : ""
                    }
                  >
                    {newApplications.length > 0
                      ? "⚡ Cần duyệt ngay"
                      : "Chờ ứng tuyển"}
                  </span>
                  <span className="flex items-center font-semibold text-amber-700 transition-transform group-hover:translate-x-0.5">
                    Xem hồ sơ <ChevronRight className="ml-0.5 size-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Stage 3: Đang trong quy trình phỏng vấn & đánh giá */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(PATHS.RECRUITER.CANDIDATES);
                }
              }}
              aria-label="Xem danh sách hồ sơ đang trong quy trình"
              className="group cursor-pointer p-5 transition-colors hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  3. Đang phỏng vấn
                </span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                  <UserCheck className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                {isLoadingData ? (
                  <span className="inline-block h-8 w-14 animate-pulse rounded-md bg-slate-100" />
                ) : (
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {inReviewApplications.length}
                  </div>
                )}
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>{allApplications.length} hồ sơ tổng</span>
                  <span className="flex items-center font-semibold text-indigo-700 transition-transform group-hover:translate-x-0.5">
                    Quy trình <ChevronRight className="ml-0.5 size-3" />
                  </span>
                </div>
              </div>
            </div>

            {/* Stage 4: Đội ngũ nhân sự */}
            <div
              role="button"
              tabIndex={0}
              onClick={() =>
                navigate(
                  PATHS.RECRUITER.COMPANAY_MANAGEMENT_MEMBERS.replace(
                    ":companyId",
                    activeCompany.id,
                  ),
                )
              }
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(
                    PATHS.RECRUITER.COMPANAY_MANAGEMENT_MEMBERS.replace(
                      ":companyId",
                      activeCompany.id,
                    ),
                  );
                }
              }}
              aria-label="Xem danh sách đội ngũ nhân sự trong doanh nghiệp"
              className="group cursor-pointer p-5 transition-colors hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                  4. Đội ngũ nhân sự
                </span>
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                  <Users className="size-4" />
                </div>
              </div>
              <div className="mt-3">
                {isLoadingData ? (
                  <span className="inline-block h-8 w-14 animate-pulse rounded-md bg-slate-100" />
                ) : (
                  <div className="text-3xl font-bold tracking-tight text-slate-900">
                    {totalMembers}
                  </div>
                )}
                <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                  <span>Thành viên hoạt động</span>
                  <span className="flex items-center font-semibold text-emerald-700 transition-transform group-hover:translate-x-0.5">
                    Thành viên <ChevronRight className="ml-0.5 size-3" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Trung tâm Trợ lý Tuyển dụng AI SmartHire (Copilot Action Bar) */}
      {activeCompany && (
        <div className="rounded-2xl border border-primary/20 bg-linear-to-r from-primary-dark via-primary to-primary-light/95 p-5 text-white shadow-xs sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <div className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-amber-300">
                  <Sparkles className="size-4" />
                </div>
                <h3 className="text-base font-semibold tracking-tight text-white">
                  Trung tâm Trợ lý Tuyển dụng AI SmartHire
                </h3>
              </div>
              <p className="mt-2 max-w-2xl text-xs leading-relaxed text-slate-200">
                {newApplications.length > 0
                  ? `Hệ thống AI đã phân tích hồ sơ và sẵn sàng đối soát năng lực ứng viên cho ${newApplications.length} hồ sơ mới nộp vào các vị trí của doanh nghiệp.`
                  : activeJobs.length === 0
                    ? "Doanh nghiệp hiện chưa có vị trí đăng tuyển nào đang mở. Hãy đăng tin tuyển dụng mới để kích hoạt khả năng so khớp ứng viên tự động."
                    : `Đang liên tục chấm điểm và xếp hạng ${allApplications.length} hồ sơ ứng tuyển trên ${activeJobs.length} vị trí việc làm đang mở.`}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2.5">
              <Button
                variant="secondary"
                onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
                className="h-9! rounded-full! bg-white! px-4! text-xs! font-semibold! text-primary! hover:bg-slate-100! hover:text-primary-dark!"
                aria-label="Sàng lọc hồ sơ ứng viên với trợ lý AI"
              >
                {newApplications.length > 0
                  ? "Sàng lọc hồ sơ ngay"
                  : "Quản lý kho ứng viên"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Khối Hoạt động Tuyển dụng Thực địa: Tin tuyển dụng & Ứng viên mới nhất (Grid 12-cols) */}
      {activeCompany && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Cột trái: Tin tuyển dụng gần đây (7 cols) */}
          <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-xs lg:col-span-7">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Briefcase className="size-4" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Tin tuyển dụng gần đây
                  </h3>
                  <p className="truncate text-xs text-slate-500">
                    {allJobs.length} vị trí đăng tuyển của {activeCompany.name}
                  </p>
                </div>
              </div>

              {/* Tabs lọc nhanh trạng thái tin */}
              <div className="flex items-center gap-1 rounded-lg bg-slate-100/80 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setJobFilterTab("ALL")}
                  className={`cursor-pointer rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    jobFilterTab === "ALL"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tất cả ({recentJobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setJobFilterTab("PUBLISHED")}
                  className={`cursor-pointer rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    jobFilterTab === "PUBLISHED"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Đang mở ({activeJobs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setJobFilterTab("CLOSED")}
                  className={`cursor-pointer rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    jobFilterTab === "CLOSED"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Đã đóng ({allJobs.length - activeJobs.length})
                </button>
              </div>
            </div>

            <div className="flex-1 p-5">
              {isLoadingJobs ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : isErrorJobs ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <AlertCircle className="size-5" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    Không thể tải danh sách tin tuyển dụng
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchJobs()}
                    className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    aria-label="Thử tải lại danh sách tin tuyển dụng"
                  >
                    <RotateCcw className="size-3" />
                    Thử lại
                  </button>
                </div>
              ) : filteredRecentJobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <Briefcase className="size-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {jobFilterTab === "PUBLISHED"
                      ? "Không có tin tuyển dụng nào đang mở"
                      : jobFilterTab === "CLOSED"
                        ? "Không có tin tuyển dụng nào đã đóng"
                        : "Chưa có tin tuyển dụng nào"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {isVerified
                      ? "Đăng tin tuyển dụng đầu tiên để tiếp cận và thu hút các ứng viên tiềm năng."
                      : "Doanh nghiệp sẽ được mở đăng tin ngay khi hoàn tất kiểm duyệt hồ sơ."}
                  </p>
                  {isVerified && (
                    <Button
                      variant="primary"
                      icon={Plus}
                      onClick={() => navigate(PATHS.RECRUITER.CREATE_JOB)}
                      className="mt-4 h-8! rounded-full! px-4! text-xs! font-semibold!"
                      aria-label="Tạo tin tuyển dụng mới"
                    >
                      Tạo tin tuyển dụng
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredRecentJobs.map((job) => {
                    const applicantCount =
                      jobApplicationCountMap.get(job.id) || 0;
                    const isPublished = job.status === "Published";
                    const isClosed =
                      job.status === "Closed" || job.status === "Expired";
                    const deadlineInfo = getDeadlineMeta(job.deadline);

                    return (
                      <div
                        key={job.id}
                        onClick={() =>
                          navigate(
                            PATHS.RECRUITER.JOB_DETAIL.replace(":id", job.id),
                          )
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(
                              PATHS.RECRUITER.JOB_DETAIL.replace(":id", job.id),
                            );
                          }
                        }}
                        aria-label={`Xem chi tiết tin tuyển dụng: ${job.title}`}
                        className="group -mx-2 flex cursor-pointer items-center justify-between gap-4 rounded-xl px-2 py-3.5 transition-colors first:pt-0 last:pb-0 hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-primary">
                              {job.title}
                            </span>
                            {/* Trạng thái tin */}
                            {isPublished && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-emerald-200/60 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                                <CheckCircle2 className="size-3" /> Đang tuyển
                              </span>
                            )}
                            {isClosed && (
                              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-slate-200/60 bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                                <XCircle className="size-3" /> Đã đóng
                              </span>
                            )}
                          </div>

                          <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
                            <span
                              className="max-w-50 truncate font-medium text-slate-700"
                              title={formatSalaryRange(
                                job.salaryMin,
                                job.salaryMax,
                                job.salaryNegotiable,
                              )}
                            >
                              {formatSalaryRange(
                                job.salaryMin,
                                job.salaryMax,
                                job.salaryNegotiable,
                              )}
                            </span>
                            <span>•</span>
                            <span
                              className={`flex items-center gap-1 ${
                                deadlineInfo.isUrgent
                                  ? "font-semibold text-amber-700"
                                  : deadlineInfo.isExpired
                                    ? "text-rose-600"
                                    : "text-slate-500"
                              }`}
                            >
                              <Calendar className="size-3" />
                              {deadlineInfo.text}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2.5">
                          <span className="inline-flex items-center rounded-full border border-primary/15 bg-primary/5 px-2.5 py-1 text-xs font-semibold text-primary">
                            {applicantCount} hồ sơ
                          </span>
                          <ChevronRight className="size-4 text-slate-400 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chân cột: Nút Xem tất cả */}
            <div className="border-t border-slate-100 p-4 text-center">
              <button
                type="button"
                onClick={() => navigate(PATHS.RECRUITER.JOBS)}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label={`Xem tất cả ${allJobs.length} tin tuyển dụng`}
              >
                <span>
                  Xem tất cả danh sách tin tuyển dụng ({allJobs.length})
                </span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Cột phải: Ứng viên mới nhất & AI Match Radar (5 cols) */}
          <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-xs lg:col-span-5">
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <FileText className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Hồ sơ ứng tuyển gần đây
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ứng viên nộp hồ sơ gần nhất
                  </p>
                </div>
              </div>

              {/* Tabs lọc nhanh ứng viên */}
              <div className="flex items-center gap-1 rounded-lg bg-slate-100/80 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCandidateFilterTab("ALL")}
                  className={`cursor-pointer rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    candidateFilterTab === "ALL"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tất cả ({recentApplications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setCandidateFilterTab("NEW")}
                  className={`cursor-pointer rounded-md px-2.5 py-1 font-semibold transition-colors ${
                    candidateFilterTab === "NEW"
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Mới ({newApplications.length})
                </button>
              </div>
            </div>

            <div className="flex-1 p-5">
              {isLoadingApplications ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-16 animate-pulse rounded-xl bg-slate-100"
                    />
                  ))}
                </div>
              ) : isErrorApplications ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
                    <AlertCircle className="size-5" />
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-700">
                    Không thể tải danh sách hồ sơ ứng tuyển
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchApplications()}
                    className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    aria-label="Thử tải lại danh sách hồ sơ ứng tuyển"
                  >
                    <RotateCcw className="size-3" />
                    Thử lại
                  </button>
                </div>
              ) : filteredRecentApplications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                    <UserCheck className="size-6" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    {candidateFilterTab === "NEW"
                      ? "Chưa có hồ sơ mới cần duyệt"
                      : "Chưa có hồ sơ ứng tuyển nào"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Khi ứng viên nộp hồ sơ vào các vị trí đang tuyển, thông tin
                    hồ sơ và điểm so khớp AI sẽ xuất hiện tại đây.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredRecentApplications.map((app) => {
                    const profile = resolveCandidateProfile(app);
                    const statusConfig = APPLICATION_STATUS_CONFIG[
                      app.status
                    ] || {
                      label: app.status,
                      badgeClass: "bg-slate-100 text-slate-700",
                    };
                    const targetJobTitle =
                      app.jobTitle || app.job?.title || "Ứng tuyển vị trí";
                    const aiScore = getAiScore(app);

                    // Deep link trực tiếp tới danh sách ứng viên với jobId & tên ứng viên
                    const candidateDeepLink = app.jobId
                      ? `${PATHS.RECRUITER.CANDIDATES}?jobId=${app.jobId}&search=${encodeURIComponent(profile.name)}`
                      : PATHS.RECRUITER.CANDIDATES;

                    return (
                      <div
                        key={app.id}
                        onClick={() => navigate(candidateDeepLink)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            navigate(candidateDeepLink);
                          }
                        }}
                        aria-label={`Xem hồ sơ ứng viên: ${profile.name}`}
                        className="group -mx-2 flex cursor-pointer items-center justify-between gap-3 rounded-xl px-2 py-3.5 transition-colors first:pt-0 last:pb-0 hover:bg-slate-50/70 focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <UserAvatar
                            src={profile.avatarUrl || ""}
                            name={profile.name}
                            alt={profile.name}
                            className="size-9 shrink-0 rounded-full border border-slate-200 object-cover"
                          />

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="max-w-[130px] truncate text-xs font-semibold text-slate-900 transition-colors group-hover:text-primary sm:max-w-[160px]">
                                {profile.name}
                              </span>

                              {/* AI Match Score Badge hoặc Loại định dạng CV */}
                              {aiScore !== null ? (
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${
                                    aiScore >= 85
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                      : aiScore >= 70
                                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                                        : "border-amber-200 bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  <Sparkles className="size-2.5" />
                                  {aiScore}% Phù hợp
                                </span>
                              ) : app.uploadedCvUrl ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                                  <FileText className="size-2.5 text-slate-500" />
                                  PDF
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-xs font-medium text-primary">
                                  <Sparkles className="size-2.5 text-primary" />
                                  SmartHire CV
                                </span>
                              )}
                            </div>

                            <p
                              className="mt-0.5 max-w-[160px] truncate text-xs text-slate-500 sm:max-w-50"
                              title={targetJobTitle}
                            >
                              {targetJobTitle}
                            </p>

                            <span className="text-xs text-slate-400">
                              {getSafeTimeAgo(app.appliedAt)}
                            </span>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusConfig.badgeClass}`}
                          >
                            {statusConfig.label}
                          </span>
                          <ChevronRight className="size-4 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chân cột: Nút Xem tất cả */}
            <div className="border-t border-slate-100 p-4 text-center">
              <button
                type="button"
                onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
                className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                aria-label={`Xem tất cả ${allApplications.length} hồ sơ ứng tuyển`}
              >
                <span>
                  Xem tất cả danh sách hồ sơ ({allApplications.length})
                </span>
                <ArrowRight className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Mẹo Tối ưu Hiệu suất Tuyển dụng (Hiring Insights & Best Practices) */}
      {activeCompany && (
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 text-xs text-slate-600">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Lightbulb className="size-4 text-amber-500" />
              <span>Gợi ý tuyển dụng nhanh:</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-slate-500">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-emerald-600" />
                Phản hồi hồ sơ trong 48h giúp tăng 60% tỷ lệ ứng viên đồng ý
                phỏng vấn.
              </span>
              <span>•</span>
              <span>
                Cập nhật dải lương minh bạch giúp thu hút gấp đôi ứng viên phù
                hợp.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo doanh nghiệp mới */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateCompanySuccess}
      />
    </div>
  );
}
