import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Compass,
  RefreshCw,
  AlertCircle,
  FileQuestion,
  Search,
  Sparkles,
} from "lucide-react";
import { PATHS } from "@/constants/paths";
import { Button } from "@/components/common";
import { JobDetailDrawer } from "@/components/job/JobDetailDrawer";
import { useCvJobRecommendations } from "../../hooks/useCvJobRecommendations";
import { SuggestedJobCard } from "./SuggestedJobCard";
import { SuggestedJobCardSkeleton } from "./SuggestedJobCardSkeleton";

/**
 * SuggestedJobsTab:
 * Tab Việc làm gợi ý theo thời gian thực dựa trên nội dung CV đang chỉnh sửa
 * - Gọi POST /api/v1/ai/jobs/rerank khi mở tab và khi người dùng bấm làm mới
 * - Lấy nội dung form tại thời điểm gọi (kể cả thay đổi chưa lưu)
 * - Tích hợp JobDetailDrawer xem chi tiết trực tiếp không làm gián đoạn việc soạn thảo CV
 * - Ưu tiên sử dụng component dùng chung Button của hệ thống
 */
export const SuggestedJobsTab: React.FC = () => {
  const navigate = useNavigate();

  const {
    jobs,
    isLoading,
    isError,
    errorMessage,
    isCvEmpty,
    isCvStale,
    refresh,
    selectedJob,
    isDrawerOpen,
    openJobDetail,
    closeDrawer,
  } = useCvJobRecommendations({ isActive: true });

  const handleGoToSearch = () => {
    navigate(PATHS.SEARCH_JOB);
  };

  // 1. Trạng thái đang tải dữ liệu từ AI Rerank (Skeleton loading)
  if (isLoading && jobs.length === 0) {
    return (
      <div className="space-y-3">
        <SuggestedJobCardSkeleton />
        <SuggestedJobCardSkeleton />
        <SuggestedJobCardSkeleton />
      </div>
    );
  }

  // 2. Trạng thái CV chưa có nội dung (thiếu chức danh/kỹ năng/kinh nghiệm)
  if (isCvEmpty) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2.5 p-4 text-center">
        <FileQuestion className="size-8 text-text-muted/60" />
        <p className="text-xs font-semibold text-text-main">
          Chưa có thông tin CV để gợi ý
        </p>
        <p className="max-w-[240px] text-[11px] leading-relaxed text-text-muted">
          Hãy nhập chức danh mục tiêu, kỹ năng hoặc kinh nghiệm làm việc để AI
          tìm kiếm các cơ hội phù hợp nhất với bạn.
        </p>
        <Button
          variant="secondary"
          icon={RefreshCw}
          iconSize={14}
          onClick={() => refresh()}
          className="mt-2! rounded-lg! px-3! py-1.5! text-xs! font-medium!"
        >
          Kiểm tra lại
        </Button>
      </div>
    );
  }

  // 3. Trạng thái lỗi khi gọi API
  if (isError && jobs.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2.5 p-4 text-center">
        <AlertCircle className="size-8 text-status-error" />
        <p className="text-xs font-semibold text-text-main">
          Không thể tải gợi ý việc làm
        </p>
        <p className="max-w-[240px] text-[11px] text-text-muted">
          {errorMessage || "Đã xảy ra sự cố khi đối chiếu dữ liệu với AI."}
        </p>
        <Button
          variant="primary"
          icon={RefreshCw}
          iconSize={14}
          onClick={() => refresh()}
          className="mt-2! rounded-lg! px-3.5! py-1.5! text-xs! font-semibold!"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  // 4. Trạng thái không tìm thấy công việc phù hợp
  if (!isLoading && jobs.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2.5 p-4 text-center">
        <Compass className="size-8 text-text-muted/60" />
        <p className="text-xs font-semibold text-text-main">
          Chưa tìm thấy việc làm phù hợp
        </p>
        <p className="max-w-[240px] text-[11px] leading-relaxed text-text-muted">
          Hệ thống chưa tìm thấy tin tuyển dụng trùng khớp với hồ sơ hiện tại.
          Bạn có thể làm mới hoặc tìm kiếm trực tiếp trên sàn việc làm.
        </p>
        <div className="mt-2 flex flex-col items-stretch gap-2">
          <Button
            variant="secondary"
            icon={RefreshCw}
            iconSize={14}
            onClick={() => refresh()}
            className="rounded-lg! px-3! py-1.5! text-xs! font-medium!"
          >
            Làm mới
          </Button>
          <Button
            variant="primary"
            icon={Search}
            iconSize={14}
            onClick={handleGoToSearch}
            className="rounded-lg! px-3.5! py-1.5! text-xs! font-semibold!"
          >
            Khám phá việc làm
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Header Toolbar của Tab */}
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-text-main">
          <Sparkles className="size-3.5 text-primary" />
          <span>Xếp hạng phù hợp ({jobs.length})</span>
        </div>
        <Button
          variant="secondary"
          icon={RefreshCw}
          iconSize={12}
          isLoading={isLoading}
          onClick={() => refresh()}
          className="h-7! rounded-lg! px-2.5! py-1! text-[11px]! font-semibold!"
          title="Làm mới danh sách gợi ý theo nội dung CV hiện tại"
        >
          Làm mới
        </Button>
      </div>

      {/* 2. Banner cảnh báo khi CV đã thay đổi sau lần gọi gần nhất (Stale notice) */}
      {isCvStale && (
        <div className="flex items-start gap-2 rounded-xl border border-status-warning/40 bg-status-warning/10 p-2.5 text-[11px] text-text-main">
          <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-status-warning" />
          <div className="flex-1 space-y-1">
            <p className="leading-snug">
              Nội dung CV vừa thay đổi so với lần gợi ý trước.
            </p>
            <Button
              variant="secondary"
              isLoading={isLoading}
              onClick={() => refresh()}
              className="h-6! rounded-md! border-primary/30! px-2! py-0.5! text-[10px]! font-bold! text-primary!"
            >
              Cập nhật gợi ý mới →
            </Button>
          </div>
        </div>
      )}

      {/* 3. Danh sách thẻ việc làm */}
      <div className="space-y-3">
        {jobs.map((job) => (
          <SuggestedJobCard
            key={job.id}
            job={job}
            onViewDetail={openJobDetail}
          />
        ))}
      </div>

      {/* 4. Footer hành động của tab */}
      <div className="flex items-center justify-between border-t border-border/50 pt-2 text-[11px] text-text-muted">
        <span>Gợi ý {jobs.length} công việc</span>
        <Button
          variant="secondary"
          onClick={handleGoToSearch}
          className="h-7! rounded-lg! px-2.5! py-1! text-[11px]! font-semibold!"
        >
          Tìm thêm việc làm →
        </Button>
      </div>

      {/* 5. Drawer hiển thị chi tiết việc làm */}
      <JobDetailDrawer
        job={selectedJob}
        open={isDrawerOpen}
        onClose={closeDrawer}
      />
    </div>
  );
};
