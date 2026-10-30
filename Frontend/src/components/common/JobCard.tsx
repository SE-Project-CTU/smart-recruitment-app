import { getTimeAgo } from "@/utils/helper";
import Button from "./Button";
import type { MockJobPosting } from "@/constants/mockData";
import { Ellipsis, MapPin, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import { MorphIcon } from "morphicons/react";
import { Bookmark, BookmarkCheck } from "lucide";
import { useState } from "react";

import { useApplyJobModalStore } from "@/stores/applyJobModalStore";

export interface JobCardProps {
  job: MockJobPosting;
  isSelected?: boolean;
  onSelect?: (job: MockJobPosting) => void;
  onApply?: (job: MockJobPosting) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (jobId: string) => void;
}

export const JobCard = ({
  job,
  isSelected = false,
  onSelect,
  onApply,
  isBookmarked: externalIsBookmarked,
  onToggleBookmark,
}: JobCardProps) => {
  const { openApplyModal } = useApplyJobModalStore();
  const [internalMarked, setInternalMarked] = useState(false);
  const isMarked =
    externalIsBookmarked !== undefined ? externalIsBookmarked : internalMarked;

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleBookmark) {
      onToggleBookmark(job.id);
    } else {
      setInternalMarked(!internalMarked);
    }
  };

  const handleCardClick = () => {
    onSelect?.(job);
  };

  const handleApplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onApply) {
      onApply(job);
    } else {
      openApplyModal(job);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex min-h-80.5 max-w-90 min-w-90 cursor-pointer flex-col justify-between rounded-2xl border p-6 shadow-xs transition-all duration-300 ${
        isSelected
          ? "border-primary bg-secondary-light/20 shadow-md ring-2 ring-primary/20"
          : "border-border bg-surface hover:border-sky-400 hover:bg-linear-to-b hover:from-sky-50/50 hover:to-sky-200"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-baseline gap-1">
            {job.salaryNegotiable ? (
              <span className="text-lg font-semibold tracking-tight text-text-main">
                Thỏa thuận
              </span>
            ) : (
              <>
                <span className="text-lg font-semibold tracking-tight text-text-main">
                  {job.salaryMin} - {job.salaryMax} triệu
                </span>
                <span className="text-xs font-semibold text-text-muted">
                  /tháng
                </span>
              </>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {job.aiMatchScore && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary-dark">
                      <span>{job.aiMatchScore}%</span>
                    </div>
                  }
                />
                <TooltipPanel>Độ phù hợp</TooltipPanel>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect?.(job);
                    }}
                    type="button"
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-text-muted transition-colors hover:text-text-main"
                  >
                    <Ellipsis className="size-5" />
                  </button>
                }
              />
              <TooltipPanel>
                <p>Xem chi tiết</p>
              </TooltipPanel>
            </Tooltip>
          </div>
        </div>

        <div className="mt-5 flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h3 className="text-base leading-snug font-semibold text-text-main transition-colors group-hover:text-primary">
              {job.title}
            </h3>
            <p className="truncate text-xs font-medium text-text-muted">
              {job.company.name}
            </p>
          </div>

          <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white p-2">
            <img
              src={job.company.logoUrl}
              alt={job.company.name}
              className="size-full object-contain"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1.5 text-xs font-medium text-text-muted">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-text-muted" />
            <span className="truncate">
              {job.location.wardName ? `${job.location.wardName}, ` : ""}
              {job.location.provinceName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-text-muted" />
            <span>{getTimeAgo(job.createAt)}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-border px-3 py-1 text-xs text-text-main">
            {job.jobType || "Full-time"}
          </span>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-text-main">
            {job.workMode || "Hybrid"}
          </span>
          <span className="rounded-full border border-border px-3 py-1 text-xs text-text-main">
            {job.jobLevel || "Middle"}
          </span>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2.5">
        <Button
          className="flex-1 justify-center py-2.5! text-xs!"
          onClick={handleApplyClick}
        >
          Ứng tuyển ngay
        </Button>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                variant="secondary"
                className="p-2.5!"
                aria-label="Lưu công việc"
                onClick={handleBookmarkClick}
              >
                <MorphIcon
                  className="size-4"
                  icon={isMarked ? BookmarkCheck : Bookmark}
                />
              </Button>
            }
          />
          <TooltipPanel>{isMarked ? "Bỏ lưu" : "Lưu tin"}</TooltipPanel>
        </Tooltip>
      </div>
    </div>
  );
};

export default JobCard;
