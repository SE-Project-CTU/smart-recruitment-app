import React from "react";
import { Sparkles, Check, RefreshCw, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CvSectionSuggestion } from "./types";

interface SuggestionCardProps {
  item: CvSectionSuggestion;
  onApply: (id: string) => void;
  onRegenerate: (id: string) => void;
  onDismiss: (id: string) => void;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  item,
  onApply,
  onRegenerate,
  onDismiss,
}) => {
  const isApplied = item.status === "applied";
  const isGenerating = item.status === "generating";

  return (
    <div
      className={cn(
        "rounded-xl border bg-surface p-3.5 shadow-xs transition-all",
        isApplied
          ? "border-status-success/40 bg-status-success/5"
          : "border-border hover:border-primary/40",
      )}
    >
      {/* 1. Header thẻ: Tên section & Trạng thái */}
      <div className="mb-2.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-bold text-text-main">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          {item.sectionTitle}
        </span>

        {isApplied ? (
          <span className="flex items-center gap-1 rounded-full bg-status-success/15 px-2 py-0.5 text-[10px] font-semibold text-status-success">
            <CheckCircle2 className="h-3 w-3" />
            Đã áp dụng
          </span>
        ) : isGenerating ? (
          <span className="flex items-center gap-1 rounded-full bg-status-info/15 px-2 py-0.5 text-[10px] font-semibold text-status-info">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Đang tạo...
          </span>
        ) : (
          <span className="rounded-full bg-bg px-2 py-0.5 text-[10px] font-medium text-text-muted">
            Sẵn sàng áp dụng
          </span>
        )}
      </div>

      {/* 2. Nội dung hiện tại trên CV (để người dùng đối chiếu) */}
      <div className="mb-2.5 rounded-lg border border-border/70 bg-bg/60 p-2.5 text-xs text-text-muted">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Nội dung hiện tại:
        </p>
        <p className="leading-relaxed whitespace-pre-wrap">{item.originalText}</p>
      </div>

      {/* 3. Nội dung AI đề xuất */}
      <div className="mb-3 rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs text-text-main">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
            AI gợi ý viết lại:
          </p>
          {item.reason && (
            <span
              className="text-[10px] italic text-text-muted truncate max-w-[150px]"
              title={item.reason}
            >
              {item.reason}
            </span>
          )}
        </div>
        <p className="leading-relaxed font-medium whitespace-pre-wrap text-text-main">
          {item.suggestedText}
        </p>
      </div>

      {/* 4. Hành động: Áp dụng, Tạo lại, Bỏ qua */}
      {!isApplied && (
        <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-border/50">
          <button
            type="button"
            onClick={() => onDismiss(item.id)}
            className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-muted hover:bg-bg hover:text-text-main transition-colors"
            title="Bỏ qua gợi ý này"
          >
            <X className="h-3 w-3" />
            Bỏ qua
          </button>

          <button
            type="button"
            onClick={() => onRegenerate(item.id)}
            className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-text-muted hover:bg-bg hover:text-text-main transition-colors"
            title="Tạo lại gợi ý mới"
          >
            <RefreshCw className="h-3 w-3" />
            Tạo lại
          </button>

          <button
            type="button"
            onClick={() => onApply(item.id)}
            className="flex cursor-pointer items-center gap-1 rounded-md bg-primary px-3 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-primary/90 transition-all active:scale-95"
          >
            <Check className="h-3.5 w-3.5" />
            Áp dụng
          </button>
        </div>
      )}
    </div>
  );
};
