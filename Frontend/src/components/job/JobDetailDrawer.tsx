import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  Building2,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Share2,
  Zap,
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
import { getTimeAgo } from "@/utils/helper";
import { toast } from "@/hooks/use-toast";
import { PATHS } from "@/constants/paths";
import { useApplyJobModalStore } from "@/stores/applyJobModalStore";
import { useMyApplications } from "@/hooks/queries/useApplication";
import type { MockJobPosting } from "@/constants/mockData";

export interface JobDetailDrawerProps {
  job: MockJobPosting | null;
  open: boolean;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
}

export function JobDetailDrawer({
  job,
  open,
  onClose,
  isBookmarked: externalIsBookmarked,
  onToggleBookmark,
  onApply,
}: JobDetailDrawerProps) {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [internalBookmarked, setInternalBookmarked] = useState(false);
  const { openApplyModal } = useApplyJobModalStore();

  // Kiểm tra xem candidate đã ứng tuyển job này chưa
  const { data: myAppsData } = useMyApplications({ pageSize: 50 });
  const myApplications = myAppsData?.items ?? [];
  const isAlreadyApplied = Boolean(
    job && myApplications.some((app) => app.jobId === job.id),
  );

  const isMarked =
    externalIsBookmarked !== undefined
      ? externalIsBookmarked
      : internalBookmarked;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!job) return null;

  const formattedDeadline = job.deadline
    ? new Date(job.deadline).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : null;

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
    } else {
      setInternalBookmarked(!internalBookmarked);
    }
    toast.success({
      description: isMarked
        ? "Đã bỏ lưu tin tuyển dụng."
        : "Đã lưu tin tuyển dụng vào danh sách quan tâm.",
    });
  };

  const handleShareClick = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
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

        <SheetHeader className="shrink-0 border-b border-border p-5 pb-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3.5">
              <div className="flex size-13 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2 shadow-2xs">
                {job.company.logoUrl ? (
                  <img
                    src={job.company.logoUrl}
                    alt={job.company.name}
                    className="size-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display =
                        "none";
                    }}
                  />
                ) : (
                  <Building2 className="size-6 text-primary" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <SheetTitle className="text-base leading-snug font-semibold text-text-main">
                  {job.title}
                </SheetTitle>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
                  <span className="font-medium text-text-main">
                    {job.company.name}
                  </span>
                  {job.company.verificationStatus === "VERIFIED" && (
                    <CheckCircle2 className="size-3.5 text-status-success" />
                  )}
                </div>
              </div>
            </div>

            {job.aiMatchScore && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="inline-flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary-dark">
                      <Zap className="size-3" />
                      <span>{job.aiMatchScore}%</span>
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
                {job.salaryNegotiable ? (
                  <span className="text-xs font-semibold text-text-main sm:text-sm">
                    Thỏa thuận
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-primary sm:text-sm">
                    ${job.salaryMin} - ${job.salaryMax}
                  </span>
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-text-muted">Đăng lúc</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-text-main sm:text-sm">
                {getTimeAgo(job.createAt)}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-text-muted">Hạn nộp</p>
              <p className="mt-0.5 truncate text-xs font-semibold text-text-main sm:text-sm">
                {formattedDeadline || "Không giới hạn"}
              </p>
            </div>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-5 pb-6">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-bg/60 p-2.5">
              <div className="text-primary">
                <Briefcase className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted">Kinh nghiệm</p>
                <p className="truncate text-xs font-semibold text-text-main">
                  {job.experienceYears > 0
                    ? `${job.experienceYears} năm`
                    : "Không yêu cầu"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-bg/60 p-2.5">
              <div className="text-primary">
                <Users className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted">Số lượng</p>
                <p className="truncate text-xs font-semibold text-text-main">
                  {job.vacancies || 1} người
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-bg/60 p-2.5">
              <div className="text-primary">
                <GraduationCap className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted">Hình thức</p>
                <p className="truncate text-xs font-semibold text-text-main">
                  {job.workMode}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-border bg-bg/60 p-2.5">
              <div className="text-primary">
                <MapPin className="size-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-text-muted">Khu vực</p>
                <p className="truncate text-xs font-semibold text-text-main">
                  {job.location.provinceName}
                </p>
              </div>
            </div>
          </div>

          {job.skills && job.skills.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold tracking-wider text-text-muted uppercase">
                Kỹ năng chuyên môn
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-lg border border-border bg-bg/70 px-2.5 py-1 text-xs font-medium text-text-main"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {job.description && (
            <section>
              <h4 className="mb-1.5 text-xs font-semibold tracking-wider text-text-muted uppercase">
                Mô tả công việc
              </h4>
              <p className="text-xs leading-relaxed whitespace-pre-line text-text-main sm:text-sm">
                {job.description}
              </p>
            </section>
          )}

          {job.requirements && (
            <section>
              <h4 className="mb-1.5 text-xs font-semibold tracking-wider text-text-muted uppercase">
                Yêu cầu ứng viên
              </h4>
              <p className="text-xs leading-relaxed whitespace-pre-line text-text-main sm:text-sm">
                {job.requirements}
              </p>
            </section>
          )}

          {job.benefits && (
            <section>
              <h4 className="mb-1.5 text-xs font-semibold tracking-wider text-text-muted uppercase">
                Quyền lợi & Đãi ngộ
              </h4>
              <p className="text-xs leading-relaxed whitespace-pre-line text-text-main sm:text-sm">
                {job.benefits}
              </p>
            </section>
          )}

          <section className="rounded-xl border border-border bg-bg/40 p-3.5">
            <h4 className="mb-1.5 text-xs font-semibold tracking-wider text-text-muted uppercase">
              Địa chỉ cụ thể
            </h4>
            <div className="flex items-start gap-2 text-xs text-text-main">
              <MapPin className="size-4 shrink-0 text-primary" />
              <span>
                {job.location.detailedLocation
                  ? `${job.location.detailedLocation}, `
                  : ""}
                {job.location.wardName ? `${job.location.wardName}, ` : ""}
                {job.location.provinceName}
              </span>
            </div>
          </section>
        </div>

        {/* STICKY ACTION FOOTER */}
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
      </SheetContent>
    </Sheet>
  );
}

export default JobDetailDrawer;
