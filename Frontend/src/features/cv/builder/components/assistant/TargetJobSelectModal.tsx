import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/common";
import { PATHS } from "@/constants/paths";
import { useTargetJobSelection } from "../../hooks/useTargetJobSelection";
import { TargetJobListColumn } from "./TargetJobListColumn";
import { TargetJobDetailPreview } from "./TargetJobDetailPreview";
import type { TargetJobOption } from "./types";

export interface TargetJobSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedJob: TargetJobOption | null;
  onConfirm: (job: TargetJobOption | null) => void;
  title?: string;
  confirmText?: string;
}

/**
 * TargetJobSelectModal:
 * Modal chung chọn công việc mục tiêu từ danh sách tin đã lưu của ứng viên:
 * - Tái sử dụng linh hoạt giữa các tính năng: Viết lại CV (RewriteTab), Chấm điểm CV (CvScoringTab)...
 * - Hỗ trợ tùy biến tiêu đề, mô tả và nút xác nhận theo từng ngữ cảnh nghiệp vụ
 * - Cột trái: TargetJobListColumn (tìm kiếm debounce, danh sách tin đã lưu & phân trang)
 * - Cột phải: TargetJobDetailPreview (chi tiết bản mô tả công việc JD từ API)
 * - Tách biệt toàn bộ business logic qua hook useTargetJobSelection
 */
export const TargetJobSelectModal: React.FC<TargetJobSelectModalProps> = ({
  isOpen,
  onClose,
  selectedJob,
  onConfirm,
  title = "Chọn vị trí công việc mục tiêu",
  confirmText = "Xác nhận chọn công việc này",
}) => {
  const navigate = useNavigate();

  // Nghiệp vụ query, debounce, pagination & chi tiết JD từ hook chung
  const {
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    totalPages,
    totalItems,
    jobs,
    selectedJobId,
    selectedJobDetail,
    selectJob,
    isLoadingList,
    isErrorList,
    listErrorMessage,
    refetchList,
    isEmptyList,
    isNoSearchResults,
    isLoadingDetail,
    isErrorDetail,
    detailErrorMessage,
    refetchDetail,
  } = useTargetJobSelection({
    isOpen,
    initialSelectedJob: selectedJob,
    pageSize: 8,
  });

  const handleConfirm = () => {
    onConfirm(selectedJobDetail);
    onClose();
  };

  const handleGoToSearch = () => {
    onClose();
    navigate(PATHS.SEARCH_JOB);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        showCloseButton={true}
        className="flex h-[86vh]! max-h-[720px]! w-[92vw]! max-w-5xl! flex-col gap-0! overflow-hidden rounded-2xl! border-border! bg-surface! p-0! shadow-2xl!"
      >
        {/* ================= 1. HEADER MODAL ================= */}
        <DialogHeader className="shrink-0 border-b border-border/70 bg-surface px-5 py-5">
          <div className="flex items-center gap-2.5">
            <div className="space-y-0.5">
              <DialogTitle className="text-sm font-bold text-text-main">
                {title}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* ================= 2. BODY 2 CỘT ================= */}
        <div className="flex min-h-0 flex-1 overflow-hidden">
          {/* Cột trái: Tìm kiếm & Danh sách việc làm đã lưu */}
          <TargetJobListColumn
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            totalItems={totalItems}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            jobs={jobs}
            selectedJobId={selectedJobId}
            onSelectJob={selectJob}
            isLoadingList={isLoadingList}
            isErrorList={isErrorList}
            listErrorMessage={listErrorMessage}
            onRetryList={refetchList}
            isEmptyList={isEmptyList}
            isNoSearchResults={isNoSearchResults}
            onGoToSearch={handleGoToSearch}
          />

          {/* Cột phải: Chi tiết bản mô tả công việc JD */}
          <TargetJobDetailPreview
            selectedJob={selectedJobDetail}
            isLoadingDetail={isLoadingDetail}
            isErrorDetail={isErrorDetail}
            detailErrorMessage={detailErrorMessage}
            onRetryDetail={refetchDetail}
          />
        </div>

        {/* ================= 3. FOOTER MODAL ================= */}
        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border/70 bg-bg/50 px-5 py-3">
          <Button
            variant="secondary"
            onClick={onClose}
            className="rounded-lg! text-xs! font-medium!"
          >
            Hủy
          </Button>
          <Button
            variant="primary"
            disabled={!selectedJobDetail || isLoadingDetail}
            onClick={handleConfirm}
            className="rounded-lg! text-xs! font-semibold!"
          >
            {confirmText}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
