import React, { useEffect } from "react";
import { Eye, X } from "lucide-react";
import { CvPreviewWorkspace } from "../../templates/CvPreviewWorkspace";
import type { CvRenderData } from "../../templates/types";

interface CvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: CvRenderData;
  title?: string;
}

/**
 * CvPreviewModal:
 * Modal xem trước CV toàn màn hình / popup ở chế độ chỉ đọc (Read-only).
 * Cho phép ứng viên kiểm tra bản in A4 thực tế trước khi lưu hoặc tải trực tiếp PDF.
 */
export const CvPreviewModal: React.FC<CvPreviewModalProps> = ({
  isOpen,
  onClose,
  data,
  title,
}) => {
  const displayTitle =
    title ||
    ("title" in data && typeof data.title === "string" && data.title) ||
    "Xem trước CV";

  // Đóng modal khi bấm phím ESC
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Ngăn cuộn trang bên dưới khi đang mở modal xem trước
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="animate-in fade-in fixed inset-0 z-100 flex flex-col bg-slate-900/30 backdrop-blur-xs duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="preview-modal-title"
    >
      {/* 1. Header điều khiển */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 bg-surface px-6 shadow-xs">
        <div className="flex flex-1 items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Eye className="h-4 w-4" />
          </div>
          <div className="font-semibold">Xem trước CV</div>
        </div>

        <h2
          id="preview-modal-title"
          className="line-clamp-1 flex-2 text-center text-lg font-semibold text-text-main"
        >
          {displayTitle}
        </h2>
        <div className="flex flex-1 items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex cursor-pointer gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-medium text-text-muted transition-colors hover:bg-bg hover:text-text-main"
            title="Đóng xem trước"
          >
            <X className="h-3.5 w-3.5" />
            Đóng
          </button>
        </div>
      </header>

      {/* 2. Khung hiển thị trang A4 căn giữa cuộn mượt mà */}
      <div className="flex flex-1 justify-center overflow-y-auto p-2 md:p-4">
        <div className="h-max bg-gray-100 p-4">
          <CvPreviewWorkspace
            data={data}
            className="bg-transparent!"
          />
        </div>
      </div>
    </div>
  );
};

export default CvPreviewModal;
