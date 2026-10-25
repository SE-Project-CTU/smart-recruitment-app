import { CheckCircle2, Download, Edit3 } from "lucide-react";

interface CvBuilderTopBarProps {
  isCompleted: boolean;
  onComplete: () => void;
  onEdit: () => void;
  onDownload: () => void;
}

export default function CvBuilderTopBar({
  isCompleted,
  onComplete,
  onEdit,
  onDownload,
}: CvBuilderTopBarProps) {
  return (
    <header className="no-print sticky top-0 z-30 flex items-center justify-between border-b border-border bg-surface px-6 py-3 shadow-sm">
      <div className="flex items-center gap-3"></div>

      <div className="flex items-center gap-3">
        {!isCompleted ? (
          <button
            type="button"
            onClick={onComplete}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-surface shadow-md transition-all hover:bg-primary-dark"
          >
            <CheckCircle2 className="h-4 w-4 text-secondary" />
            Xác nhận hoàn tất CV
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onEdit}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-main transition-all hover:bg-bg"
            >
              <Edit3 className="h-4 w-4 text-text-muted" />
              Chỉnh sửa lại
            </button>

            <button
              type="button"
              onClick={onDownload}
              className="flex animate-pulse cursor-pointer items-center gap-2 rounded-full bg-status-success px-6 py-2.5 text-sm font-semibold text-surface shadow-md transition-all hover:animate-none hover:bg-green-600"
            >
              <Download className="h-4 w-4" />
              Tải xuống PDF (A4)
            </button>
          </>
        )}
      </div>
    </header>
  );
}
