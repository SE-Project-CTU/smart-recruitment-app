import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * CvScoringSkeleton:
 * Component khung xương (skeleton loading) hiển thị mô phỏng kết quả chấm điểm CV
 * trong quá trình AI phân tích độ tương thích giữa CV và Job Description.
 */
export const CvScoringSkeleton: React.FC = () => {
  return (
    <div className="space-y-3.5">
      {/* 1. Điểm tổng quan Skeleton */}
      <div className="flex flex-col items-center rounded-2xl border border-border bg-surface p-4 text-center shadow-xs">
        {/* Vòng tròn điểm số */}
        <div className="relative mb-2 flex size-18 items-center justify-center rounded-full border-4 border-border bg-bg/50">
          <Skeleton className="size-10 rounded-full" />
        </div>

        {/* Badge xếp loại */}
        <Skeleton className="h-5 w-32 rounded-full mb-2" />

        {/* Đoạn text tóm tắt */}
        <div className="w-full space-y-1.5 border-t border-border/50 pt-2.5">
          <Skeleton className="h-3 w-full rounded-xs" />
          <Skeleton className="h-3 w-4/5 rounded-xs" />
        </div>
      </div>

      {/* 2. Độ phủ kỹ năng chuyên môn Skeleton */}
      <div className="space-y-3 rounded-xl border border-border bg-surface p-3.5 shadow-xs">
        <Skeleton className="h-3 w-36 rounded-xs" />

        {/* Kỹ năng phù hợp */}
        <div className="space-y-2">
          <Skeleton className="h-3 w-28 rounded-xs" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-16 rounded-md bg-status-success/15" />
            <Skeleton className="h-6 w-20 rounded-md bg-status-success/15" />
            <Skeleton className="h-6 w-14 rounded-md bg-status-success/15" />
            <Skeleton className="h-6 w-24 rounded-md bg-status-success/15" />
          </div>
        </div>

        {/* Kỹ năng còn thiếu */}
        <div className="space-y-2 border-t border-border/50 pt-2.5">
          <Skeleton className="h-3 w-28 rounded-xs" />
          <div className="flex flex-wrap gap-1.5">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-md" />
            <Skeleton className="h-6 w-22 rounded-md" />
          </div>
        </div>
      </div>

      {/* 3. Điểm mạnh nổi bật Skeleton */}
      <div className="space-y-2.5 rounded-xl border border-border bg-surface p-3.5 shadow-xs">
        <Skeleton className="h-3 w-32 rounded-xs" />
        <div className="space-y-2 pl-1">
          <div className="flex items-center gap-2">
            <Skeleton className="size-1.5 rounded-full shrink-0" />
            <Skeleton className="h-3 w-11/12 rounded-xs" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-1.5 rounded-full shrink-0" />
            <Skeleton className="h-3 w-4/5 rounded-xs" />
          </div>
        </div>
      </div>

      {/* 4. Đề xuất tối ưu hồ sơ Skeleton */}
      <div className="space-y-2.5 rounded-xl border border-primary/20 bg-primary/5 p-3.5 shadow-xs">
        <Skeleton className="h-3 w-36 rounded-xs bg-primary/20" />
        <div className="space-y-2 pl-1">
          <div className="flex items-center gap-2">
            <Skeleton className="size-1.5 rounded-full shrink-0 bg-primary/30" />
            <Skeleton className="h-3 w-full rounded-xs bg-primary/15" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="size-1.5 rounded-full shrink-0 bg-primary/30" />
            <Skeleton className="h-3 w-5/6 rounded-xs bg-primary/15" />
          </div>
        </div>
      </div>
    </div>
  );
};
