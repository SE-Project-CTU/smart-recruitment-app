import React, { useState } from "react";
import { MapPin, CircleDollarSign, ExternalLink, Building2 } from "lucide-react";
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
    <div className="rounded-xl border border-border bg-surface p-3.5 text-xs transition-all shadow-xs hover:border-primary/40">
      {/* 1. Header: Logo, Chức danh, Công ty & Điểm tương thích */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0">
          <img
            src={imageError || !job.logoUrl ? fallbackLogo : job.logoUrl}
            alt={job.companyName}
            onError={() => setImageError(true)}
            className="size-8 shrink-0 rounded-lg object-cover border border-border"
          />
          <div className="space-y-0.5 min-w-0">
            <h4
              onClick={() => onViewDetail(job)}
              className="text-xs font-bold text-text-main leading-snug line-clamp-1 hover:text-primary cursor-pointer transition-colors"
              title={job.title}
            >
              {job.title}
            </h4>
            <div className="flex items-center gap-1 text-[11px] text-text-muted">
              <Building2 className="size-3 shrink-0 text-text-muted/70" />
              <span className="font-medium truncate max-w-[140px]">
                {job.companyName}
              </span>
            </div>
          </div>
        </div>

        {/* Điểm tương thích thật từ AI */}
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0",
            roundedScore >= 80
              ? "bg-status-success/15 text-status-success"
              : roundedScore >= 60
                ? "bg-status-info/15 text-status-info"
                : "bg-status-warning/15 text-status-warning",
          )}
        >
          {roundedScore}% phù hợp
        </span>
      </div>

      {/* 2. Địa điểm & Mức lương */}
      <div className="mt-2.5 flex flex-wrap items-center gap-3 pt-2 border-t border-border/50 text-[11px] text-text-muted">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="size-3 text-text-muted/70" />
            <span className="truncate max-w-[120px]">{job.location}</span>
          </span>
        )}
        {job.salaryText && (
          <span className="flex items-center gap-1 font-medium text-text-main">
            <CircleDollarSign className="size-3 text-status-success" />
            <span>{job.salaryText}</span>
          </span>
        )}
      </div>

      {/* 3. Nút hành động */}
      <div className="mt-2.5 flex items-center justify-end pt-2 border-t border-border/40">
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
