import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * SuggestedJobCardSkeleton:
 * Component khung xương (skeleton loading) hiển thị mô phỏng thẻ việc làm gợi ý (SuggestedJobCard)
 * trong quá trình AI Rerank tìm kiếm và xếp hạng việc làm tương thích với CV.
 */
export const SuggestedJobCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 shadow-xs">
      {/* 1. Header: Logo công ty, Chức danh & Tên công ty */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex min-w-0 flex-1 items-start gap-2.5">
          <Skeleton className="size-8 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-3/4 rounded-md" />
            <Skeleton className="h-3 w-1/2 rounded-md" />
          </div>
        </div>
      </div>

      {/* 2. Địa điểm & Mức lương */}
      <div className="mt-2.5 flex flex-col gap-2 border-t border-border/50 pt-2">
        <Skeleton className="h-3 w-3/5 rounded-xs" />
        <Skeleton className="h-3 w-2/5 rounded-xs" />
      </div>

      {/* 3. Footer: Badge % phù hợp & Nút Xem chi tiết */}
      <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2">
        <Skeleton className="h-5 w-20 rounded-full bg-primary/15" />
        <Skeleton className="h-7 w-24 rounded-lg" />
      </div>
    </div>
  );
};
