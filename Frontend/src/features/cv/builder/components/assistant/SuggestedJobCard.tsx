import React, { useState } from "react";
import {
  MapPin,
  CircleDollarSign,
  ExternalLink,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getLoremAvt } from "@/utils/helper";
import { Button } from "@/components/common";
import type { RealtimeRecommendedJobDto } from "@/types/ai";

interface SuggestedJobCardProps {
  job: RealtimeRecommendedJobDto;
  onViewDetail: (job: RealtimeRecommendedJobDto) => void;
}

export const SuggestedJobCard: React.FC<SuggestedJobCardProps> = ({
  job,
  onViewDetail,
}) => {
  const [imageError, setImageError] = useState(false);
  const roundedScore = Math.round(job.score);
  const fallbackLogo = getLoremAvt(job.companyName);

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 text-xs shadow-xs transition-all hover:border-primary/40">
      {/* 1. Header: Logo, Chức danh, Công ty & Điểm tương thích */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 items-start gap-2.5">
          <img
            src={imageError || !job.logoUrl ? fallbackLogo : job.logoUrl}
            alt={job.companyName}
            onError={() => setImageError(true)}
            className="size-8 shrink-0 rounded-lg border border-border object-cover"
          />
          <div className="min-w-0 space-y-0.5">
            <h4
              onClick={() => onViewDetail(job)}
              className="line-clamp-1 cursor-pointer text-xs leading-snug font-bold text-text-main transition-colors hover:text-primary"
              title={job.title}
            >
              {job.title}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-text-muted">
              <Building2 className="size-3 shrink-0 text-text-muted/70" />
              <span className="max-w-full truncate font-medium">
                {job.companyName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Địa điểm & Mức lương */}
      <div className="mt-2.5 flex flex-col gap-3 border-t border-border/50 pt-2 text-[11px] text-text-muted">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="size-3 text-text-muted/70" />
            <span className="max-w-full truncate">{job.location}</span>
          </span>
        )}
        {job.salaryText && (
          <span className="flex items-center gap-1 font-medium text-primary">
            <CircleDollarSign className="size-3 text-primary shrink-0" />
            <span>{job.salaryText}</span>
          </span>
        )}
      </div>

      {/* 3. Nút hành động */}
      <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2">
        {/* Điểm tương thích thật từ AI */}
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold",
            roundedScore >= 80
              ? "bg-status-success/15 text-status-success"
              : roundedScore >= 60
                ? "bg-status-info/15 text-status-info"
                : "bg-status-warning/15 text-status-warning",
          )}
        >
          {roundedScore}% phù hợp
        </span>

        <Button
          variant="secondary"
          icon={ExternalLink}
          iconSize={12}
          onClick={() => onViewDetail(job)}
          className="h-7! rounded-lg! px-2.5! py-1! text-[11px]! font-medium!"
        >
          Xem chi tiết
        </Button>
      </div>
    </div>
  );
};
