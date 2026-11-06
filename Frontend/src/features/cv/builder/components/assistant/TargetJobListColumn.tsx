import React from "react";
import {
  Search,
  Building2,
  MapPin,
  Check,
  Bookmark,
  Loader2,
  AlertCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { Button } from "@/components/common";
import { getWorkModeLabel } from "@/utils/jobHelpers";
import type { TargetJobOption } from "./types";

interface TargetJobListColumnProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  totalItems: number;
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  jobs: TargetJobOption[];
  selectedJobId: string | null;
  onSelectJob: (job: TargetJobOption) => void;
  isLoadingList: boolean;
  isErrorList: boolean;
  listErrorMessage: string | null;
  onRetryList: () => void;
  isEmptyList: boolean;
  isNoSearchResults: boolean;
  onGoToSearch: () => void;
}

/**
 * Cột bên trái của Modal Chọn Job:
 * - Thanh tìm kiếm có nút xóa nhanh
 * - Trạng thái: đang tải, lỗi kèm nút thử lại, chưa lưu tin nào, không khớp kết quả
 * - Danh sách việc làm đã lưu với radio selection
 * - Điều hướng phân trang theo API
 */
export const TargetJobListColumn: React.FC<TargetJobListColumnProps> = ({
  searchQuery,
  onSearchChange,
  totalItems,
  page,
  totalPages,
  onPageChange,
  jobs,
  selectedJobId,
  onSelectJob,
  isLoadingList,
  isErrorList,
  listErrorMessage,
  onRetryList,
  isEmptyList,
  isNoSearchResults,
  onGoToSearch,
}) => {
  return (
    <div className="flex w-full shrink-0 flex-col border-r border-border bg-bg/40 md:w-[380px]">
      {/* 1. Thanh tìm kiếm & đếm số lượng tin */}
      <div className="shrink-0 space-y-2 border-b border-border/60 bg-surface/80 p-3">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Tìm theo chức danh, công ty, kỹ năng..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-md border border-border bg-bg py-1.5 pr-8 pl-8.5 text-xs text-text-main placeholder:text-text-muted/70 focus:border-primary focus:bg-surface focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer p-0.5 text-text-muted hover:text-text-main"
              title="Xóa tìm kiếm"
            >
              <X className="size-3" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between px-0.5 text-[11px] text-text-muted">
          <span>Tin tuyển dụng đã lưu</span>
          <span className="font-semibold text-text-main">{totalItems} tin</span>
        </div>
      </div>

      {/* 2. Danh sách việc làm và các trạng thái */}
      <div className="flex-1 space-y-2 overflow-y-auto p-3">
        {/* 2.1 Trạng thái đang tải */}
        {isLoadingList && (
          <div className="flex h-52 flex-col items-center justify-center gap-2.5 text-xs text-text-muted">
            <Loader2 className="size-5 animate-spin text-primary" />
            <span>Đang tải danh sách việc làm đã lưu...</span>
          </div>
        )}

        {/* 2.2 Trạng thái lỗi tải danh sách */}
        {!isLoadingList && isErrorList && (
          <div className="flex h-52 flex-col items-center justify-center gap-2.5 p-4 text-center">
            <AlertCircle className="size-6 text-status-error" />
            <p className="text-xs font-semibold text-text-main">
              Không thể tải danh sách việc làm
            </p>
            <p className="max-w-[220px] text-[11px] text-text-muted">
              {listErrorMessage || "Đã xảy ra lỗi khi kết nối tới máy chủ."}
            </p>
            <Button
              variant="secondary"
              icon={RefreshCw}
              iconSize={12}
              onClick={onRetryList}
              className="mt-1! h-7! rounded-lg! px-3! py-1! text-[11px]! font-medium!"
            >
              Thử lại
            </Button>
          </div>
        )}

        {/* 2.3 Trạng thái chưa có tin lưu nào */}
        {isEmptyList && (
          <div className="flex h-52 flex-col items-center justify-center gap-2.5 p-4 text-center">
            <Bookmark className="size-7 text-text-muted/60" />
            <p className="text-xs font-semibold text-text-main">
              Chưa có việc làm đã lưu
            </p>
            <p className="max-w-[230px] text-[11px] leading-relaxed text-text-muted">
              Bạn chưa lưu tin tuyển dụng nào. Hãy tìm kiếm việc làm phù hợp và
              lưu lại để đối chiếu cùng CV.
            </p>
            <Button
              variant="primary"
              icon={Search}
              iconSize={12}
              onClick={onGoToSearch}
              className="mt-1! h-7! rounded-lg! px-3! py-1! text-[11px]! font-semibold!"
            >
              Tìm việc làm ngay
            </Button>
          </div>
        )}

        {/* 2.4 Trạng thái tìm kiếm không có kết quả */}
        {isNoSearchResults && (
          <div className="flex h-52 flex-col items-center justify-center gap-2 p-4 text-center">
            <Search className="size-6 text-text-muted/60" />
            <p className="text-xs font-semibold text-text-main">
              Không tìm thấy công việc
            </p>
            <p className="max-w-[220px] text-[11px] text-text-muted">
              Không có tin đã lưu nào khớp với từ khóa &ldquo;{searchQuery}
              &rdquo;.
            </p>
          </div>
        )}

        {/* 2.5 Danh sách việc làm đã lưu */}
        {!isLoadingList &&
          !isErrorList &&
          jobs.map((job) => {
            const isSelected = selectedJobId === job.id;
            return (
              <div
                key={job.id}
                onClick={() => onSelectJob(job)}
                className={`group relative flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-all ${
                  isSelected
                    ? "border-primary bg-primary/8 shadow-xs ring-1 ring-primary/30"
                    : "border-border bg-surface hover:border-primary/40 hover:bg-bg/50"
                }`}
              >
                {/* Radio indicator */}
                <div
                  className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-all ${
                    isSelected
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-surface group-hover:border-primary/60"
                  }`}
                >
                  {isSelected && <Check className="size-2.5 stroke-[3]" />}
                </div>

                {/* Thông tin vắn tắt */}
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="line-clamp-1 text-xs leading-snug font-bold text-text-main">
                    {job.title}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-text-muted">
                    <Building2 className="size-3 text-text-muted/70 shrink-0" />
                    <span className="max-w-full truncate font-medium">
                      {job.companyName}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[10px] text-text-muted">
                    {job.location && (
                      <span className="flex items-center gap-0.5">
                        <MapPin className="size-2.5" />
                        <span className="max-w-full truncate">
                          {job.location}
                        </span>
                      </span>
                    )}
                    {job.workMode && (
                      <span className="text-text-muted/80">
                        • {getWorkModeLabel(job.workMode)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* 3. Phân trang ở chân cột trái */}
      {totalPages > 1 && (
        <div className="flex shrink-0 items-center justify-between border-t border-border/70 bg-surface px-3 py-2 text-xs">
          <Button
            variant="secondary"
            icon={ChevronLeft}
            iconSize={12}
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            className="h-6.5! rounded-md! px-2! py-0.5! text-[11px]!"
          >
            Trước
          </Button>
          <span className="text-[11px] text-text-muted">
            {page} / {totalPages}
          </span>
          <Button
            variant="secondary"
            icon={ChevronRight}
            iconSize={12}
            disabled={page >= totalPages}
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            className="h-6.5! rounded-md! px-2! py-0.5! text-[11px]!"
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
};
