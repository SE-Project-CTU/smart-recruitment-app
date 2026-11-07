import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface SuggestionCardSkeletonProps {
  /** Cho phép render skeleton dạng chi tiết (mở rộng) hay dạng thu gọn */
  isExpanded?: boolean;
}

/**
 * SuggestionCardSkeleton:
 * Component hiển thị khung xương (skeleton loading) cho các thẻ gợi ý (SuggestionCard)
 * trong quá trình AI đang phân tích và tối ưu hóa nội dung CV.
 */
export const SuggestionCardSkeleton: React.FC<SuggestionCardSkeletonProps> = ({
  isExpanded = true,
}) => {
  return (
    <div className="rounded-xl border border-border bg-surface shadow-xs overflow-hidden">
      {/* 1. Header thẻ: Tên mục cần cải thiện */}
      <div className="flex items-center justify-between px-3.5 pt-3 pb-2 border-b border-border/40">
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-3 w-16 rounded-md opacity-60" />
      </div>

      {/* 2. Body thẻ */}
      <div className="px-3.5 py-2.5 space-y-2.5">
        {isExpanded ? (
          <>
            {/* Box mô phỏng nội dung hiện tại của ứng viên */}
            <div className="rounded-lg border border-border/70 bg-bg/50 p-2.5 space-y-2">
              <Skeleton className="h-2.5 w-24 rounded-xs opacity-75" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full rounded-xs" />
                <Skeleton className="h-3 w-4/5 rounded-xs" />
              </div>
            </div>

            {/* Box mô phỏng nội dung AI đang tối ưu hóa theo Google XYZ */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-2.5 w-44 rounded-xs bg-primary/25" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-full rounded-xs bg-primary/20" />
                <Skeleton className="h-3 w-11/12 rounded-xs bg-primary/20" />
                <Skeleton className="h-3 w-3/4 rounded-xs bg-primary/20" />
              </div>
              {/* Dòng lý do */}
              <div className="pt-1 border-t border-primary/10">
                <Skeleton className="h-2.5 w-2/3 rounded-xs bg-primary/15" />
              </div>
            </div>

            {/* Nút thu gọn mô phỏng */}
            <div className="pt-1 flex items-center justify-center">
              <Skeleton className="h-3 w-28 rounded-md opacity-60" />
            </div>
          </>
        ) : (
          /* Trạng thái thu gọn */
          <div className="py-1 flex items-center justify-center">
            <Skeleton className="h-3.5 w-36 rounded-md opacity-70" />
          </div>
        )}
      </div>

      {/* 3. Footer thẻ: Nút Bỏ qua */}
      <div className="flex items-center justify-end border-t border-border/50 px-3.5 py-2">
        <Skeleton className="h-6.5 w-16 rounded-md" />
      </div>
    </div>
  );
};
