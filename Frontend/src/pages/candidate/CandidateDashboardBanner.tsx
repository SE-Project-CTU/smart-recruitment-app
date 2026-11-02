import dayjs from "dayjs";
import "dayjs/locale/vi";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Calendar,
  CheckCheck,
  CheckCircle2,
  Clock,
  Ellipsis,
  Eye,
  FileCheck,
  Gift,
  MapPin,
  Send,
  Undo2,
  XCircle,
  Bookmark,
} from "lucide-react";
import { useWeather, getWeatherInfo } from "@/hooks/useWeather";
import { useAuthStore } from "@/stores/authStore";
import { useMyApplications } from "@/hooks/queries/useApplication";
import { useMyCvs } from "@/hooks/queries/useCv";
import { PATHS } from "@/constants/paths";
import { getTimeAgo } from "@/utils/helper";
import { Button, GradientBackground } from "@/components/common";
import {
  getJobLevelLabel,
  getJobTypeLabel,
  getWorkModeLabel,
} from "@/utils/jobHelpers";
import { EmptyStreet } from "@/assets/images/decoration";

dayjs.locale("vi");

interface ApplicationStatusTheme {
  label: string;
  badgeClass: string;
  iconBg: string;
  iconColor: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const getApplicationStatusTheme = (status?: string): ApplicationStatusTheme => {
  switch (status?.toUpperCase()) {
    case "REVIEWING":
      return {
        label: "Đang xem xét",
        badgeClass: "bg-sky-50 text-sky-700 border-sky-200",
        iconBg: "bg-sky-100 text-sky-700",
        iconColor: "text-sky-700",
        icon: Eye,
        description: "Nhà tuyển dụng đang duyệt hồ sơ của bạn",
      };
    case "SHORTLISTED":
      return {
        label: "Đã chọn lọc",
        badgeClass: "bg-indigo-50 text-indigo-700 border-indigo-200",
        iconBg: "bg-indigo-100 text-indigo-700",
        iconColor: "text-indigo-700",
        icon: CheckCheck,
        description: "Hồ sơ của bạn đã lọt vào danh sách tiềm năng",
      };
    case "INTERVIEW":
    case "INTERVIEWING":
      return {
        label: "Mời phỏng vấn",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        iconBg: "bg-amber-100 text-amber-700",
        iconColor: "text-amber-700",
        icon: Calendar,
        description: "Nhà tuyển dụng đã gửi lời mời phỏng vấn",
      };
    case "OFFERED":
      return {
        label: "Mời nhận việc",
        badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
        iconBg: "bg-purple-100 text-purple-700",
        iconColor: "text-purple-700",
        icon: Gift,
        description: "Bạn đã nhận được lời mời làm việc (Offer)",
      };
    case "HIRED":
    case "ACCEPTED":
      return {
        label: "Đã tuyển dụng",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        iconBg: "bg-emerald-100 text-emerald-700",
        iconColor: "text-emerald-700",
        icon: CheckCircle2,
        description: "Chúc mừng! Bạn đã trúng tuyển vị trí này",
      };
    case "REJECTED":
      return {
        label: "Từ chối",
        badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
        iconBg: "bg-rose-100 text-rose-700",
        iconColor: "text-rose-700",
        icon: XCircle,
        description: "Hồ sơ chưa phù hợp với đợt tuyển dụng này",
      };
    case "WITHDRAWN":
      return {
        label: "Đã rút hồ sơ",
        badgeClass: "bg-zinc-100 text-zinc-600 border-zinc-200",
        iconBg: "bg-zinc-100 text-zinc-600",
        iconColor: "text-zinc-600",
        icon: Undo2,
        description: "Bạn đã chủ động rút hồ sơ ứng tuyển này",
      };
    case "SUBMITTED":
    case "RECEIVED":
    case "APPLIED":
    default:
      return {
        label: "Đã nộp hồ sơ",
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
        iconBg: "bg-slate-100 text-slate-700",
        iconColor: "text-slate-700",
        icon: Send,
        description: "Hồ sơ đã gửi thành công, đang chờ tiếp nhận",
      };
  }
};

export function CandidateDashboardBanner() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const userName = user?.fullName || "Ứng viên";

  // 1. Dữ liệu Thời tiết
  const weather = useWeather();
  const weatherMeta = getWeatherInfo(weather.weatherCode);

  // 2. Dữ liệu thật từ Backend: Ứng tuyển & CVs
  const { data: applicationsData, isLoading: isLoadingApps } =
    useMyApplications({
      pageSize: 20,
    });
  const { data: cvsData } = useMyCvs();

  const applications = applicationsData?.items ?? [];
  const cvs = cvsData?.items ?? [];

  // Lấy đơn ứng tuyển mới nhất
  const latestApplication = applications.length > 0 ? applications[0] : null;

  // Số lượng đơn nộp đang xử lý (không tính REJECTED hoặc WITHDRAWN)
  const activeApplicationsCount = applications.filter(
    (app) => app.status !== "REJECTED" && app.status !== "WITHDRAWN",
  ).length;

  // Lấy số lượng job đã bookmark từ localStorage
  const bookmarkedJobsCount = (() => {
    try {
      const stored = localStorage.getItem("candidate_bookmarked_jobs");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.length;
      }
    } catch {
      // ignore
    }
    return 4; // Mock fallback
  })();

  // Ngày tháng format tiếng Việt: "Thứ tư, 28 tháng 10"
  const currentDateStr = dayjs().format("dddd, DD [tháng] MM");
  const formattedDate =
    currentDateStr.charAt(0).toUpperCase() + currentDateStr.slice(1);

  // Thứ trong tuần dạng chữ đồng bộ (ví dụ: "Thứ tư", "Chủ nhật")
  const dayOfWeekStr = dayjs().format("dddd");
  const formattedDayOfWeek =
    dayOfWeekStr.charAt(0).toUpperCase() + dayOfWeekStr.slice(1);

  // Theme trạng thái ứng tuyển của job gần nhất
  const statusTheme = getApplicationStatusTheme(latestApplication?.status);

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-border p-6 shadow-2xs lg:p-8">
      <GradientBackground />
      <div className="relative flex flex-col justify-between md:flex-row">
        <div className="flex flex-col gap-6">
          {/* 1. KHỐI THỜI TIẾT + NGÀY THÁNG */}
          <div className="flex flex-col items-start justify-center gap-1">
            <span className="text-sm text-text-muted">{formattedDate}</span>
            <div className="inline-flex items-center gap-2 text-lg font-medium text-text-main">
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

          {/* 2. KHỐI LỜI CHÀO */}
          <div className="space-y-1.5">
            <h1 className="text-2xl font-medium tracking-tight text-text-main sm:text-3xl">
              {formattedDayOfWeek} tốt lành, {userName}!
            </h1>
            <p className="text-xs leading-relaxed text-text-muted sm:text-sm">
              Hôm nay có nhiều cơ hội việc làm mới phù hợp với định hướng nghề
              nghiệp của bạn.
            </p>
          </div>

          {/* 3. KHỐI 3 THẺ STATS (Đổ dữ liệu thật) */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {/* Stat 1: Đang ứng tuyển */}
            <div
              onClick={() => navigate(PATHS.CANDIDATE.APPLICATION_STATUS)}
              className="flex cursor-pointer flex-col rounded-2xl border border-border bg-surface p-3.5 transition-all hover:border-primary/40 hover:bg-white hover:shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-blue-600">
                <Send className="size-3.5 sm:size-4" />
                <span className="truncate text-[11px] font-semibold text-text-muted">
                  Đang ứng tuyển
                </span>
              </div>
              <span className="mt-2 text-xl font-bold text-text-main sm:text-2xl">
                {isLoadingApps
                  ? "..."
                  : String(activeApplicationsCount).padStart(2, "0")}
              </span>
            </div>

            {/* Stat 2: CV hiện có */}
            <div
              onClick={() => navigate(PATHS.CANDIDATE.CV_MANAGEMENT)}
              className="flex cursor-pointer flex-col rounded-2xl border border-border bg-surface p-3.5 transition-all hover:border-primary/40 hover:bg-white hover:shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-emerald-600">
                <FileCheck className="size-3.5 sm:size-4" />
                <span className="truncate text-[11px] font-semibold text-text-muted">
                  CV hiện có
                </span>
              </div>
              <span className="mt-2 text-xl font-bold text-text-main sm:text-2xl">
                {String(cvs.length).padStart(2, "0")}
              </span>
            </div>

            {/* Stat 3: Đã lưu */}
            <div
              onClick={() => navigate(PATHS.CANDIDATE.BOOKMARK_JOBS)}
              className="flex cursor-pointer flex-col rounded-2xl border border-border bg-surface p-3.5 transition-all hover:border-primary/40 hover:bg-white hover:shadow-xs"
            >
              <div className="flex items-center gap-1.5 text-amber-600">
                <Bookmark className="size-3.5 sm:size-4" />
                <span className="truncate text-[11px] font-semibold text-text-muted">
                  Đã lưu
                </span>
              </div>
              <span className="mt-2 text-xl font-bold text-text-main sm:text-2xl">
                {String(bookmarkedJobsCount).padStart(2, "0")}
              </span>
            </div>
          </div>
        </div>

        {/* ================= CỘT PHẢI: CARD CÔNG VIỆC ỨNG TUYỂN GẦN NHẤT (Chiếm 5/12) ================= */}
        {latestApplication ? (
          <div
            onClick={() => navigate(PATHS.CANDIDATE.APPLICATION_STATUS)}
            className="group relative flex cursor-pointer flex-col justify-between rounded-3xl border border-border bg-surface p-6 shadow-xs transition-all duration-300 hover:border-sky-400 hover:bg-linear-to-b hover:from-sky-50/50 hover:to-sky-200 lg:col-span-5"
          >
            <div>
              {/* 1. Header chuẩn JobCard: Mức lương bên trái, nhãn "Đơn gần nhất" và action bên phải */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-semibold tracking-tight text-text-main">
                    {latestApplication.salaryRange || "Thỏa thuận"}
                  </span>
                  {!latestApplication.salaryRange?.includes("Thỏa thuận") && (
                    <span className="text-xs font-semibold text-text-muted">
                      /tháng
                    </span>
                  )}
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    Ứng tuyển gần đây
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(PATHS.CANDIDATE.APPLICATION_STATUS);
                    }}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:text-text-main"
                    title="Xem chi tiết đơn ứng tuyển"
                  >
                    <Ellipsis className="size-5" />
                  </button>
                </div>
              </div>

              {/* 2. Tiêu đề công việc + Tên công ty + Logo chuẩn JobCard */}
              <div className="mt-5 flex items-start justify-between gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <h3
                    title={latestApplication.jobTitle}
                    className="line-clamp-1 text-base leading-snug font-semibold text-text-main transition-colors group-hover:text-primary"
                  >
                    {latestApplication.jobTitle || "Vị trí tuyển dụng"}
                  </h3>
                  <p className="truncate text-xs font-medium text-text-muted">
                    {latestApplication.companyName || "Doanh nghiệp"}
                  </p>
                </div>

                <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2">
                  {latestApplication.companyLogoUrl ? (
                    <img
                      src={latestApplication.companyLogoUrl}
                      alt={latestApplication.companyName || "Logo"}
                      className="size-full object-contain"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      {(latestApplication.companyName || "DN")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Địa điểm + Thời gian đã nộp */}
              <div className="mt-4 flex flex-col gap-1.5 text-xs font-medium text-text-muted">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-text-muted" />
                  <span className="truncate">
                    {latestApplication.locationName ||
                      latestApplication.job?.province?.name ||
                      "Toàn quốc"}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="size-4 shrink-0 text-text-muted" />
                  <span>Đã nộp: {getTimeAgo(latestApplication.appliedAt)}</span>
                </div>
              </div>

              {/* 4. Tags hình thức, mô hình và cấp bậc chuẩn JobCard */}
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs text-text-main">
                  {getJobTypeLabel(latestApplication.job?.jobType)}
                </span>
                <span className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs text-text-main">
                  {getWorkModeLabel(latestApplication.job?.workMode)}
                </span>
                {latestApplication.job?.jobLevel && (
                  <span className="rounded-full border border-border bg-white/70 px-3 py-1 text-xs text-text-main">
                    {getJobLevelLabel(latestApplication.job.jobLevel)}
                  </span>
                )}
              </div>
            </div>

            {/* 5. VỊ TRÍ NÚT ỨNG TUYỂN & LƯU CỦA JOBCARD ĐƯỢC THAY BẰNG TRẠNG THÁI ĐƠN ĐẦY ĐỦ */}
            <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-white/90 p-3 shadow-2xs backdrop-blur-xs">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusTheme.badgeClass}`}
                    >
                      {statusTheme.label}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] text-text-muted">
                    {statusTheme.description}
                  </p>
                </div>
              </div>

              <Button
                icon={ArrowUpRight}
                iconSize={16}
                variant="secondary"
                className="p-1!"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(PATHS.CANDIDATE.APPLICATION_STATUS);
                }}
              />
            </div>
          </div>
        ) : (
          /* Empty state khi chưa có đơn nào */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-border bg-surface p-6 text-center shadow-xs lg:col-span-5">
            <img src={EmptyStreet} alt="" />
            <h3 className="mt-3 text-sm font-semibold text-text-main">
              Chưa có hồ sơ ứng tuyển nào
            </h3>

            <button
              type="button"
              onClick={() => navigate(PATHS.CANDIDATE.SEARCH_JOBS)}
              className="mt-5 flex cursor-pointer items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-primary-dark"
            >
              <span>Khám phá việc làm</span>
              <ArrowUpRight className="size-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default CandidateDashboardBanner;
