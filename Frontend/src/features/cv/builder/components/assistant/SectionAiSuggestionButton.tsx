import React from "react";
import { Sparkles } from "lucide-react";
import { useCvRewriteContext } from "../../context/CvRewriteContext";
import { cn } from "@/lib/utils";

interface SectionAiSuggestionButtonProps {
  sectionKey: string;
  className?: string;
}

export const SectionAiSuggestionButton: React.FC<
  SectionAiSuggestionButtonProps
> = ({ sectionKey, className = "" }) => {
  const {
    activeSuggestionSectionKey,
    getSuggestionForSection,
    openSuggestionForSection,
    closeFloatingSuggestion,
  } = useCvRewriteContext();

  const suggestion = getSuggestionForSection(sectionKey);

  if (!suggestion) {
    return null;
  }

  const isActive =
    activeSuggestionSectionKey?.toLowerCase() === sectionKey.toLowerCase();

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      closeFloatingSuggestion();
    } else {
      openSuggestionForSection(sectionKey);
    }
  };

  if (isActive) {
    return null; // Không hiển thị nút khi đang xem gợi ý
  }

  return (
    <div
      className={cn(
        "no-print inline-flex items-center font-normal normal-case select-none",
        className,
      )}
    >
      <button
        type="button"
        data-ai-suggestion-trigger="true"
        onClick={handleToggle}
        title="Xem gợi ý viết lại từ AI"
        aria-expanded={false}
        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white shadow-xs transition-all hover:bg-primary-dark"
      >
        <Sparkles className="size-3.5 text-secondary-light" />
        <span>Xem gợi ý</span>
      </button>
    </div>
  );
};
