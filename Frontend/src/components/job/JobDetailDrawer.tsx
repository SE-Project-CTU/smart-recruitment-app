import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Share2,
  Zap,
  ExternalLink,
  Award,
  Layers,
  Clock,
  Check,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import { Button } from "@/components/common";
import { UserAvatar } from "@/components/common/UserAvatar";
import { Skeleton } from "@/components/ui/skeleton";
import { getLoremAvt } from "@/utils/helper";
import {
  extractJobDisplayData,
  getEducationLevelLabel,
  getJobStatusBadge,
} from "@/utils/jobHelpers";
import { toast } from "@/hooks/use-toast";
import { PATHS } from "@/constants/paths";
import {
  useApplyJobModalStore,
  type AnyJob,
} from "@/stores/applyJobModalStore";
import { useAuthStore } from "@/stores/authStore";
import {
  useBookmarkJob,
  useUnbookmarkJob,
  useMyBookmarkedJobs,
  useJobPostingDetail,
} from "@/hooks/queries/useJob";
import { useMyApplications } from "@/hooks/queries/useApplication";
import type {
  JobPostingDetailResult,
  JobPostingItem,
  JobPostingResult,
  JobPostingSearchItem,
} from "@/types/job";
import type { AdminJobPostingItem } from "@/types/admin";
import type { MockJobPosting } from "@/constants/mockData";
import { cn } from "@/lib/utils";

export type JobDrawerItem =
  | JobPostingItem
  | JobPostingDetailResult
  | JobPostingResult
  | JobPostingSearchItem
  | AdminJobPostingItem
  | MockJobPosting
  | AnyJob;

export interface JobDetailDrawerProps<T extends JobDrawerItem = JobDrawerItem> {
  job: T | null;
  open: boolean;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  // Custom moderation actions for Admin / Recruiter
  footer?: React.ReactNode;
  onApprove?: (jobId: string) => void;
  onReject?: (jobId: string) => void;
  isModerating?: boolean;
}

export function JobDetailDrawer<T extends JobDrawerItem = JobDrawerItem>({
  job,
  open,
  onClose,
  isBookmarked: externalIsBookmarked,
  onToggleBookmark,
  onApply,
  footer,
  onApprove,
  onReject,
  isModerating = false,
}: JobDetailDrawerProps<T>) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const { openApplyModal } = useApplyJobModalStore();
  const { user } = useAuthStore();
  const isCandidate = Boolean(user?.roles?.includes("Candidate"));

  // Tải chi tiết tin tuyển dụng nếu có ID
  const { data: detailData, isLoading: isLoadingDetail } = useJobPostingDetail(
    open && job?.id ? job.id : undefined,
  );

  const { data: myAppsData } = useMyApplications({ pageSize: 50 });
  const myApplications = myAppsData?.items ?? [];

  const { data: bookmarkedData } = useMyBookmarkedJobs(
    { pageSize: 100 },
    { enabled: isCandidate && open && externalIsBookmarked === undefined },
  );

  const bookmarkMutation = useBookmarkJob();
  const unbookmarkMutation = useUnbookmarkJob();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!job) return null;

  // Hợp nhất dữ liệu chi tiết khi query thành công
  const activeJob = (
    detailData ? { ...job, ...detailData } : job
  ) as unknown as AnyJob & {
    status?: string;
    educationLevel?: string | null;
    industries?: Array<{ name: string } | string>;
    creator?: { id: string; fullName: string; email: string; avatarUrl?: string | null } | null;
    rejectionReason?: string | null;
  };

  const data = extractJobDisplayData(activeJob);

  const isAlreadyApplied = Boolean(
    job &&
    (("hasApplied" in activeJob && activeJob.hasApplied) ||
      myApplications.some((app) => app.jobId === job.id)),
  );

  const isMarked =
    externalIsBookmarked !== undefined
      ? externalIsBookmarked
      : "isBookmarked" in activeJob && activeJob.isBookmarked !== undefined
        ? Boolean(activeJob.isBookmarked)
        : Boolean(bookmarkedData?.items?.some((b) => b.id === job.id));

  // Trạng thái tin
  const statusInfo = activeJob.status ? getJobStatusBadge(activeJob.status) : null;
  const statusBadgeStyle = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    error: "border-rose-200 bg-rose-50 text-rose-700",
    neutral: "border-slate-200 bg-slate-100 text-slate-700",
    info: "border-sky-200 bg-sky-50 text-sky-700",
  }[statusInfo?.variant ?? "neutral"];

  // Danh sách ngành nghề
  const industriesList = Array.isArray(activeJob.industries)
    ? activeJob.industries.map((ind) => (typeof ind === "string" ? ind : ind.name))
    : [];

  // Trình độ học vấn
  const educationLabel =
    getEducationLevelLabel(activeJob.educationLevel) || "Không yêu cầu";

  const handleApplyClick = () => {
    if (onApply) {
      onApply(job.id);
    } else {
      openApplyModal(job);
    }
  };

  const handleBookmarkClick = () => {
    if (onToggleBookmark) {
      onToggleBookmark(job.id);
      return;
    }

    if (!isCandidate) {
      toast.warning({
        description: "Bạn không có quyền thực hiện thao tác này!",
      });
      return;
    }

    if (isMarked) {
      unbookmarkMutation.mutate(job.id);
    } else {
      bookmarkMutation.mutate(job.id);
    }
  };

  const handleShareClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success({ description: "Đã sao chép liên kết tin tuyển dụng." });
    } catch {
      toast.warning({ description: "Không thể sao chép liên kết." });
    }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? "flex h-[90vh] max-h-[92vh] w-full flex-col gap-0 rounded-t-2xl border-t border-border bg-surface p-0 shadow-2xl backdrop-blur-none"
            : "flex w-full min-w-120 flex-col gap-0 overflow-hidden p-0 pt-10 backdrop-blur-none sm:max-w-lg"
        }
      >
        {isMobile && (
          <div className="flex w-full justify-center pt-3 pb-1">
            <div className="h-1.5 w-12 rounded-full bg-border" />
          </div>
        )}

        {/* HEADER */}
        <SheetHeader className="shrink-0 border-b border-border p-5 pb-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2 shadow-2xs">
                <img
                  src={data.companyLogoUrl || getLoremAvt(data.companyName)}
                  alt={data.companyName}
                  className="size-full object-contain"
                  loading="lazy"
                  onError={(event) => {
                    const fallback = getLoremAvt(data.companyName);
                    const img = event.currentTarget;
                    if (img.src !== new URL(fallback, img.baseURI).href) {
                      img.onerror = null;
                      img.src = fallback;
                    }
                  }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <SheetTitle className="text-base leading-snug font-semibold text-text-main">
                    {job.title}
                  </SheetTitle>
                  {statusInfo && (
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                        statusBadgeStyle,
                      )}
                    >
                      {statusInfo.label}
                    </span>
                  )}
                </div>

                <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                  <span className="font-medium text-text-main">
                    {data.companyName}
                  </span>
                  {data.isCompanyVerified && (
                    <CheckCircle2 className="size-3.5 text-status-success" />
                  )}
                  {data.companyId && (
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <a
                            href={PATHS.COMPANY_DETAIL.replace(
                              ":id",
                              data.companyId!,
                            )}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex size-5 cursor-pointer items-center justify-center rounded text-text-muted transition-colors hover:text-primary"
                            aria-label="Xem trang công ty (mở tab mới)"
                          >
                            <ExternalLink className="size-3.5" />
                          </a>
                        }
                      />
                      <TooltipPanel>
                        Xem trang công ty (mở tab mới)
                      </TooltipPanel>
                    </Tooltip>
                  )}
                </div>
              </div>
            </div>

            {data.aiScore != null && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary-dark">
                      <Zap className="size-3" />
                      <span>{data.aiScore}%</span>
                    </div>
                  }
                />
                <TooltipPanel>Độ tương thích hồ sơ</TooltipPanel>
              </Tooltip>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-3.5">
            <div>
              <p className="text-[10px] text-text-muted">Mức lương</p>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-xs font-semibold text-primary sm:text-sm">
                  {data.salaryText}
                </span>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-text-muted">Đăng lúc</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-text-main sm:text-sm">
                {data.displayCreatedAt}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-text-muted">Hạn nộp</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-text-main sm:text-sm">
                {data.formattedDeadline || "Không giới hạn"}
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* BODY */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5 pb-6">
          {/* Cảnh báo lý do từ chối nếu có */}
          {Boolean(activeJob.rejectionReason) && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-800">
              <div className="mb-1 flex items-center gap-1.5 font-semibold text-rose-900">
                <AlertTriangle className="size-4 shrink-0 text-rose-600" />
                <span>Lý do từ chối kiểm duyệt</span>
              </div>
              <p className="whitespace-pre-line text-rose-700">
                {activeJob.rejectionReason}
              </p>
            </div>
          )}

          {/* Quick Specs Grid đầy đủ thông số */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-bg/60 p-2.5">
              <div className="text-primary shrink-0">
                <Briefcase className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted">Kinh nghiệm</p>
                <p className="truncate text-xs font-semibold text-text-main">
                  {data.expYears > 0 ? `${data.expYears} năm` : "Không yêu cầu"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-bg/60 p-2.5">
              <div className="text-primary shrink-0">
                <Users className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted">Số lượng</p>
                <p className="truncate text-xs font-semibold text-text-main">
                  {data.vacanciesCount} người
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-bg/60 p-2.5">
              <div className="text-primary shrink-0">
                <Award className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted">Cấp bậc</p>
                <p className="truncate text-xs font-semibold text-text-main">
                  {data.jobLevelLabel || "Nhân viên"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-bg/60 p-2.5">
              <div className="text-primary shrink-0">
                <GraduationCap className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted">Trình độ học vấn</p>
                <p className="truncate text-xs font-semibold text-text-main">
                  {educationLabel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-bg/60 p-2.5">
              <div className="text-primary shrink-0">
                <Clock className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted">Hình thức</p>
                <p className="truncate text-xs font-semibold text-text-main">
                  {data.jobTypeLabel || "Toàn thời gian"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-bg/60 p-2.5">
              <div className="text-primary shrink-0">
                <Layers className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted">Chế độ làm việc</p>
                <p className="truncate text-xs font-semibold text-text-main">
                  {data.workModeText}
                </p>
              </div>
            </div>

            <div className="col-span-2 flex items-center gap-2.5 rounded-xl border border-border bg-bg/60 p-2.5">
              <div className="text-primary shrink-0">
                <MapPin className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted">Khu vực</p>
                <p className="truncate text-xs font-semibold text-text-main">
                  {data.provinceName}
                </p>
              </div>
            </div>
          </div>

          {/* Ngành nghề */}
          {industriesList.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
                Ngành nghề tuyển dụng
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {industriesList.map((ind) => (
                  <span
                    key={ind}
                    className="rounded-lg border border-border bg-bg/70 px-2.5 py-1 text-xs font-medium text-text-main"
                  >
                    {ind}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Kỹ năng chuyên môn */}
          {data.skillList.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
                Kỹ năng chuyên môn
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {data.skillList.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-border bg-bg/70 px-2.5 py-1 text-xs font-medium text-text-main capitalize"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Nội dung chi tiết hoặc Skeleton khi đang tải */}
          {isLoadingDetail && !data.description ? (
            <div className="space-y-4 pt-2">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ) : (
            <>
              {data.description && (
                <section>
                  <h4 className="mb-1.5 text-xs font-semibold tracking-wider text-text-muted uppercase">
                    Mô tả công việc
                  </h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-text-main sm:text-sm">
                    {data.description}
                  </p>
                </section>
              )}

              {data.requirements && (
                <section>
                  <h4 className="mb-1.5 text-xs font-semibold tracking-wider text-text-muted uppercase">
                    Yêu cầu ứng viên
                  </h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-text-main sm:text-sm">
                    {data.requirements}
                  </p>
                </section>
              )}

              {data.benefits && (
                <section>
                  <h4 className="mb-1.5 text-xs font-semibold tracking-wider text-text-muted uppercase">
                    Quyền lợi & Đãi ngộ
                  </h4>
                  <p className="text-xs leading-relaxed whitespace-pre-line text-text-main sm:text-sm">
                    {data.benefits}
                  </p>
                </section>
              )}
            </>
          )}

          {/* Địa chỉ làm việc cụ thể */}
          <section className="rounded-xl border border-border bg-bg/40 p-3.5">
            <h4 className="mb-1.5 text-xs font-semibold tracking-wider text-text-muted uppercase">
              Địa chỉ làm việc cụ thể
            </h4>
            <div className="flex items-start gap-2 text-xs text-text-main">
              <MapPin className="size-4 shrink-0 text-primary" />
              <span>{data.fullAddress}</span>
            </div>
          </section>

          {/* Thông tin người tạo tin (nếu có từ chi tiết) */}
          {activeJob.creator && (
            <section className="rounded-xl border border-border bg-bg/40 p-3.5">
              <h4 className="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
                Nhân sự đăng tuyển
              </h4>
              <div className="flex items-center gap-3">
                <UserAvatar
                  src={activeJob.creator.avatarUrl || ""}
                  name={activeJob.creator.fullName}
                  className="size-8 rounded-full"
                />
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-main">
                    {activeJob.creator.fullName}
                  </p>
                  <p className="text-[11px] text-text-muted">
                    {activeJob.creator.email}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* FOOTER ACTIONS */}
        {footer !== undefined ? (
          footer
        ) : onApprove || onReject ? (
          <div className="shrink-0 border-t border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              {onReject && (
                <Button
                  variant="secondary"
                  className="flex-1 justify-center rounded-xl py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  icon={X}
                  onClick={() => onReject(job.id)}
                  disabled={isModerating}
                >
                  <span>Từ chối</span>
                </Button>
              )}
              {onApprove && (
                <Button
                  variant="primary"
                  className="flex-1 justify-center rounded-xl bg-emerald-600! hover:bg-emerald-700! py-2.5 text-xs font-semibold text-white!"
                  icon={Check}
                  onClick={() => onApprove(job.id)}
                  disabled={isModerating}
                >
                  <span>Phê duyệt xuất bản</span>
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="shrink-0 border-t border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2.5">
              {isAlreadyApplied ? (
                <Button
                  variant="secondary"
                  icon={CheckCircle2}
                  onClick={() => {
                    onClose();
                    navigate(PATHS.CANDIDATE.APPLICATION_STATUS);
                  }}
                >
                  <span>Đã nộp hồ sơ</span>
                </Button>
              ) : (
                <Button
                  variant="primary"
                  className="flex-1 justify-center rounded-xl py-2.5 text-xs font-semibold"
                  onClick={handleApplyClick}
                >
                  <span>Ứng tuyển ngay</span>
                </Button>
              )}

              <Button
                variant="secondary"
                className="size-10 rounded-xl p-0"
                aria-label={isMarked ? "Bỏ lưu tin" : "Lưu tin tuyển dụng"}
                onClick={handleBookmarkClick}
              >
                {isMarked ? (
                  <BookmarkCheck className="size-4.5 text-primary" />
                ) : (
                  <Bookmark className="size-4.5 text-text-muted" />
                )}
              </Button>

              <Button
                variant="secondary"
                className="size-10 rounded-xl p-0"
                aria-label="Chia sẻ"
                onClick={handleShareClick}
              >
                <Share2 className="size-4 text-text-muted" />
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default JobDetailDrawer;
