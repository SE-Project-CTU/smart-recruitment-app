import React from "react";
import { MapPin, CircleDollarSign, ExternalLink, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SuggestedJobItem } from "./types";

interface SuggestedJobCardProps {
  job: SuggestedJobItem;
  onViewDetail: (id: string) => void;
}

export const SuggestedJobCard: React.FC<SuggestedJobCardProps> = ({
  job,
  onViewDetail,
}) => {
  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 text-xs transition-all shadow-xs hover:border-primary/40">
      {/* 1. Header: Chức danh, Công ty & Độ phù hợp */}
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-text-main leading-snug">
            {job.title}
          </h4>
          <div className="flex items-center gap-1 text-[11px] text-text-muted">
            <Building2 className="h-3 w-3 shrink-0 text-text-muted/70" />
            <span className="font-medium truncate max-w-[150px]">
              {job.companyName}
            </span>
          </div>
        </div>

        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-bold shadow-2xs shrink-0",
            job.matchPercentage >= 85
              ? "bg-status-success/15 text-status-success"
              : "bg-status-info/15 text-status-info",
          )}
        >
          {job.matchPercentage}% match
        </span>
      </div>

      {/* 2. Địa điểm & Mức lương */}
      <div className="mt-2.5 flex flex-wrap items-center gap-3 pt-2 border-t border-border/50 text-[11px] text-text-muted">
        {job.location && (
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-text-muted/70" />
            {job.location}
          </span>
        )}
        {job.salaryText && (
          <span className="flex items-center gap-1 font-medium text-text-main">
            <CircleDollarSign className="h-3 w-3 text-status-success" />
            {job.salaryText}
          </span>
        )}
      </div>

      {/* 3. Hành động xem chi tiết */}
      <div className="mt-2.5 flex items-center justify-end pt-2 border-t border-border/40">
        <button
          type="button"
          onClick={() => onViewDetail(job.id)}
          className="flex cursor-pointer items-center gap-1 rounded-md bg-bg px-2.5 py-1 text-[11px] font-medium text-text-main hover:bg-primary/10 hover:text-primary transition-colors"
          title="Xem chi tiết việc làm trên SmartHire"
        >
          <ExternalLink className="h-3 w-3" />
          Xem công việc
        </button>
      </div>
    </div>
  );
};
