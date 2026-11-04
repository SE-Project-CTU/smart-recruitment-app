import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import { RefreshCw, FileText } from "lucide-react";
import { toast } from "@/components/ui/toast";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";
import { createTiptapDocumentFromText } from "../../utils/tiptapJson";
import { MOCK_REWRITE_SUGGESTIONS, MOCK_SKILL_ANALYSIS } from "./mockData";
import { SuggestionCard } from "./SuggestionCard";
import { SkillComparisonBox } from "./SkillComparisonBox";
import type { CvSectionSuggestion } from "./types";

/**
 * RewriteTab:
 * Tab Viết lại CV bằng AI trong Sidebar:
 * - Hiển thị gợi ý viết lại theo từng section với đối chiếu trực quan.
 * - Cho phép Áp dụng trực tiếp vào React Hook Form của CV.
 * - Bảng đối chiếu kỹ năng không tự ý thêm vào CV.
 */
export const RewriteTab: React.FC = () => {
  const [suggestions, setSuggestions] = useState<CvSectionSuggestion[]>(
    MOCK_REWRITE_SUGGESTIONS,
  );
  const [isLoading, setIsLoading] = useState(false);

  const { setValue, getValues } = useFormContext<RichTextCvEditorValues>();

  const activeSuggestions = suggestions.filter((s) => s.status !== "dismissed");

  const handleApplySuggestion = (suggestionId: string) => {
    const target = suggestions.find((s) => s.id === suggestionId);
    if (!target) return;

    const doc = createTiptapDocumentFromText(target.suggestedText);

    if (target.sectionKey === "objective") {
      setValue("content.sections.objective.content", doc, {
        shouldDirty: true,
        shouldValidate: true,
      });
    } else if (target.sectionKey === "experience") {
      const currentItems = getValues("content.sections.experience.items") || [];
      if (currentItems.length > 0) {
        setValue("content.sections.experience.items.0.description", doc, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    } else if (target.sectionKey === "projects") {
      const currentItems = getValues("content.sections.projects.items") || [];
      if (currentItems.length > 0) {
        setValue("content.sections.projects.items.0.description", doc, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }

    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status: "applied" } : s)),
    );

    toast.add({
      type: "success",
      description: `Đã áp dụng đề xuất cho mục ${target.sectionTitle}.`,
    });
  };

  const handleRegenerateSuggestion = (suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status: "generating" } : s)),
    );

    setTimeout(() => {
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId
            ? {
                ...s,
                status: "ready",
                suggestedText: `${s.suggestedText} (Được bổ sung thêm động từ hành động và số liệu đo lường).`,
              }
            : s,
        ),
      );
    }, 800);
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status: "dismissed" } : s)),
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3 p-4 text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs font-medium text-text-muted">
          AI đang phân tích và tạo gợi ý viết lại từng section...
        </p>
      </div>
    );
  }

  if (activeSuggestions.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 p-4 text-center">
        <FileText className="h-8 w-8 text-text-muted/60" />
        <p className="text-xs font-semibold text-text-main">
          Chưa có đề xuất viết lại nào
        </p>
        <p className="text-[11px] text-text-muted">
          Nội dung CV hiện tại đã khá hoàn chỉnh hoặc bạn đã xử lý hết các đề xuất.
        </p>
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => {
              setSuggestions(MOCK_REWRITE_SUGGESTIONS);
              setIsLoading(false);
            }, 600);
          }}
          className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          Phân tích lại gợi ý
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 1. Danh sách đề xuất theo section - Render động */}
      <div className="space-y-3">
        {activeSuggestions.map((item) => (
          <SuggestionCard
            key={item.id}
            item={item}
            onApply={handleApplySuggestion}
            onRegenerate={handleRegenerateSuggestion}
            onDismiss={handleDismissSuggestion}
          />
        ))}
      </div>

      {/* 2. Khối đối chiếu kỹ năng */}
      <SkillComparisonBox skillAnalysis={MOCK_SKILL_ANALYSIS} />

      {/* 3. Footer hành động của tab */}
      <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-text-muted">
        <span>
          {suggestions.filter((s) => s.status === "applied").length}/
          {suggestions.length} đề xuất đã áp dụng
        </span>
        <button
          type="button"
          onClick={() => {
            setIsLoading(true);
            setTimeout(() => setIsLoading(false), 600);
          }}
          className="flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          Làm mới gợi ý
        </button>
      </div>
    </div>
  );
};
