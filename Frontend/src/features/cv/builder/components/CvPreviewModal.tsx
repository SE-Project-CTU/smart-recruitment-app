import React, { useEffect, useRef } from "react";
import { Eye, X } from "lucide-react";
import { CvPreviewWorkspace } from "../../templates/CvPreviewWorkspace";
import type { RichTextCVContentDocument, CVLayoutDocument } from "@/types/cv";
import { useCvZoom } from "../hooks/useCvZoom";
import { CvZoomControls } from "./CvZoomControls";

interface CvPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: RichTextCVContentDocument;
  layout: CVLayoutDocument;
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
  content,
  layout,
  title = "Xem trước CV",
}) => {
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoom,
    canZoomIn,
    canZoomOut,
  } = useCvZoom({ containerRef: previewScrollRef });

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
          {title}
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
      <div
        ref={previewScrollRef}
        className="relative flex flex-1 justify-center overflow-auto p-2 md:p-4"
      >
        <div className="h-max">
          <div
            className="bg-gray-100 p-4"
            style={{
              transform: zoom !== 1 ? `scale(${zoom})` : undefined,
              transformOrigin: "top center",
              marginBottom:
                zoom > 1 ? `calc((297mm + 4rem) * ${zoom - 1} + 2rem)` : "2rem",
            }}
          >
            <CvPreviewWorkspace
              content={content}
              layout={layout}
              className="bg-transparent!"
            />
          </div>
        </div>
        <CvZoomControls
          zoom={zoom}
          onZoomIn={zoomIn}
          onZoomOut={zoomOut}
          onResetZoom={resetZoom}
          onZoomChange={setZoom}
          canZoomIn={canZoomIn}
          canZoomOut={canZoomOut}
          className="fixed! bottom-6! right-6!"
        />
      </div>
    </div>
  );
};

export default CvPreviewModal;
