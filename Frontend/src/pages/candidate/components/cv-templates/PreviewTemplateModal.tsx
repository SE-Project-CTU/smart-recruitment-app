import React from "react";
import { Eye, X } from "lucide-react";

interface PreviewTemplateModalProps {
  previewItem: {
    title: string;
    imageUrl?: string;
  } | null;
  onClose: () => void;
}

export const PreviewTemplateModal: React.FC<PreviewTemplateModalProps> = ({
  previewItem,
  onClose,
}) => {
  if (!previewItem) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs duration-200">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-surface shadow-2xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-2">
            <Eye className="size-5 text-primary" />
            <h3 className="text-sm font-bold text-text-main">
              {previewItem.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-text-muted hover:bg-bg hover:text-text-main"
            title="Đóng xem trước"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          {previewItem.imageUrl ? (
            <img
              src={previewItem.imageUrl}
              alt={previewItem.title}
              className="w-full rounded-2xl border border-border object-contain shadow-sm"
            />
          ) : (
            <div className="flex h-64 items-center justify-center text-xs text-text-muted">
              Không có hình ảnh xem trước
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
