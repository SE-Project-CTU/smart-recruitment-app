import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Plus,
  ChevronRight,
  ChevronDown,
  Check,
  ExternalLink,
  RotateCcw,
  Building2,
  AlertCircle,
  ShieldCheck,
  Clock,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import {
  Button,
  JobCard,
  GradientGridBackground,
  TableSkeleton,
} from "@/components/common";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import Grainient from "@/components/external/Grainient";
import { CreateCompanyModal } from "./company/CreateCompanyModal";
import { CandidateTable } from "./candidate/CandidateTable";
import { useWeather, getWeatherInfo } from "@/hooks/useWeather";
import { useAuthStore } from "@/stores/authStore";
import { useCompanyStore } from "@/stores/companyStore";
import { useMyCompanies } from "@/hooks/queries/useCompany";
import {
  useCompanyJobPostings,
  useRecruiterAllApplications,
  useUpdateApplicationStatus,
} from "@/hooks/queries/useJob";
import { PATHS } from "@/constants/paths";
import {
  resolveCandidateProfile,
  type RecruiterCandidateApplicationItem,
  type UpdateJobApplicationStatus,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

dayjs.locale("vi");

interface PendingStatusChange {
  app: RecruiterCandidateApplicationItem;
  fromStatus: string;
  toStatus: UpdateJobApplicationStatus;
}

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activeCompany = useCompanyStore((s) => s.activeCompany);
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);
  const setActiveCompany = useCompanyStore((s) => s.setActiveCompany);

  // Modal tạo công ty mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Modal xem thư giới thiệu & thay đổi trạng thái ứng viên
  const [selectedLetterApp, setSelectedLetterApp] =
    useState<RecruiterCandidateApplicationItem | null>(null);
  const [pendingChange, setPendingChange] =
    useState<PendingStatusChange | null>(null);
  const [transitionNote, setTransitionNote] = useState("");
  const [isSubmittingTransition, setIsSubmittingTransition] = useState(false);

  // Mutation cập nhật trạng thái
  const updateStatusMutation = useUpdateApplicationStatus();

  // Khối thời tiết và ngày tháng (tái sử dụng từ CandidateDashboardBanner)
  const weather = useWeather();
  const weatherMeta = getWeatherInfo(weather.weatherCode);

  const currentDateStr = dayjs().format("dddd, DD [tháng] MM");
  const formattedDate =
    currentDateStr.charAt(0).toUpperCase() + currentDateStr.slice(1);

  const dayOfWeekStr = dayjs().format("dddd");
  const formattedDayOfWeek =
    dayOfWeekStr.charAt(0).toUpperCase() + dayOfWeekStr.slice(1);

  // Queries dữ liệu đồng bộ chuẩn theo Workspace
  const {
    data: companiesData,
    isLoading: isLoadingCompanies,
    isError: isErrorCompanies,
    refetch: refetchCompanies,
  } = useMyCompanies();
  const companies = companiesData || [];

  const {
    data: jobResponse,
    isLoading: isLoadingJobs,
    isError: isErrorJobs,
    refetch: refetchJobs,
  } = useCompanyJobPostings(activeCompanyId);

  const {
    data: applications,
    isLoading: isLoadingApplications,
    isError: isErrorApplications,
    refetch: refetchApplications,
  } = useRecruiterAllApplications(activeCompanyId);

  const isLoadingData =
    isLoadingCompanies || isLoadingJobs || isLoadingApplications;

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

  // Danh sách toàn bộ tin tuyển dụng của công ty
  const allJobs: JobPostingItem[] = useMemo(() => {
    return jobResponse?.items || [];
  }, [jobResponse]);

  // Danh sách toàn bộ hồ sơ ứng tuyển của công ty
  const allApplications: RecruiterCandidateApplicationItem[] = useMemo(() => {
    return applications || [];
  }, [applications]);

  // ==========================================
  // TÍNH TOÁN DỮ LIỆU BADGES CHUẨN XÁC 100%
  // ==========================================

  // 1. Tin đang mở (Published / Open / Active)
  const activeJobs = useMemo(() => {
    return allJobs.filter((job) => {
      const s = (job.status || "").toUpperCase();
      return s === "PUBLISHED" || s === "OPEN" || s === "ACTIVE";
    });
  }, [allJobs]);

  // Hồ sơ mới nộp (Submitted / Received)
  const newApplications = useMemo(() => {
    return allApplications.filter((a) => {
      const s = (a.status || "").toUpperCase();
      return s === "SUBMITTED" || s === "RECEIVED";
    });
  }, [allApplications]);

  // 3. Mời phỏng vấn (Interview / Interviewing)
  const interviewingApplications = useMemo(() => {
    return allApplications.filter((a) => {
      const s = (a.status || "").toUpperCase();
      return s === "INTERVIEW" || s === "INTERVIEWING";
    });
  }, [allApplications]);

  // 4. Đã tuyển dụng (Hired / Accepted)
  const hiredApplications = useMemo(() => {
    return allApplications.filter((a) => {
      const s = (a.status || "").toUpperCase();
      return s === "HIRED" || s === "ACCEPTED";
    });
  }, [allApplications]);

  // 4 tin tuyển dụng gần đây nhất để render JobCard
  const recentJobs = useMemo(() => {
    return [...allJobs]
      .sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 4);
  }, [allJobs]);

  // Danh sách ứng tuyển gần đây nhất (4 hồ sơ mới nhất) cho CandidateTable
  const recentCandidates = useMemo(() => {
    return [...allApplications]
      .sort((a, b) => {
        const timeA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
        const timeB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 4);
  }, [allApplications]);

  // Trạng thái công ty active
  const isVerified = activeCompany?.verificationStatus === "Verified";
  const isPending = activeCompany?.verificationStatus === "Pending";
  const isRejected = activeCompany?.verificationStatus === "Rejected";

  const handleCreateCompanySuccess = (newCompany: CompanyItem) => {
    setActiveCompany(newCompany);
    setIsCreateModalOpen(false);
  };

  // Mở modal xác nhận thay đổi trạng thái
  const handleOpenConfirmTransition = (
    app: RecruiterCandidateApplicationItem,
    targetStatus: UpdateJobApplicationStatus,
  ) => {
    const currentStatus = (app.status || "SUBMITTED").toUpperCase();
    setPendingChange({
      app,
      fromStatus: currentStatus,
      toStatus: targetStatus,
    });
    setTransitionNote("");
  };

  // Thực hiện đổi trạng thái
  const handleConfirmTransition = async () => {
    if (!pendingChange) return;

    try {
      setIsSubmittingTransition(true);
      await updateStatusMutation.mutateAsync({
        applicationId: pendingChange.app.id,
        status: pendingChange.toStatus,
        note: transitionNote.trim() || undefined,
      });
      setPendingChange(null);
      setTransitionNote("");
      refetchApplications();
    } catch {
      // Đã có toast error từ hook
    } finally {
      setIsSubmittingTransition(false);
    }
  };

  // 4 Badges số liệu: đồng nhất 100% về màu sắc, icon, kích thước và hover
  const statsCards = [
    {
      title: "Tin đang mở",
      count: activeJobs.length,
      subtext: `${allJobs.length} tin tổng cộng`,
      icon: Briefcase,
      onClick: () => navigate(PATHS.RECRUITER.JOBS),
      ariaLabel: "Xem danh sách tin đang mở",
    },
    {
      title: "Tổng ứng viên",
      count: allApplications.length,
      subtext: `${newApplications.length} hồ sơ mới nộp`,
      icon: Users,
      onClick: () => navigate(PATHS.RECRUITER.CANDIDATES),
      ariaLabel: "Xem tất cả ứng viên",
    },
    {
      title: "Mời phỏng vấn",
      count: interviewingApplications.length,
      subtext: "Lịch phỏng vấn đang diễn ra",
      icon: Calendar,
      onClick: () => navigate(PATHS.RECRUITER.CANDIDATES),
      ariaLabel: "Xem danh sách ứng viên mời phỏng vấn",
    },
    {
      title: "Đã tuyển dụng",
      count: hiredApplications.length,
      subtext: "Tuyển dụng thành công",
      icon: CheckCircle2,
      onClick: () => navigate(PATHS.RECRUITER.CANDIDATES),
      ariaLabel: "Xem danh sách ứng viên đã tuyển dụng",
    },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* =========================================================================
          1. [HEADER] Ngày tháng + Thời tiết (Reused) | Lời chào Recruiter
         ========================================================================= */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface">
        <GradientGridBackground />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Cột trái: Thời tiết + Ngày tháng + Lời chào */}
            <div className="flex flex-col gap-3">
              {/* Khối thời tiết và ngày tháng */}
              <div className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium text-text-muted">
                  {formattedDate}
                </span>
                <div className="inline-flex items-center gap-2 text-base font-medium text-text-main sm:text-lg">
                  <span>{weatherMeta.icon}</span>
                  {weather.isLoading ? (
                    <span className="animate-pulse">Đang tải thời tiết...</span>
                  ) : (
                    <span>
                      {weather.temp}°C {weatherMeta.label}
                    </span>
                  )}
                </div>
              </div>

              {/* Khối lời chào */}
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
                  {formattedDayOfWeek} tốt lành,{" "}
                  {user?.fullName || "Nhà tuyển dụng"}! 👋
                </h1>
                <p className="text-xs leading-relaxed text-text-muted sm:text-sm">
                  Theo dõi tiến độ tuyển dụng, tương tác với ứng viên và phát
                  triển đội ngũ của{" "}
                  <span className="font-semibold text-text-main">
                    {activeCompany?.name || "doanh nghiệp"}
                  </span>
                  .
                </p>
              </div>
            </div>

            {/* Cột phải: Không gian làm việc Doanh nghiệp & Nút Hành động */}
            {activeCompany && (
              <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-white/70 p-4 backdrop-blur-xs sm:flex-row sm:items-center">
                <div className="flex items-center gap-3">
                  <div className="size-11 shrink-0 overflow-hidden rounded-lg border border-border bg-white">
                    <CompanyLogo
                      name={activeCompany.name}
                      logoUrl={activeCompany.logoUrl}
                      size="sm"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {companies.length > 1 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="group flex max-w-[180px] items-center gap-1 truncate text-xs font-bold text-text-main transition-colors hover:text-primary sm:max-w-[220px]"
                            aria-label={`Chuyển đổi doanh nghiệp. Hiện tại: ${activeCompany.name}`}
                          >
                            <span className="truncate">
                              {activeCompany.name}
                            </span>
                            <ChevronDown className="size-3.5 shrink-0 text-text-muted transition-transform group-data-[popup-open]:rotate-180" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-64">
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
                                  <span
                                    className={`truncate text-xs ${
                                      isCurrent
                                        ? "font-semibold text-primary"
                                        : "text-text-main"
                                    }`}
                                  >
                                    {comp.name}
                                  </span>
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
                              Tạo doanh nghiệp mới
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span
                          className="max-w-[200px] truncate text-xs font-bold text-text-main"
                          title={activeCompany.name}
                        >
                          {activeCompany.name}
                        </span>
                      )}

                      {/* Trạng thái xác thực */}
                      {isVerified && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                          <ShieldCheck className="size-3 text-emerald-600" />
                          Đã xác thực
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          <Clock className="size-3 text-amber-600" />
                          Chờ duyệt
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                          <AlertCircle className="size-3 text-rose-600" />
                          Chưa duyệt
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                      {activeCompany.taxCode && (
                        <span>MST: {activeCompany.taxCode}</span>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            PATHS.RECRUITER.COMPANAY_MANAGEMENT_OVERVIEW.replace(
                              ":companyId",
                              activeCompany.id,
                            ),
                          )
                        }
                        className="inline-flex cursor-pointer items-center gap-1 text-primary hover:underline"
                        aria-label="Xem hồ sơ doanh nghiệp"
                      >
                        <span>Hồ sơ</span>
                        <ExternalLink className="size-3" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 sm:border-l sm:border-border sm:pl-3">
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
                    className="h-9! rounded-full! px-4! text-xs! font-semibold!"
                    aria-label="Đăng tin tuyển dụng mới"
                  >
                    Đăng tin mới
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lỗi khi tải thông tin doanh nghiệp */}
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

      {/* Trạng thái 0 công ty (Onboarding) */}
      {!isLoadingCompanies && !isErrorCompanies && companies.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface p-12 text-center shadow-xs">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="size-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-text-main">
            Chưa có không gian làm việc doanh nghiệp
          </h2>
          <p className="mt-2 max-w-md text-sm text-text-muted">
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

      {/* =========================================================================
          2. [4 STATS CARDS] Tin đang mở | Tổng ứng viên | Mời phỏng vấn | Đã tuyển dụng
             (Riêng badge "Tin đang mở" sử dụng CustomBackground)
         ========================================================================= */}
      {activeCompany && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {statsCards.map((item) => {
            const isFeatured = item.title === "Tin đang mở";

            return (
              <div
                key={item.title}
                role="button"
                tabIndex={0}
                onClick={item.onClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    item.onClick();
                  }
                }}
                aria-label={item.ariaLabel}
                className={cn(
                  "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border p-4 transition-all focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none",
                  isFeatured
                    ? ""
                    : "border-border bg-surface hover:border-primary/40 hover:bg-white",
                )}
              >
                {/* Riêng badge "Tin đang mở" sử dụng Grainient từ React Bits */}
                {isFeatured && (
                  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl opacity-35">
                    <Grainient
                      color1="#ade8f4"
                      color2="#48cae4"
                      color3="#0096c7"
                      timeSpeed={3}
                    />
                  </div>
                )}

                <div className="relative z-1 flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-text-muted uppercase">
                      {item.title}
                    </span>
                    <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      <item.icon className="size-4" />
                    </div>
                  </div>
                  <div className="mt-3">
                    {isLoadingData ? (
                      <span className="inline-block h-8 w-14 animate-pulse rounded-md bg-slate-100" />
                    ) : (
                      <span className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
                        {String(item.count).padStart(2, "0")}
                      </span>
                    )}
                    <div className="mt-1 flex items-center justify-between text-xs text-text-muted">
                      <span>{item.subtext}</span>
                      <span className="flex items-center font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                        Chi tiết <ChevronRight className="ml-0.5 size-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          3. [CHARTS PLACEHOLDERS]
             - [CHART 1] Biểu đồ xu hướng ứng tuyển (Line/Area) (7/12)
             - [CHART 2] Donut Trạng thái (5/12)
         ========================================================================= */}
      {activeCompany && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* [CHART 1] Biểu đồ xu hướng ứng tuyển (Line/Area) - 7 cols */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 lg:col-span-7">
            <div className="flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-text-main">
                  Xu hướng ứng tuyển
                </h3>
                <p className="text-xs text-text-muted">
                  Biểu đồ theo dõi số lượng hồ sơ nộp vào theo thời gian
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-border bg-bg px-2.5 py-1 text-xs font-semibold text-text-muted sm:self-auto">
                30 ngày qua
              </span>
            </div>

            {/* Vùng chừa sẵn chỗ trống để nhét Line/Area Chart vào sau */}
            <div className="relative mt-4 flex min-h-64 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg/40 p-6">
              <div className="flex w-full flex-col gap-4">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Số lượng hồ sơ</span>
                  <span className="inline-flex items-center gap-1.5 font-semibold text-primary">
                    <span className="size-2 rounded-full bg-primary" /> Ứng
                    tuyển
                  </span>
                </div>
                <div className="h-36 w-full rounded-lg bg-linear-to-b from-primary/10 to-transparent p-2">
                  <svg
                    className="size-full overflow-visible"
                    preserveAspectRatio="none"
                    viewBox="0 0 100 40"
                  >
                    <path
                      d="M0,32 Q20,12 40,24 T70,8 T100,16"
                      fill="none"
                      stroke="var(--color-primary, #1b3b6f)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,32 Q20,12 40,24 T70,8 T100,16 L100,40 L0,40 Z"
                      fill="var(--color-primary, #1b3b6f)"
                      fillOpacity="0.08"
                    />
                  </svg>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Tuần 1</span>
                  <span>Tuần 2</span>
                  <span>Tuần 3</span>
                  <span>Tuần 4</span>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface/50 backdrop-blur-[1px]">
                <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-text-muted shadow-xs">
                  Vị trí Biểu đồ Xu hướng Tuyển dụng (Line/Area Chart)
                </span>
              </div>
            </div>
          </div>

          {/* [CHART 2] Donut Trạng thái - 5 cols */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 lg:col-span-5">
            <div className="flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-text-main">
                  Trạng thái hồ sơ
                </h3>
                <p className="text-xs text-text-muted">
                  Phân bổ theo giai đoạn tuyển dụng
                </p>
              </div>
              <span className="self-start rounded-full border border-border bg-bg px-2.5 py-1 text-xs font-semibold text-text-muted sm:self-auto">
                {allApplications.length} hồ sơ
              </span>
            </div>

            {/* Vùng chừa sẵn chỗ trống để nhét Donut Chart vào sau */}
            <div className="relative mt-4 flex min-h-64 flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-bg/40 p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative flex size-32 items-center justify-center">
                  <svg
                    className="size-full -rotate-90 transform"
                    viewBox="0 0 36 36"
                  >
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="4"
                    />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="none"
                      stroke="var(--color-primary, #1b3b6f)"
                      strokeWidth="4"
                      strokeDasharray="60 40"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-lg font-bold text-text-main">
                      {allApplications.length}
                    </span>
                    <span className="block text-[10px] text-text-muted">
                      Tổng đơn
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-primary" />
                    <span>Mới nộp ({newApplications.length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-sky-400" />
                    <span>Phỏng vấn ({interviewingApplications.length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>Đã tuyển ({hiredApplications.length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-slate-300" />
                    <span>Trạng thái khác</span>
                  </div>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface/50 backdrop-blur-[1px]">
                <span className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs font-semibold text-text-muted shadow-xs">
                  Vị trí Biểu đồ Phân bổ Trạng thái (Donut Chart)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          4. [LIST 1] Tin tuyển dụng gần đây (3 - 4 JobCard cho Recruiter)
             - Luôn hiển thị Avatar Doanh nghiệp từ activeCompany
             - Dành riêng cho Recruiter: Không có nút "Ứng tuyển ngay" và "Lưu tin"
         ========================================================================= */}
      {activeCompany && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-text-main">
                Tin tuyển dụng gần đây
              </h2>
              <p className="text-xs text-text-muted">
                Các vị trí tuyển dụng cập nhật mới nhất của {activeCompany.name}
              </p>
            </div>
            <Button
              variant="secondary"
              icon={ArrowRight}
              iconPosition="right"
              iconSize={14}
              onClick={() => navigate(PATHS.RECRUITER.JOBS)}
              className="px-3! py-1.5! text-xs!"
              aria-label="Xem tất cả tin tuyển dụng"
            >
              Xem tất cả ({allJobs.length})
            </Button>
          </div>

          {isLoadingJobs ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className="h-56 animate-pulse rounded-2xl border border-border bg-surface"
                />
              ))}
            </div>
          ) : isErrorJobs ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200 bg-rose-50/50 py-8 text-center">
              <AlertCircle className="size-8 text-rose-500" />
              <p className="mt-2 text-xs font-semibold text-slate-700">
                Không thể tải danh sách tin tuyển dụng
              </p>
              <button
                type="button"
                onClick={() => refetchJobs()}
                className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <RotateCcw className="size-3" />
                Thử lại
              </button>
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-surface p-8 text-center">
              <Briefcase className="size-8 text-text-muted" />
              <h3 className="mt-3 text-sm font-semibold text-text-main">
                Chưa có tin tuyển dụng nào
              </h3>
              <p className="mt-1 text-xs text-text-muted">
                Đăng tin tuyển dụng đầu tiên để bắt đầu tiếp cận và thu hút các
                ứng viên tiềm năng.
              </p>
              {isVerified && (
                <Button
                  variant="primary"
                  icon={Plus}
                  onClick={() => navigate(PATHS.RECRUITER.CREATE_JOB)}
                  className="mt-4 rounded-full! px-4! text-xs! font-semibold!"
                  aria-label="Đăng tin tuyển dụng mới"
                >
                  Đăng tin mới
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {recentJobs.map((job) => {
                // Đảm bảo đầy đủ dữ liệu Doanh nghiệp và Avatar công ty cho JobCard
                const jobWithCompany = {
                  ...job,
                  companyName:
                    job.companyName ||
                    job.company?.name ||
                    activeCompany?.name ||
                    "Doanh nghiệp",
                  companyLogoUrl:
                    job.companyLogoUrl ||
                    job.company?.logoUrl ||
                    activeCompany?.logoUrl ||
                    null,
                  company: {
                    ...job.company,
                    id: job.company?.id || activeCompany?.id || "",
                    name:
                      job.company?.name ||
                      job.companyName ||
                      activeCompany?.name ||
                      "Doanh nghiệp",
                    logoUrl:
                      job.company?.logoUrl ||
                      job.companyLogoUrl ||
                      activeCompany?.logoUrl ||
                      null,
                  },
                };

                return (
                  <JobCard
                    key={job.id}
                    job={jobWithCompany}
                    role="recruiter"
                    companyLogoUrl={activeCompany?.logoUrl}
                    onSelect={() =>
                      navigate(
                        PATHS.RECRUITER.JOB_DETAIL.replace(":id", job.id),
                      )
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          5. [LIST 2] Ứng tuyển gần đây (Tận dụng DataTable / CandidateTable từ recruiter/candidates)
         ========================================================================= */}
      {activeCompany && (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <div>
              <h2 className="text-lg font-bold text-text-main">
                Ứng tuyển gần đây
              </h2>
              <p className="text-xs text-text-muted">
                Danh sách các hồ sơ ứng tuyển mới nhất chờ xem xét & đánh giá
              </p>
            </div>
            <Button
              variant="secondary"
              icon={ArrowRight}
              iconPosition="right"
              iconSize={14}
              onClick={() => navigate(PATHS.RECRUITER.CANDIDATES)}
              className="px-3! py-1.5! text-xs!"
              aria-label="Xem tất cả hồ sơ ứng viên"
            >
              Xem tất cả ({allApplications.length})
            </Button>
          </div>

          {isLoadingApplications ? (
            <TableSkeleton />
          ) : isErrorApplications ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="size-8 text-rose-500" />
              <p className="mt-2 text-xs font-semibold text-slate-700">
                Không thể tải danh sách ứng viên
              </p>
              <button
                type="button"
                onClick={() => refetchApplications()}
                className="mt-2 inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <RotateCcw className="size-3" />
                Thử lại
              </button>
            </div>
          ) : (
            <CandidateTable
              data={recentCandidates}
              onReadCoverLetter={(app) => setSelectedLetterApp(app)}
              onRequestChangeStatus={handleOpenConfirmTransition}
              onViewJobDetail={(jobId) =>
                navigate(PATHS.RECRUITER.JOB_DETAIL.replace(":id", jobId))
              }
              isUpdatingStatus={updateStatusMutation.isPending}
              emptyMessage={`Doanh nghiệp "${activeCompany.name}" hiện chưa có hồ sơ ứng tuyển nào.`}
            />
          )}
        </div>
      )}

      {/* =========================================================================
          6. MODALS: Xem Thư giới thiệu & Xác nhận chuyển trạng thái
         ========================================================================= */}
      {/* Modal Xem Thư Giới Thiệu (Cover Letter) */}
      <Dialog
        open={Boolean(selectedLetterApp)}
        onOpenChange={(open) => {
          if (!open) setSelectedLetterApp(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thư giới thiệu của ứng viên</DialogTitle>
            <DialogDescription>
              {selectedLetterApp
                ? `${resolveCandidateProfile(selectedLetterApp).name} • Vị trí: ${selectedLetterApp.jobTitle || selectedLetterApp.job?.title || "Ứng tuyển"}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto rounded-xl bg-slate-50 p-4 text-xs leading-relaxed text-slate-700 sm:text-sm">
            {selectedLetterApp?.coverLetter ||
              "Ứng viên không đính kèm thư giới thiệu."}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              variant="secondary"
              onClick={() => setSelectedLetterApp(null)}
              className="px-4! py-2! text-xs! font-medium!"
            >
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Xác nhận Chuyển Trạng Thái */}
      <Dialog
        open={Boolean(pendingChange)}
        onOpenChange={(open) => {
          if (!open && !isSubmittingTransition) {
            setPendingChange(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận thay đổi trạng thái</DialogTitle>
            <DialogDescription>
              {pendingChange
                ? `Chuyển hồ sơ của ứng viên ${resolveCandidateProfile(pendingChange.app).name} sang trạng thái "${pendingChange.toStatus}".`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div>
              <label
                htmlFor="transition-note"
                className="text-xs font-semibold text-slate-700"
              >
                Ghi chú nội bộ (Tùy chọn)
              </label>
              <textarea
                id="transition-note"
                rows={3}
                placeholder="Nhập ghi chú hoặc lý do chuyển trạng thái hồ sơ..."
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-slate-50/50 p-3 text-xs text-text-main transition-colors placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="secondary"
                onClick={() => setPendingChange(null)}
                disabled={isSubmittingTransition}
                className="px-4! py-2! text-xs! font-medium!"
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmTransition}
                isLoading={isSubmittingTransition}
                className="px-4! py-2! text-xs! font-semibold!"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Tạo doanh nghiệp mới */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateCompanySuccess}
      />
    </div>
  );
}
