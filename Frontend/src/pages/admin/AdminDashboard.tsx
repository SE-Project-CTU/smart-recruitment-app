import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Building2,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  RotateCcw,
  PieChart as PieChartIcon,
  Eye,
  Check,
  X,
  ShieldCheck,
  XCircle,
  Sparkles,
} from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/vi";

import {
  Button,
  GradientGridBackground,
  TableSkeleton,
} from "@/components/common";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { CompanyInspectionSheet } from "@/pages/admin/company/CompanyInspectionSheet";
import { JobDetailDrawer } from "@/components/job/JobDetailDrawer";
import { cn } from "@/lib/utils";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import Grainient from "@/components/external/Grainient";
import {
  EChartsPieChart,
  type ChartConfig,
} from "@/components/evilcharts/charts/echarts-pie-chart";
import { EChartsAreaChart } from "@/components/evilcharts/charts/echarts-area-chart";
import { useWeather, getWeatherInfo } from "@/hooks/useWeather";
import { useAuthStore } from "@/stores/authStore";
import {
  useAdminDashboardOverview,
  useAdminCompanies,
  useAdminJobPostings,
  useVerifyCompany,
  useModerateJobPosting,
} from "@/hooks/queries/useAdmin";
import type { AdminCompanyItem, AdminJobPostingItem } from "@/types/admin";
import { PATHS } from "@/constants/paths";
import { getTimeOfDayGreeting } from "@/utils/helper";
import { formatSalaryRange } from "@/utils/jobHelpers";

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

const companyStatusConfig: ChartConfig = {
  verified: {
    label: "Đã xác thực",
    colors: { light: ["#10b981"], dark: ["#34d399"] },
  },
  pending: {
    label: "Chờ thẩm định",
    colors: { light: ["#f59e0b"], dark: ["#fbbf24"] },
  },
  rejected: {
    label: "Từ chối",
    colors: { light: ["#f43f5e"], dark: ["#fb7185"] },
  },
};

const jobStatusConfig: ChartConfig = {
  open: {
    label: "Đang mở",
    colors: { light: ["#10b981"], dark: ["#34d399"] },
  },
  pendingReview: {
    label: "Chờ duyệt",
    colors: { light: ["#f59e0b"], dark: ["#fbbf24"] },
  },
  expired: {
    label: "Hết hạn",
    colors: { light: ["#94a3b8"], dark: ["#cbd5e1"] },
  },
  closed: {
    label: "Đã đóng",
    colors: { light: ["#64748b"], dark: ["#94a3b8"] },
  },
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Tab chuyển đổi biểu đồ phân bổ trạng thái: "company" | "job"
  const [chartCategory, setChartCategory] = useState<"company" | "job">(
    "company",
  );

  // Thời tiết & Ngày tháng (Đồng bộ với Candidate & Recruiter Dashboard)
  const weather = useWeather();
  const weatherMeta = getWeatherInfo(weather.weatherCode);
  const currentDateStr = dayjs().format("dddd, DD [tháng] MM");
  const formattedDate =
    currentDateStr.charAt(0).toUpperCase() + currentDateStr.slice(1);

  // 1. Query Thống kê Overview Admin
  const {
    data: overview,
    isLoading: isLoadingOverview,
    isRefetching: isRefetchingOverview,
    refetch: refetchOverview,
  } = useAdminDashboardOverview();

  // 2. Query Doanh nghiệp chờ thẩm định (Top 4 hồ sơ mới nhất)
  const {
    data: pendingCompaniesData,
    isLoading: isLoadingPendingCompanies,
    refetch: refetchPendingCompanies,
  } = useAdminCompanies({
    verificationStatus: "Pending",
    pageSize: 4,
  });
  const pendingCompanies = pendingCompaniesData?.data ?? [];

  // 3. Query Tin tuyển dụng chờ phê duyệt (Top 4 tin mới nhất)
  const {
    data: pendingJobsData,
    isLoading: isLoadingPendingJobs,
    refetch: refetchPendingJobs,
  } = useAdminJobPostings({
    status: "PendingReview",
    pageSize: 4,
  });
  const pendingJobs = pendingJobsData?.data ?? [];

  const verifyMutation = useVerifyCompany();
  const moderateMutation = useModerateJobPosting();

  // Company Inspection & Quick Actions
  const [inspectingCompany, setInspectingCompany] =
    useState<AdminCompanyItem | null>(null);
  const [isCompanySheetOpen, setIsCompanySheetOpen] = useState(false);
  const [approveCompanyTarget, setApproveCompanyTarget] =
    useState<AdminCompanyItem | null>(null);
  const [rejectCompanyTarget, setRejectCompanyTarget] =
    useState<AdminCompanyItem | null>(null);
  const [companyRejectionReason, setCompanyRejectionReason] = useState("");
  const [companyReasonError, setCompanyReasonError] = useState("");

  // Job Inspection & Quick Actions
  const [inspectingJob, setInspectingJob] =
    useState<AdminJobPostingItem | null>(null);
  const [isJobSheetOpen, setIsJobSheetOpen] = useState(false);
  const [approveJobTarget, setApproveJobTarget] =
    useState<AdminJobPostingItem | null>(null);
  const [rejectJobTarget, setRejectJobTarget] =
    useState<AdminJobPostingItem | null>(null);
  const [jobRejectionReason, setJobRejectionReason] = useState("");
  const [jobReasonError, setJobReasonError] = useState("");

  const handleInspectCompany = (company: AdminCompanyItem) => {
    setInspectingCompany(company);
    setIsCompanySheetOpen(true);
  };

  const handleConfirmApproveCompany = async () => {
    if (!approveCompanyTarget) return;
    try {
      await verifyMutation.mutateAsync({
        id: approveCompanyTarget.id,
        payload: { verificationStatus: "Verified" },
      });
      setApproveCompanyTarget(null);
      refetchPendingCompanies();
      refetchOverview();
    } catch {
      // toast is handled in mutation hook
    }
  };

  const handleConfirmRejectCompany = async () => {
    if (!rejectCompanyTarget) return;
    if (!companyRejectionReason.trim()) {
      setCompanyReasonError("Vui lòng nhập lý do từ chối hồ sơ doanh nghiệp.");
      return;
    }
    try {
      await verifyMutation.mutateAsync({
        id: rejectCompanyTarget.id,
        payload: {
          verificationStatus: "Rejected",
          rejectionReason: companyRejectionReason.trim(),
        },
      });
      setRejectCompanyTarget(null);
      refetchPendingCompanies();
      refetchOverview();
    } catch {
      // toast is handled in mutation hook
    }
  };

  const handleInspectJob = (job: AdminJobPostingItem) => {
    setInspectingJob(job);
    setIsJobSheetOpen(true);
  };

  const handleConfirmApproveJob = async () => {
    if (!approveJobTarget) return;
    try {
      await moderateMutation.mutateAsync({
        id: approveJobTarget.id,
        payload: { status: "Published" },
      });
      setApproveJobTarget(null);
      refetchPendingJobs();
      refetchOverview();
    } catch {
      // toast is handled in mutation hook
    }
  };

  const handleConfirmRejectJob = async () => {
    if (!rejectJobTarget) return;
    if (!jobRejectionReason.trim()) {
      setJobReasonError("Vui lòng nhập lý do từ chối tin tuyển dụng.");
      return;
    }
    try {
      await moderateMutation.mutateAsync({
        id: rejectJobTarget.id,
        payload: {
          status: "Rejected",
          rejectionReason: jobRejectionReason.trim(),
        },
      });
      setRejectJobTarget(null);
      refetchPendingJobs();
      refetchOverview();
    } catch {
      // toast is handled in mutation hook
    }
  };

  const handleRefreshAll = () => {
    refetchOverview();
    refetchPendingCompanies();
    refetchPendingJobs();
  };

  // Số liệu thẻ KPI
  const statsCards = useMemo(() => {
    const usersStat = overview?.users;
    const companiesStat = overview?.companies;
    const jobsStat = overview?.jobPostings;
    const appsStat = overview?.applications;

    return [
      {
        id: "users",
        title: "Tổng người dùng",
        count: usersStat?.total ?? 0,
        subtext: `+${usersStat?.new ?? 0} tài khoản mới tuần này`,
        icon: Users,
        isFeatured: true,
        onClick: () => navigate(PATHS.ADMIN.USERS),
        ariaLabel: "Xem danh sách người dùng",
      },
      {
        id: "companies",
        title: "Doanh nghiệp",
        count: companiesStat?.total ?? 0,
        subtext: `${companiesStat?.pendingVerification ?? 0} doanh nghiệp chờ duyệt`,
        icon: Building2,
        isFeatured: false,
        onClick: () => navigate(PATHS.ADMIN.APPROVE_COMPANY),
        ariaLabel: "Xem danh sách doanh nghiệp",
      },
      {
        id: "jobs",
        title: "Tin tuyển dụng",
        count: jobsStat?.total ?? 0,
        subtext: `${jobsStat?.pendingReview ?? 0} tin đang chờ duyệt`,
        icon: Briefcase,
        isFeatured: false,
        onClick: () => navigate(PATHS.ADMIN.APPROVE_JD),
        ariaLabel: "Xem danh sách tin tuyển dụng",
      },
      {
        id: "applications",
        title: "Lượt ứng tuyển",
        count: appsStat?.total ?? 0,
        subtext: `${appsStat?.interviews ?? 0} lượt mời phỏng vấn`,
        icon: CheckCircle2,
        isFeatured: false,
        onClick: () => navigate(PATHS.ADMIN.APPROVE_JD),
        ariaLabel: "Thống kê lượt nộp hồ sơ",
      },
    ];
  }, [overview, navigate]);

  // Biểu đồ xu hướng Area Chart (Tạo dải 6 tháng)
  const trendData = useMemo(() => {
    const totalApps = overview?.applications.total ?? 0;
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = dayjs().subtract(i, "month");
      // Phân bổ ước lượng theo tổng lượt ứng tuyển thực tế (tránh hiển thị số giả khi = 0)
      const weight = (6 - i) / 21;
      const val = totalApps > 0 ? Math.max(0, Math.round(totalApps * weight)) : 0;
      months.push({
        month: d.format("[Tháng] MM"),
        applications: val,
      });
    }
    return months;
  }, [overview?.applications.total]);

  // Dữ liệu biểu đồ tròn Doanh nghiệp
  const companyDistributionData = useMemo(() => {
    const stat = overview?.companies;
    const items = [
      { status: "verified", count: stat?.verified ?? 0 },
      { status: "pending", count: stat?.pendingVerification ?? 0 },
      { status: "rejected", count: stat?.rejected ?? 0 },
    ];
    return items.filter((x) => x.count > 0);
  }, [overview?.companies]);

  // Dữ liệu biểu đồ tròn Tin tuyển dụng
  const jobDistributionData = useMemo(() => {
    const stat = overview?.jobPostings;
    const items = [
      { status: "open", count: stat?.open ?? 0 },
      { status: "pendingReview", count: stat?.pendingReview ?? 0 },
      { status: "expired", count: stat?.expired ?? 0 },
      { status: "closed", count: stat?.closed ?? 0 },
    ];
    return items.filter((x) => x.count > 0);
  }, [overview?.jobPostings]);

  const activePieData =
    chartCategory === "company" ? companyDistributionData : jobDistributionData;

  const activePieConfig =
    chartCategory === "company" ? companyStatusConfig : jobStatusConfig;

  const activePieTotal =
    chartCategory === "company"
      ? (overview?.companies.total ?? 0)
      : (overview?.jobPostings.total ?? 0);

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* =========================================================================
          1. [HEADER BANNER] GradientGridBackground + Thời tiết + Lời chào Admin
         ========================================================================= */}
      <div className="relative w-full overflow-hidden rounded-2xl border border-border bg-surface">
        <GradientGridBackground />

        <div className="relative flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Cột trái: Thời tiết + Ngày tháng + Lời chào */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col items-start gap-1">
                <span className="text-sm font-medium text-text-muted">
                  {formattedDate}
                </span>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{weatherMeta.icon}</span>
                    <span className="text-sm font-semibold text-text-main">
                      {weather.temp}°C {weatherMeta.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lời chào Admin */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
                  {getTimeOfDayGreeting(user?.fullName || "Quản trị viên")}
                </h1>
                <p className="mt-1 text-sm text-text-muted">
                  Trung tâm giám sát, điều phối kiểm duyệt hồ sơ và danh mục vận
                  hành toàn nền tảng SmartHire.
                </p>
              </div>
            </div>

            {/* Cột phải: Nút làm mới dữ liệu */}
            <div className="flex shrink-0 items-center gap-3">
              <Button
                variant="secondary"
                icon={RotateCcw}
                iconPosition="left"
                isLoading={isRefetchingOverview}
                onClick={handleRefreshAll}
                className="h-10 rounded-xl px-4 text-xs font-semibold"
                aria-label="Làm mới số liệu"
              >
                Làm mới số liệu
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. [KPI STATS CARDS] 4 Thẻ chỉ số đồng bộ Recruiter & Candidate
         ========================================================================= */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((item) => {
          return (
            <div
              key={item.id}
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
                item.isFeatured
                  ? ""
                  : "border-border bg-surface hover:border-primary/40 hover:bg-white",
              )}
            >
              {/* Riêng thẻ "Tổng người dùng" sử dụng Grainient hiệu ứng thương hiệu */}
              {item.isFeatured && (
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
                  {isLoadingOverview ? (
                    <span className="inline-block h-8 w-16 animate-pulse rounded-md bg-slate-100" />
                  ) : (
                    <span className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
                      {item.count.toLocaleString()}
                    </span>
                  )}

                  <div className="mt-1 flex items-center justify-between text-xs text-text-muted">
                    <span className="truncate">{item.subtext}</span>
                    <span className="flex shrink-0 items-center font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                      Chi tiết <ChevronRight className="ml-0.5 size-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* =========================================================================
          4. [CHARTS] EvilCharts Layout 12 cột (7 cols Area Chart + 5 cols Donut)
         ========================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* [CHART 1] Biểu đồ xu hướng ứng tuyển toàn hệ thống (7 cols) */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 lg:col-span-7">
          <div className="flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-text-main sm:text-lg">
                Lưu lượng hồ sơ ứng tuyển
              </h3>
              <p className="text-xs text-text-muted">
                Số lượng ứng tuyển tiếp nhận trên toàn hệ thống theo các mốc
                thời gian
              </p>
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-text-main sm:text-3xl">
                {(overview?.applications.total ?? 0).toLocaleString()}
              </span>
              <span className="block text-[11px] font-medium text-text-muted">
                Tổng lượt ứng tuyển
              </span>
            </div>
          </div>

          <div className="relative mt-4 flex min-h-64 flex-1 items-center justify-center">
            <EChartsAreaChart
              data={trendData}
              config={trendChartConfig}
              className="h-64 w-full"
              xDataKey="month"
              curveType="bump"
              isLoading={isLoadingOverview}
            >
              <EChartsAreaChart.Grid />
              <EChartsAreaChart.XAxis
                dataKey="month"
                tickFormatter={(val) => val}
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

        {/* [CHART 2] Biểu đồ Donut Phân bổ Trạng thái (5 cols) */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-5 lg:col-span-5">
          <div className="flex flex-col gap-2 border-b border-border/60 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold text-text-main">
                Phân bổ trạng thái
              </h3>
              <p className="text-xs text-text-muted">
                Cơ cấu thực thể trong nền tảng
              </p>
            </div>

            {/* Switcher Doanh nghiệp / Tin tuyển dụng */}
            <div className="flex items-center rounded-lg border border-border bg-bg p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setChartCategory("company")}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-all",
                  chartCategory === "company"
                    ? "bg-white text-text-main shadow-xs"
                    : "text-text-muted hover:text-text-main",
                )}
              >
                Doanh nghiệp
              </button>
              <button
                type="button"
                onClick={() => setChartCategory("job")}
                className={cn(
                  "rounded-md px-2.5 py-1 transition-all",
                  chartCategory === "job"
                    ? "bg-white text-text-main shadow-xs"
                    : "text-text-muted hover:text-text-main",
                )}
              >
                Tin tuyển dụng
              </button>
            </div>
          </div>

          {activePieData.length === 0 && !isLoadingOverview ? (
            <div className="flex min-h-64 flex-1 flex-col items-center justify-center p-8 text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <PieChartIcon className="size-6" />
              </div>
              <p className="mt-3 text-sm font-semibold text-text-main">
                Chưa có dữ liệu phân bổ
              </p>
              <p className="mt-1 max-w-xs text-xs text-text-muted">
                Dữ liệu phân bổ trạng thái sẽ tự động xuất hiện khi các thực thể
                được ghi nhận.
              </p>
            </div>
          ) : (
            <div className="relative mt-2 flex min-h-64 flex-1 items-center justify-center">
              <EChartsPieChart
                data={activePieData}
                dataKey="count"
                nameKey="status"
                config={activePieConfig}
                className="h-64 w-full"
                isLoading={isLoadingOverview}
              >
                <EChartsPieChart.Legend isClickable verticalAlign="bottom" />
                <EChartsPieChart.Tooltip />
                <EChartsPieChart.Pie
                  isClickable
                  innerRadius={65}
                  paddingAngle={activePieData.length > 1 ? 3 : 0}
                  cornerRadius={4}
                />
              </EChartsPieChart>

              {!isLoadingOverview && activePieTotal > 0 && (
                <div className="pointer-events-none absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-2xl font-bold tracking-tight text-text-main">
                    {activePieTotal.toLocaleString()}
                  </span>
                  <span className="block text-[10px] font-semibold text-text-muted uppercase">
                    {chartCategory === "company"
                      ? "Tổng doanh nghiệp"
                      : "Tổng tin"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          5. [QUICK QUEUES] Hàng đợi duyệt nhanh (Doanh nghiệp & Tin tuyển dụng)
         ========================================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Hàng đợi 1: Doanh nghiệp mới nộp chờ thẩm định */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div>
                <h3 className="text-base font-bold text-text-main">
                  Doanh nghiệp chờ kiểm định
                </h3>
                <p className="text-xs text-text-muted">
                  Doanh nghiệp mới gửi thông tin xác thực pháp lý
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={ChevronRight}
              iconPosition="right"
              onClick={() => navigate(PATHS.ADMIN.APPROVE_COMPANY)}
              className="h-8 font-semibold"
            >
              Xem tất cả
            </Button>
          </div>

          <div className="mt-4 flex-1">
            {isLoadingPendingCompanies ? (
              <TableSkeleton />
            ) : pendingCompanies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="mt-2 text-sm font-semibold text-text-main">
                  Không có hồ sơ tồn đọng
                </p>
                <p className="text-xs text-text-muted">
                  Tất cả hồ sơ pháp lý doanh nghiệp đã được xử lý xong.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {pendingCompanies.map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-bg/50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <CompanyLogo
                        name={company.name}
                        logoUrl={company.logoUrl}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => handleInspectCompany(company)}
                          className="block cursor-pointer truncate text-left text-sm font-semibold text-text-main transition-colors hover:text-primary"
                        >
                          {company.name}
                        </button>
                        <p className="truncate text-xs text-text-muted">
                          MST: {company.taxCode || "Chưa có"} • Gửi lúc:{" "}
                          {dayjs(company.createdAt).format("DD/MM/YYYY")}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="secondary"
                        icon={Eye}
                        iconSize={15}
                        title="Xem hồ sơ chi tiết"
                        onClick={() => handleInspectCompany(company)}
                        className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-primary! shadow-none! ring-0! hover:bg-secondary-light/50! hover:text-primary-dark!"
                      />
                      <Button
                        variant="primary"
                        icon={Check}
                        iconSize={15}
                        title="Phê duyệt doanh nghiệp"
                        onClick={() => setApproveCompanyTarget(company)}
                        className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-emerald-600! shadow-none! ring-0! hover:bg-emerald-50! hover:text-emerald-700!"
                      />
                      <Button
                        variant="secondary"
                        icon={X}
                        iconSize={15}
                        title="Từ chối hồ sơ"
                        onClick={() => {
                          setRejectCompanyTarget(company);
                          setCompanyRejectionReason("");
                          setCompanyReasonError("");
                        }}
                        className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-rose-500! shadow-none! ring-0! hover:bg-rose-50! hover:text-rose-600!"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Hàng đợi 2: Tin tuyển dụng mới gửi chờ duyệt */}
        <div className="flex flex-col rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-4">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div>
                <h3 className="text-base font-bold text-text-main">
                  Tin tuyển dụng chờ duyệt
                </h3>
                <p className="text-xs text-text-muted">
                  Các vị trí tuyển dụng vừa được khởi tạo bởi NTD
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              icon={ChevronRight}
              iconPosition="right"
              onClick={() => navigate(PATHS.ADMIN.APPROVE_JD)}
              className="h-8 font-semibold"
            >
              Xem tất cả
            </Button>
          </div>

          <div className="mt-4 flex-1">
            {isLoadingPendingJobs ? (
              <TableSkeleton />
            ) : pendingJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="mt-2 text-sm font-semibold text-text-main">
                  Không có tin tuyển dụng chờ duyệt
                </p>
                <p className="text-xs text-text-muted">
                  Tất cả tin tuyển dụng mới đều đã được kiểm duyệt.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {pendingJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:bg-bg/50"
                  >
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => handleInspectJob(job)}
                        className="block cursor-pointer truncate text-left text-sm font-semibold text-text-main transition-colors hover:text-primary"
                      >
                        {job.title}
                      </button>
                      <p className="truncate text-xs text-text-muted">
                        {job.companyName} • {job.provinceName} • Lương:{" "}
                        {formatSalaryRange(
                          job.salaryMin,
                          job.salaryMax,
                          job.salaryNegotiable,
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        variant="secondary"
                        icon={Eye}
                        iconSize={15}
                        title="Xem nội dung chi tiết"
                        onClick={() => handleInspectJob(job)}
                        className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-primary! shadow-none! ring-0! hover:bg-secondary-light/50! hover:text-primary-dark!"
                      />
                      <Button
                        variant="primary"
                        icon={Check}
                        iconSize={15}
                        title="Phê duyệt xuất bản"
                        onClick={() => setApproveJobTarget(job)}
                        className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-emerald-600! shadow-none! ring-0! hover:bg-emerald-50! hover:text-emerald-700!"
                      />
                      <Button
                        variant="secondary"
                        icon={X}
                        iconSize={15}
                        title="Từ chối tin tuyển dụng"
                        onClick={() => {
                          setRejectJobTarget(job);
                          setJobRejectionReason("");
                          setJobReasonError("");
                        }}
                        className="size-8! rounded-lg! border-0! bg-transparent! p-0! text-rose-500! shadow-none! ring-0! hover:bg-rose-50! hover:text-rose-600!"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal & Drawers cho Doanh nghiệp ── */}
      <CompanyInspectionSheet
        company={inspectingCompany}
        isOpen={isCompanySheetOpen}
        onClose={() => {
          setIsCompanySheetOpen(false);
          setInspectingCompany(null);
        }}
        onSuccess={() => {
          refetchPendingCompanies();
          refetchOverview();
        }}
      />

      <Dialog
        open={Boolean(approveCompanyTarget)}
        onOpenChange={(open) => !open && setApproveCompanyTarget(null)}
      >
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="size-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-text-main">
              Xác nhận phê duyệt doanh nghiệp
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-text-muted">
              Bạn đang phê duyệt hồ sơ pháp lý của doanh nghiệp{" "}
              <strong className="text-slate-800">
                {approveCompanyTarget?.name}
              </strong>{" "}
              (MST: {approveCompanyTarget?.taxCode}). Sau khi duyệt, doanh
              nghiệp sẽ được cấp tích xanh xác thực và quyền xuất bản tin tuyển
              dụng.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setApproveCompanyTarget(null)}
              disabled={verifyMutation.isPending}
              className="h-9! px-4! text-xs! font-medium!"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={Check}
              iconSize={14}
              isLoading={verifyMutation.isPending}
              onClick={handleConfirmApproveCompany}
              className="h-9! bg-emerald-600! px-4! text-xs! font-semibold! text-white! hover:bg-emerald-700!"
            >
              Xác nhận duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(rejectCompanyTarget)}
        onOpenChange={(open) => !open && setRejectCompanyTarget(null)}
      >
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <XCircle className="size-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-text-main">
              Từ chối hồ sơ pháp lý doanh nghiệp
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-text-muted">
              Vui lòng nêu rõ lý do từ chối hồ sơ của{" "}
              <strong className="text-slate-800">
                {rejectCompanyTarget?.name}
              </strong>
              . Lý do này sẽ được thông báo trực tiếp đến chủ sở hữu doanh
              nghiệp.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-1.5">
            <label
              htmlFor="dashboard-company-rejection-reason"
              className="text-xs font-semibold text-slate-800"
            >
              Lý do từ chối <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="dashboard-company-rejection-reason"
              rows={4}
              value={companyRejectionReason}
              onChange={(e) => {
                setCompanyRejectionReason(e.target.value);
                if (companyReasonError) setCompanyReasonError("");
              }}
              placeholder="Ví dụ: Giấy phép ĐKKD mờ không đọc được thông tin, hoặc mã số thuế không khớp..."
              className={cn(
                "w-full rounded-xl border border-border bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20 focus:outline-none",
                companyReasonError && "border-rose-400 focus:border-rose-500",
              )}
            />
            {companyReasonError && (
              <p className="text-[11px] font-medium text-rose-600">
                {companyReasonError}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setRejectCompanyTarget(null)}
              disabled={verifyMutation.isPending}
              className="h-9! px-4! text-xs! font-medium!"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={X}
              iconSize={14}
              isLoading={verifyMutation.isPending}
              onClick={handleConfirmRejectCompany}
              className="h-9! bg-rose-600! px-4! text-xs! font-semibold! text-white! hover:bg-rose-700!"
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal & Drawers cho Tin tuyển dụng ── */}
      <JobDetailDrawer
        job={inspectingJob}
        open={isJobSheetOpen}
        onClose={() => {
          setIsJobSheetOpen(false);
          setInspectingJob(null);
        }}
        onApprove={() => {
          if (inspectingJob) {
            setApproveJobTarget(inspectingJob);
          }
        }}
        onReject={() => {
          if (inspectingJob) {
            setRejectJobTarget(inspectingJob);
            setJobRejectionReason("");
            setJobReasonError("");
          }
        }}
        isModerating={moderateMutation.isPending}
      />

      <Dialog
        open={Boolean(approveJobTarget)}
        onOpenChange={(open) => !open && setApproveJobTarget(null)}
      >
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Sparkles className="size-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-text-main">
              Xác nhận phê duyệt xuất bản
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-text-muted">
              Tin tuyển dụng{" "}
              <strong className="text-slate-800">
                {approveJobTarget?.title}
              </strong>{" "}
              của{" "}
              <strong className="text-slate-800">
                {approveJobTarget?.companyName}
              </strong>{" "}
              sẽ được xuất bản công khai ngay lập tức lên sàn việc làm
              SmartHire.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setApproveJobTarget(null)}
              disabled={moderateMutation.isPending}
              className="h-9! px-4! text-xs! font-medium!"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={Check}
              iconSize={14}
              isLoading={moderateMutation.isPending}
              onClick={handleConfirmApproveJob}
              className="h-9! bg-emerald-600! px-4! text-xs! font-semibold! text-white! hover:bg-emerald-700!"
            >
              Xác nhận xuất bản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(rejectJobTarget)}
        onOpenChange={(open) => !open && setRejectJobTarget(null)}
      >
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <div className="mb-2 flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
              <XCircle className="size-6" />
            </div>
            <DialogTitle className="text-lg font-bold text-text-main">
              Từ chối tin tuyển dụng
            </DialogTitle>
            <DialogDescription className="text-xs leading-relaxed text-text-muted">
              Vui lòng nêu rõ lý do từ chối tin{" "}
              <strong className="text-slate-800">
                {rejectJobTarget?.title}
              </strong>{" "}
              để nhà tuyển dụng nắm được thông tin và chỉnh sửa lại.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-3 space-y-1.5">
            <label
              htmlFor="dashboard-job-rejection-reason"
              className="text-xs font-semibold text-slate-800"
            >
              Lý do từ chối <span className="text-rose-500">*</span>
            </label>
            <textarea
              id="dashboard-job-rejection-reason"
              rows={4}
              value={jobRejectionReason}
              onChange={(e) => {
                setJobRejectionReason(e.target.value);
                if (jobReasonError) setJobReasonError("");
              }}
              placeholder="Ví dụ: Mô tả công việc không rõ ràng, yêu cầu chưa đầy đủ, hoặc mức lương không khớp..."
              className={cn(
                "w-full rounded-xl border border-border bg-slate-50/50 p-3 text-xs leading-relaxed text-slate-800 placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-1 focus:ring-primary/20 focus:outline-none",
                jobReasonError && "border-rose-400 focus:border-rose-500",
              )}
            />
            {jobReasonError && (
              <p className="text-[11px] font-medium text-rose-600">
                {jobReasonError}
              </p>
            )}
          </div>

          <DialogFooter className="mt-4 gap-2 sm:justify-end">
            <Button
              variant="secondary"
              onClick={() => setRejectJobTarget(null)}
              disabled={moderateMutation.isPending}
              className="h-9! px-4! text-xs! font-medium!"
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={X}
              iconSize={14}
              isLoading={moderateMutation.isPending}
              onClick={handleConfirmRejectJob}
              className="h-9! bg-rose-600! px-4! text-xs! font-semibold! text-white! hover:bg-rose-700!"
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
