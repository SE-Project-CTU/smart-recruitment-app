import React, { useState } from "react";
import { Clock, Ellipsis, MapPin } from "lucide-react";
import { Bookmark, BookmarkCheck } from "lucide";
import { MorphIcon } from "morphicons/react";
import Button from "./Button";
import { CompanyLogo } from "@/components/company/CompanyLogo";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "@/components/animate-ui/components/base/tooltip";
import {
  extractJobDisplayData,
  getJobLevelLabel,
  getJobTypeLabel,
  getWorkModeLabel,
} from "@/utils/jobHelpers";
import { useApplyJobModalStore, type AnyJob } from "@/stores/applyJobModalStore";
import type { JobPostingItem, JobPostingSearchItem } from "@/types/job";
import type { MockJobPosting } from "@/constants/mockData";

export type JobCardItem =
  | JobPostingItem
  | JobPostingSearchItem
  | MockJobPosting
  | AnyJob;

export interface JobCardProps<T extends JobCardItem = JobCardItem> {
  job: T;
  isSelected?: boolean;
  onSelect?: (job: T) => void;
  onApply?: (job: T) => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (jobId: string) => void;
}

export function JobCard<T extends JobCardItem = JobCardItem>({
  job,
  isSelected = false,
  onSelect,
  onApply,
  isBookmarked: externalIsBookmarked,
  onToggleBookmark,
}: JobCardProps<T>) {
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

  const {
    companyName,
    companyLogoUrl,
    displayLocation,
    displayTimeAgo,
    salaryInfo,
    aiScore,
  } = extractJobDisplayData(job);

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
            <span className="text-lg font-semibold tracking-tight text-text-main">
              {salaryInfo.text}
            </span>
            {salaryInfo.unit && (
              <span className="text-xs font-semibold text-text-muted">
                {salaryInfo.unit}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {aiScore != null && (
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary-dark">
                      <span>{aiScore}%</span>
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
              {companyName}
            </p>
          </div>

          <CompanyLogo logoUrl={companyLogoUrl} name={companyName} size="md" />
        </div>

        <div className="mt-4 flex flex-col gap-1.5 text-xs font-medium text-text-muted">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 shrink-0 text-text-muted" />
            <span className="truncate">{displayLocation}</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-text-muted" />
            <span>{displayTimeAgo}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {job.jobType && (
            <span className="rounded-full border border-border px-3 py-1 text-xs text-text-main">
              {getJobTypeLabel(job.jobType)}
            </span>
          )}
          {job.workMode && (
            <span className="rounded-full border border-border px-3 py-1 text-xs text-text-main">
              {getWorkModeLabel(job.workMode)}
            </span>
          )}
          {job.jobLevel && (
            <span className="rounded-full border border-border px-3 py-1 text-xs text-text-main">
              {getJobLevelLabel(job.jobLevel)}
            </span>
          )}
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
}

export default JobCard;
