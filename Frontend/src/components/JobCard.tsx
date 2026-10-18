import { getTimeAgo } from "@/utils/helper";
import Button from "@/components/Button";

import type { MockJobPosting } from "@/constants/mockData";
import { Ellipsis, MapPin, Clock } from "lucide-react";
import {
  Tooltip,
  TooltipPanel,
  TooltipTrigger,
} from "./animate-ui/components/base/tooltip";
import { MorphIcon } from "morphicons/react";
import { Bookmark, BookmarkCheck } from "lucide";
import { useState } from "react";

interface JobCardProps {
  job: MockJobPosting;
}

export const JobCard = ({ job }: JobCardProps) => {
  //local state
  const [isMarked, setIsMarked] = useState(false);
  return (
    <div className="group relative flex min-h-80.5 w-full max-w-85 min-w-70 flex-col justify-between rounded-3xl bg-bg p-6 transition-all duration-300">
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
                  ${job.salaryMax}
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
                    <div className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-bold text-primary-dark">
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
                    onClick={() =>
                      console.log("Open Detail Sidebar for job:", job.id)
                    }
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
          onClick={() => console.log("Apply for job:", job.id)}
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
                onClick={() => {
                  console.log("Bookmark job:", job.id);
                  setIsMarked(!isMarked);
                }}
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
