import React, { useState } from "react";
import { Briefcase, Building2, Pencil, X, type LucideIcon } from "lucide-react";
import { Button } from "@/components/common";
import { TargetJobSelectModal } from "./TargetJobSelectModal";
import type { TargetJobOption } from "./types";

export interface TargetJobSelectorCardProps {
  /** Công việc mục tiêu đang được chọn */
  selectedJob: TargetJobOption | null;
  /** Callback khi người dùng chọn hoặc bỏ chọn công việc */
  onSelectJob: (job: TargetJobOption | null) => void;
  /** Tiêu đề nhãn trên cùng của card, mặc định: "Vị trí công việc mục tiêu" */
  label?: string;
  /** Đoạn mô tả hướng dẫn hiển thị khi chưa chọn job */
  emptyDescription?: string;
  /** Chữ trên nút bấm chọn job khi chưa chọn, mặc định: "Chọn Job mục tiêu" */
  buttonText?: string;
  /** Tooltip cho nút đổi job, mặc định: "Thay đổi vị trí mục tiêu" */
  changeTooltip?: string;
  /** Tooltip cho nút bỏ chọn, mặc định: "Bỏ chọn vị trí này" */
  clearTooltip?: string;
  /** Callback bổ sung khi người dùng bấm bỏ chọn job */
  onClear?: () => void;
  /** Tiêu đề của modal chọn job */
  modalTitle?: string;
  /** Đoạn mô tả của modal chọn job */
  modalDescription?: string;
  /** Nhãn nút xác nhận trong modal */
  modalConfirmText?: string;
  /** Icon hiển thị ở header modal */
  modalHeaderIcon?: LucideIcon;
  /** Nội dung phía dưới (action button, banner lỗi/cảnh báo) */
  children?: React.ReactNode;
  /** Class tùy biến cho khung bọc ngoài */
  className?: string;
}

/**
 * TargetJobSelectorCard:
 * Component giao diện chọn và hiển thị công việc mục tiêu dùng chung cho:
 * - Tab Gợi ý viết lại (RewriteTab)
 * - Tab Chấm điểm CV (CvScoringTab)
 *
 * Giữ nguyên 100% style hiện tại từ tab Rewrite:
 * - Khung gọn gàng không viền thô
 * - Thẻ công việc nền primary/5
 * - Nút chỉnh sửa (Pencil) và bỏ chọn (X)
 * - Quản lý đóng/mở TargetJobSelectModal tập trung, tự động cập nhật
 */
export const TargetJobSelectorCard: React.FC<TargetJobSelectorCardProps> = ({
  selectedJob,
  onSelectJob,
  emptyDescription = "Chọn vị trí mong muốn để AI đối chiếu và điều chỉnh câu từ chuẩn xác",
  buttonText = "Chọn Job mục tiêu",
  changeTooltip = "Thay đổi vị trí mục tiêu",
  clearTooltip = "Bỏ chọn vị trí này",
  onClear,
  modalTitle = "Chọn vị trí công việc mục tiêu",
  modalDescription = "Đối chiếu và tối ưu hóa nội dung CV theo chuẩn Google XYZ dựa trên bản mô tả công việc (JD)",
  modalConfirmText = "Xác nhận chọn công việc mục tiêu",
  modalHeaderIcon = Briefcase,
  children,
  className = "",
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClear = () => {
    onSelectJob(null);
    if (onClear) {
      onClear();
    }
  };

  return (
    <>
      <div className={`space-y-2.5 rounded-xl ${className}`}>
        {/* Nội dung khi đã chọn hoặc chưa chọn */}
        {selectedJob ? (
          <div className="rounded-lg bg-primary/5 p-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 space-y-0.5">
                <h4 className="line-clamp-1 text-xs font-bold text-text-main">
                  {selectedJob.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-text-muted">
                  <Building2 className="size-3 shrink-0 text-text-muted/80" />
                  <span className="max-w-[180px] truncate font-medium">
                    {selectedJob.companyName}
                  </span>
                </div>
              </div>

              {/* Nút thao tác đổi / bỏ chọn */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="cursor-pointer rounded-md p-1 text-text-muted transition-colors hover:bg-bg hover:text-text-main"
                  title={changeTooltip}
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="cursor-pointer rounded-md p-1 text-text-muted transition-colors hover:bg-bg hover:text-status-error"
                  title={clearTooltip}
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg text-center">
            <Briefcase className="mb-1 size-5 text-text-muted/70" />
            <p className="text-xs font-medium text-text-main">
              Chưa chọn công việc mục tiêu
            </p>
            <p className="mt-0.5 max-w-[200px] text-[11px] text-text-muted">
              {emptyDescription}
            </p>
            <Button
              variant="secondary"
              icon={Briefcase}
              iconSize={13}
              onClick={() => setIsModalOpen(true)}
              className="mt-2.5! rounded-md! px-3! py-1.5! text-xs! font-semibold!"
            >
              {buttonText}
            </Button>
          </div>
        )}

        {/* Slot hành động & banner cảnh báo/lỗi nếu có */}
        {children}
      </div>

      {/* Modal chọn Job mục tiêu tái sử dụng */}
      <TargetJobSelectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedJob={selectedJob}
        title={modalTitle}
        description={modalDescription}
        confirmText={modalConfirmText}
        headerIcon={modalHeaderIcon}
        onConfirm={(job) => {
          onSelectJob(job);
        }}
      />
    </>
  );
};
