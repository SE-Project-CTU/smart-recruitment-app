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
  ExternalLink,
  RotateCcw,
  AlertCircle,
  ShieldCheck,
  Clock,
  PieChart as PieChartIcon,
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
import {
  EChartsPieChart,
  type ChartConfig,
} from "@/components/evilcharts/charts/echarts-pie-chart";
import { EChartsAreaChart } from "@/components/evilcharts/charts/echarts-area-chart";
import { CreateCompanyModal } from "./company/CreateCompanyModal";
import {
  CandidateTable,
  ApplicationCvPreviewDialog,
} from "./candidate";
import { EmptyStreet } from "@/assets/images/decoration";
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
import { getTimeOfDayGreeting } from "@/utils/helper";
import {
  resolveCandidateProfile,
  type PendingStatusChange,
  type RecruiterCandidateApplicationItem,
  type UpdateJobApplicationStatus,
} from "@/types/application";
import type { CompanyItem, JobPostingItem } from "@/types";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

dayjs.locale("vi");

const trendChartConfig: ChartConfig = {
  applications: {
    label: "Hồ sơ ứng tuyển",
    colors: {
      light: ["#1b3b6f", "#3e5e8f", "#6fc3e8"],
      dark: ["#6fc3e8", "#a6e1fa", "#d6f1fc"],
    },
  },
};

const statusChartConfig: ChartConfig = {
  submitted: {
    label: "Mới nộp",
    colors: {
      light: ["#3b82f6"],
      dark: ["#60a5fa"],
    },
  },
  reviewing: {
    label: "Đang xem xét",
    colors: {
      light: ["#8b5cf6"],
      dark: ["#a78bfa"],
    },
  },
  interviewing: {
    label: "Phỏng vấn",
    colors: {
      light: ["#f59e0b"],
      dark: ["#fbbf24"],
    },
  },
  offered: {
    label: "Đề nghị việc",
    colors: {
      light: ["#06b6d4"],
      dark: ["#22d3ee"],
    },
  },
  hired: {
    label: "Đã tuyển dụng",
    colors: {
      light: ["#10b981"],
      dark: ["#34d399"],
    },
  },
  rejected: {
    label: "Từ chối",
    colors: {
      light: ["#94a3b8"],
      dark: ["#cbd5e1"],
    },
  },
};

export default function RecruiterDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const activeCompany = useCompanyStore((s) => s.activeCompany);
  const activeCompanyId = useCompanyStore((s) => s.activeCompanyId);
  const setActiveCompany = useCompanyStore((s) => s.setActiveCompany);
  const clearActiveCompany = useCompanyStore((s) => s.clearActiveCompany);

  // Modal tạo công ty mới
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Modal xem thư giới thiệu & thay đổi trạng thái ứng viên
  const [selectedLetterApp, setSelectedLetterApp] =
    useState<RecruiterCandidateApplicationItem | null>(null);
  const [selectedCvApp, setSelectedCvApp] =
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

  // Queries dữ liệu đồng bộ chuẩn theo Workspace
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
    if (isLoadingCompanies) return;

    if (companies.length === 0) {
      if (activeCompany !== null || activeCompanyId !== null) {
        clearActiveCompany();
      }
      return;
    }

    const found = companies.find((c) => c.id === activeCompanyId);
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
  }, [
    companies,
    activeCompany,
    activeCompanyId,
    isLoadingCompanies,
    setActiveCompany,
    clearActiveCompany,
  ]);

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

  // Dữ liệu xu hướng ứng tuyển theo thời gian (7 mốc tháng gần nhất)
  const applicationTrendData = useMemo(() => {
    const points: { month: string; applications: number }[] = [];
    const now = dayjs();

    const hasRealApps = allApplications.some((a) => Boolean(a.appliedAt));
    const sampleCounts = [4, 7, 14, 25, 20, 38, 52];

    for (let i = 6; i >= 0; i--) {
      const m = now.subtract(i, "month");
      const monthKey = m.format("YYYY-MM");
      const label = `Thg ${m.format("M")}`;

      const count = hasRealApps
        ? allApplications.filter((app) => {
            if (!app.appliedAt) return false;
            return dayjs(app.appliedAt).format("YYYY-MM") === monthKey;
          }).length
        : (sampleCounts[6 - i] ?? 0);

      points.push({
        month: label,
        applications: count,
      });
    }

    return points;
  }, [allApplications]);

  // Dữ liệu phân bổ trạng thái hồ sơ cho Donut Chart
  const applicationStatusData = useMemo(() => {
    let submitted = 0;
    let reviewing = 0;
    let interviewing = 0;
    let offered = 0;
    let hired = 0;
    let rejected = 0;

    for (const app of allApplications) {
      const s = (app.status || "").toUpperCase();
      if (s === "SUBMITTED" || s === "RECEIVED") {
        submitted++;
      } else if (s === "REVIEWING" || s === "SHORTLISTED" || s === "APPROVED") {
        reviewing++;
      } else if (s === "INTERVIEW" || s === "INTERVIEWING") {
        interviewing++;
      } else if (s === "OFFERED") {
        offered++;
      } else if (s === "HIRED" || s === "ACCEPTED") {
        hired++;
      } else if (s === "REJECTED" || s === "WITHDRAWN") {
        rejected++;
      } else {
        submitted++;
      }
    }

    const items = [
      { status: "submitted", count: submitted },
      { status: "reviewing", count: reviewing },
      { status: "interviewing", count: interviewing },
      { status: "offered", count: offered },
      { status: "hired", count: hired },
      { status: "rejected", count: rejected },
    ];

    return items.filter((item) => item.count > 0);
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
                  {getTimeOfDayGreeting(user?.fullName || "Nhà tuyển dụng")}
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
                  <CompanyLogo
                    name={activeCompany.name}
                    logoUrl={activeCompany.logoUrl}
                    size="sm"
                  />

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="max-w-50 truncate text-xs font-bold text-text-main"
                        title={activeCompany.name}
                      >
                        {activeCompany.name}
                      </span>
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
        <section className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
          <img
            src={EmptyStreet}
            alt="Chưa có không gian làm việc doanh nghiệp"
            loading="lazy"
            className="h-80 w-auto md:h-100"
          />
          <h2 className="text-xl font-bold text-text-main">
            Chưa có không gian làm việc doanh nghiệp
          </h2>
          <p className="max-w-md text-xs leading-relaxed text-text-muted sm:text-sm">
            Tạo hồ sơ doanh nghiệp mới hoặc tham gia doanh nghiệp để bắt đầu
            đăng tin tuyển dụng và quản lý hồ sơ ứng viên.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
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
        </section>
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
                    <div className="flex size-9 items-center justify-center rounded-xl bg-bg-white-blue text-secondary-dark transition-colors group-hover:bg-primary group-hover:text-white">
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
          {/* [CHART 1] Biểu đồ xu hướng ứng tuyển (Area Chart) - 7 cols */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 lg:col-span-7">
            <div className="flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-text-main sm:text-lg">
                  Hồ sơ ứng tuyển
                </h3>
                <p className="text-xs text-text-muted">
                  Số lượng hồ sơ tiếp nhận theo các mốc thời gian
                </p>
              </div>
              <div className="flex items-center gap-4 self-start sm:self-auto sm:text-right">
                <div>
                  <span className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
                    {allApplications.length > 0
                      ? allApplications.length.toLocaleString()
                      : applicationTrendData
                          .reduce((sum, p) => sum + p.applications, 0)
                          .toLocaleString()}
                  </span>
                  <span className="block text-[11px] font-medium text-text-muted">
                    {allApplications.length > 0
                      ? "Tổng hồ sơ tiếp nhận"
                      : "Tổng hồ sơ (Minh họa)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Area Chart with EvilCharts */}
            <div className="relative mt-4 flex min-h-64 flex-1 items-center justify-center">
              <EChartsAreaChart
                data={applicationTrendData}
                config={trendChartConfig}
                className="h-64 w-full"
                xDataKey="month"
                curveType="bump"
                isLoading={isLoadingApplications}
              >
                <EChartsAreaChart.Grid />
                <EChartsAreaChart.XAxis
                  dataKey="month"
                  tickFormatter={(val: string) => val}
                />
                <EChartsAreaChart.Tooltip />
                <EChartsAreaChart.Area
                  dataKey="applications"
                  variant="gradient"
                  strokeVariant="solid"
                  strokeWidth={2.5}
                  curveType="bump"
                  isClickable
                >
                  <EChartsAreaChart.ActiveDot variant="default" />
                </EChartsAreaChart.Area>
              </EChartsAreaChart>
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
            </div>

            {/* Biểu đồ Donut Phân bổ Trạng thái (EvilCharts) */}
            {allApplications.length === 0 && !isLoadingApplications ? (
              <div className="flex min-h-64 flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <PieChartIcon className="size-6" />
                </div>
                <p className="mt-3 text-sm font-semibold text-text-main">
                  Chưa có hồ sơ ứng tuyển
                </p>
                <p className="mt-1 max-w-xs text-xs text-text-muted">
                  Biểu đồ phân bổ trạng thái sẽ tự động xuất hiện khi có ứng
                  viên nộp hồ sơ vào doanh nghiệp.
                </p>
              </div>
            ) : (
              <div className="relative mt-2 flex min-h-64 flex-1 items-center justify-center">
                <EChartsPieChart
                  data={applicationStatusData}
                  dataKey="count"
                  nameKey="status"
                  config={statusChartConfig}
                  className="h-64 w-full"
                  isLoading={isLoadingApplications}
                >
                  <EChartsPieChart.Legend isClickable verticalAlign="bottom" />
                  <EChartsPieChart.Tooltip />
                  <EChartsPieChart.Pie
                    isClickable
                    innerRadius={65}
                    paddingAngle={applicationStatusData.length > 1 ? 3 : 0}
                    cornerRadius={4}
                  />
                </EChartsPieChart>

                {!isLoadingApplications && allApplications.length > 0 && (
                  <div className="pointer-events-none absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="text-2xl font-bold tracking-tight text-text-main">
                      {allApplications.length}
                    </span>
                    <span className="block text-[10px] font-semibold text-text-muted uppercase">
                      Tổng đơn
                    </span>
                  </div>
                )}
              </div>
            )}
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
              onPreviewCv={setSelectedCvApp}
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
        <DialogContent className="w-full sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thư giới thiệu của ứng viên</DialogTitle>
            <DialogDescription>
              {selectedLetterApp
                ? `${resolveCandidateProfile(selectedLetterApp).name} • Vị trí: ${selectedLetterApp.jobTitle || selectedLetterApp.job?.title || "Ứng tuyển"}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-80 overflow-y-auto rounded-xl border border-border bg-bg p-4 text-xs leading-relaxed text-text-main sm:text-sm">
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
        <DialogContent className="w-full sm:max-w-md">
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
                className="text-xs font-semibold text-text-main"
              >
                Ghi chú nội bộ (Tùy chọn)
              </label>
              <textarea
                id="transition-note"
                rows={3}
                placeholder="Nhập ghi chú hoặc lý do chuyển trạng thái hồ sơ..."
                value={transitionNote}
                onChange={(e) => setTransitionNote(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-border bg-bg p-3 text-xs text-text-main transition-colors placeholder:text-text-muted focus:border-primary focus:bg-surface focus:outline-none"
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

      {/* Modal Xem CV Ứng Viên */}
      <ApplicationCvPreviewDialog
        application={selectedCvApp}
        onClose={() => setSelectedCvApp(null)}
      />

      {/* Modal Tạo doanh nghiệp mới */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateCompanySuccess}
      />
    </div>
  );
}
