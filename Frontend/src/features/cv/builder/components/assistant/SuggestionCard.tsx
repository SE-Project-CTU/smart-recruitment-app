import React, { useState } from "react";
import { X, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import { Button } from "@/components/common";
import type { CvSectionSuggestion } from "./types";

interface SuggestionCardProps {
  item: CvSectionSuggestion;
  onDismiss: (id: string) => void;
  defaultExpanded?: boolean;
}

export const SuggestionCard: React.FC<SuggestionCardProps> = ({
  item,
  onDismiss,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);

  const handleCopySuggestedText = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.suggestedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback nếu trình duyệt chặn clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = item.suggestedText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface shadow-xs transition-all hover:border-primary/40 select-text">
      {/* 1. Header thẻ: Tên section độc lập (dành trọn vẹn không gian hiển thị dù tiêu đề dài) */}
      <div className="flex items-center gap-2 rounded-t-xl px-3.5 pt-3 pb-2 select-text">
        <h4 className="text-xs font-bold leading-snug text-text-main break-words select-text">
          {item.sectionTitle}
        </h4>
      </div>

      {/* 2. Body: Chứa nút mở rộng / thu gọn và nội dung chi tiết */}
      <div className="px-3.5 py-1.5 select-text">
        {isExpanded ? (
          <div className="space-y-2.5 select-text">
            {/* Nội dung hiện tại trên CV (để đối chiếu) */}
            <div className="rounded-lg border border-border/70 bg-bg/60 p-2.5 text-xs text-text-muted select-text">
              <p className="mb-1 text-[10px] font-semibold tracking-wider text-text-muted uppercase select-none">
                Nội dung hiện tại:
              </p>
              <p className="max-h-36 overflow-y-auto text-[11px] leading-relaxed whitespace-pre-wrap text-text-muted select-text cursor-text">
                {item.originalText}
              </p>
            </div>

            {/* Nội dung AI đề xuất viết lại */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs text-text-main select-text">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-semibold tracking-wider text-primary uppercase select-none">
                  AI gợi ý viết lại (chuẩn Google XYZ):
                </p>
                <button
                  type="button"
                  onClick={handleCopySuggestedText}
                  className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10 transition-colors cursor-pointer select-none"
                  title="Sao chép nội dung gợi ý"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-status-success" />
                      <span className="text-status-success font-semibold">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] font-medium leading-relaxed whitespace-pre-wrap text-text-main select-text cursor-text">
                {item.suggestedText}
              </p>
              {item.reason && (
                <div className="mt-2 border-t border-primary/15 pt-1.5 text-[10px] text-text-muted italic select-text">
                  <span className="font-semibold text-primary not-italic select-none">
                    Lý do:{" "}
                  </span>
                  <span className="select-text cursor-text">{item.reason}</span>
                </div>
              )}
            </div>

            {/* Nút thu gọn nằm ở body */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="flex w-full items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-text-muted hover:text-primary transition-colors cursor-pointer select-none"
            >
              <span>Thu gọn nội dung</span>
              <ChevronUp className="size-3.5" />
            </button>
          </div>
        ) : (
          /* Khi thu gọn (mặc định): Nút mở rộng nằm ở body */
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="flex w-full items-center justify-center px-3 py-2 text-xs text-text-muted hover:text-primary transition-all cursor-pointer select-none"
          >
            <span className="text-[11px] font-medium">Xem chi tiết gợi ý AI</span>
            <ChevronDown className="size-3.5 shrink-0" />
          </button>
        )}
      </div>

      {/* 3. Footer: Nút Bỏ qua như hiện tại */}
      <div className="flex items-center justify-end border-t border-border/50 px-3.5 py-2 select-none">
        <Button
          variant="secondary"
          icon={X}
          iconSize={12}
          onClick={() => onDismiss(item.id)}
          className="h-6.5! rounded-md! px-2.5! py-1! text-[11px]! font-medium!"
          title="Bỏ qua đề xuất này"
        >
          Bỏ qua
        </Button>
      </div>
    </div>
  );
};
