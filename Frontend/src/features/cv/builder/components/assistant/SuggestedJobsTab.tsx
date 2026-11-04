import React, { useState } from "react";
import { Compass } from "lucide-react";
import { MOCK_SUGGESTED_JOBS } from "./mockData";
import { SuggestedJobCard } from "./SuggestedJobCard";
import type { SuggestedJobItem } from "./types";

/**
 * SuggestedJobsTab:
 * Tab Việc làm gợi ý dựa trên hồ sơ CV trong Sidebar:
 * - Render động danh sách thẻ việc làm phù hợp.
 * - Hỗ trợ xem chi tiết tin tuyển dụng.
 */
export const SuggestedJobsTab: React.FC = () => {
  const [jobs] = useState<SuggestedJobItem[]>(MOCK_SUGGESTED_JOBS);
  const [isLoading] = useState(false);

  const handleViewJobDetail = (jobId: string) => {
    window.open(`/jobs/${jobId}`, "_blank");
  };

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 p-4 text-center">
        <Compass className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs font-medium text-text-muted">
          Đang tìm kiếm các công việc phù hợp nhất với hồ sơ CV của bạn...
        </p>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 p-4 text-center">
        <Compass className="h-8 w-8 text-text-muted/60" />
        <p className="text-xs font-semibold text-text-main">Chưa có việc làm gợi ý</p>
        <p className="text-[11px] text-text-muted max-w-xs">
          Hệ thống đang cập nhật danh sách việc làm phù hợp với hồ sơ CV của bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Danh sách thẻ việc làm - Render động */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <SuggestedJobCard
            key={job.id}
            job={job}
            onViewDetail={handleViewJobDetail}
          />
        ))}
      </div>

      {/* Footer hành động của tab */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-text-muted">
        <span>Gợi ý {jobs.length} việc làm phù hợp</span>
        <button
          type="button"
          onClick={() => window.open("/jobs", "_blank")}
          className="font-semibold text-primary hover:underline cursor-pointer"
        >
          Tìm thêm việc làm →
        </button>
      </div>
    </div>
  );
};
