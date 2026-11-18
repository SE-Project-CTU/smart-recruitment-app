import React, { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
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

  return (
    <div className="rounded-md border border-border bg-surface shadow-xs transition-all select-text hover:border-primary/40">
      {/* 1. Header thẻ: Tên section độc lập (dành trọn vẹn không gian hiển thị dù tiêu đề dài) */}
      <div className="flex items-center gap-2 border-b border-border/50 rounded-t-md px-3.5 pt-3 pb-2 select-text bg-primary/10">
        <h4 className="text-xs leading-snug font-bold break-words text-text-main select-text">
          {item.sectionTitle}
        </h4>
      </div>

      {/* 2. Body: Chứa nút mở rộng / thu gọn và nội dung chi tiết */}
      <div className=" py-1.5 select-text">
        {isExpanded ? (
          <div className="space-y-2.5 select-text ">
            {/* Nội dung hiện tại trên CV (để đối chiếu) */}
            <div className="text-xs select-text px-3.5">
              <p className="mb-1 text-[10px] font-semibold tracking-wider uppercase select-none">
                Nội dung hiện tại:
              </p>
              <p className="max-h-36 cursor-text overflow-y-auto text-[11px] leading-relaxed whitespace-pre-wrap select-text">
                {item.originalText}
              </p>
            </div>

            {/* Nội dung AI đề xuất viết lại */}
            <div className="text-xs text-text-main select-text bg-primary/5 px-3.5 py-1.5">
              <div className="mb-1.5 flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold tracking-wider text-primary uppercase select-none">
                  AI gợi ý viết lại:
                </p>
              </div>
              <p className="cursor-text text-[11px] leading-relaxed font-medium whitespace-pre-wrap text-text-main select-text">
                {item.suggestedText}
              </p>

              <div className="h-px bg-border/50 my-2" />

              {item.reason && (
                <div className="mt-2 text-[10px] text-text-muted italic select-text">
                  <span className="font-semibold text-primary not-italic select-none">
                    Lý do:{" "}
                  </span>
                  <span className="cursor-text select-text">{item.reason}</span>
                </div>
              )}
              {item.additionalSuggestions && item.additionalSuggestions.length > 0 && (
                <div className="mt-2 text-[10px] text-text-muted select-text">
                  <p className="font-semibold text-primary">Gợi ý bổ sung:</p>
                  <ul className="mt-1 list-disc space-y-1 pl-4">
                    {item.additionalSuggestions.map((suggestion, index) => (
                      <li key={`${item.id}-additional-${index}`}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Nút thu gọn nằm ở body */}
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="flex w-full cursor-pointer items-center justify-center gap-1 py-1.5 text-[11px] font-medium text-text-muted transition-colors select-none hover:text-primary"
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
            className="flex w-full cursor-pointer items-center justify-center px-3 py-2 text-xs text-text-muted transition-all select-none hover:text-primary"
          >
            <span className="text-[11px] font-medium">
              Xem chi tiết gợi ý AI
            </span>
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
