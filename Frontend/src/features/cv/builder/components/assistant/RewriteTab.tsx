import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Sparkles,
  AlertCircle,
  ChevronDown,
  Target,
  GraduationCap,
  Wrench,
  Folder,
  Briefcase,
  Award,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/common";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";
import { useCvRewriteContext } from "../../context/CvRewriteContext";
import { TargetJobSelectorCard } from "./TargetJobSelectorCard";
import { scrollCvSectionIntoView } from "../../utils/cvAssistantHelpers";
import { cn } from "@/lib/utils";

interface CategoryItem {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  aliasKeys?: string[];
}

const CV_CATEGORIES: CategoryItem[] = [
  { key: "objective", label: "Objective", icon: Target },
  { key: "education", label: "Education", icon: GraduationCap },
  { key: "skills", label: "Skills", icon: Wrench },
  { key: "projects", label: "Projects", icon: Folder },
  { key: "experience", label: "Experience", icon: Briefcase },
  { key: "certifications", label: "Certificates", icon: Award },
  {
    key: "others",
    label: "Others",
    icon: MoreHorizontal,
    aliasKeys: ["awards", "interests", "additionalInfo"],
  },
];

/**
 * RewriteTab:
 * Tab Gợi ý viết lại CV theo Job mục tiêu:
 * 1. Tách nơi tạo gợi ý khỏi nơi đọc gợi ý:
 *    - Giữ sidebar gọn gàng cho chọn JD, nhập mong muốn bổ sung (dạng thu gọn), nút tạo gợi ý và danh mục mục CV ngắn gọn.
 *    - Đã loại bỏ các đoạn so sánh dài lê thê trong sidebar; nhường không gian hiển thị cho bản CV và chế độ so sánh 2 cột.
 * 2. Cho phép người dùng click nhanh vào danh mục để cuộn mượt tới section tương ứng trên bản CV và mở bảng so sánh gợi ý.
 */
export const RewriteTab: React.FC = () => {
  const { getValues } = useFormContext<RichTextCvEditorValues>();
  const [validationHint, setValidationHint] = useState<string | null>(null);
  const [isPromptAccordionOpen, setIsPromptAccordionOpen] = useState(false);

  const {
    suggestions,
    selectedTargetJob,
    customPrompt,
    setCustomPrompt,
    isGenerating,
    hasGenerated,
    isError,
    errorMessage,
    activeSuggestionSectionKey,
    openSuggestionForSection,
    getSuggestionForSection,
    setSelectedTargetJob,
    generateSuggestions,
  } = useCvRewriteContext();

  const hasAnySuggestions = suggestions.some((s) => s.status !== "dismissed");

  // Xử lý khi nhấn nút "Tạo gợi ý"
  const handleGenerateClick = async () => {
    setValidationHint(null);
    const formValues = getValues();
    const result = await generateSuggestions(formValues);

    if (!result.success) {
      if (result.reason === "NO_JOB") {
        setValidationHint(
          "Vui lòng chọn một công việc mục tiêu để AI có căn cứ tối ưu hóa nội dung CV.",
        );
      } else if (result.reason === "NO_SECTIONS") {
        setValidationHint(
          "CV của bạn chưa có nội dung ở các mục hỗ trợ (Mục tiêu, Kinh nghiệm, Kỹ năng, Dự án, Học vấn). Vui lòng nhập nội dung vào CV trước khi tạo gợi ý.",
        );
      }
    }
  };

  // Cuộn trang CV đến mục được chọn và mở bảng so sánh nếu có gợi ý
  const handleCategoryClick = (category: CategoryItem) => {
    let matchedKey = category.key;

    if (!document.querySelector(`.section-${category.key}`) && category.aliasKeys) {
      for (const alias of category.aliasKeys) {
        if (document.querySelector(`.section-${alias}`)) {
          matchedKey = alias;
          break;
        }
      }
    }

    scrollCvSectionIntoView(matchedKey);

    const suggestion = getSuggestionForSection(matchedKey);
    if (suggestion) {
      openSuggestionForSection(matchedKey);
    }
  };

  return (
    <div className="space-y-4">

      {/* ================= 1. KHỐI CHỌN JOB MỤC TIÊU ================= */}
      <TargetJobSelectorCard
        selectedJob={selectedTargetJob}
        onSelectJob={(job) => {
          setSelectedTargetJob(job);
          setValidationHint(null);
        }}
        modalTitle="Chọn vị trí công việc mục tiêu"
        modalDescription="Đối chiếu và tối ưu hóa nội dung CV theo chuẩn Google XYZ dựa trên bản mô tả công việc"
        modalConfirmText="Xác nhận chọn công việc mục tiêu"
      >
        {/* Accordion: Mong muốn hoặc thông tin bổ sung */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsPromptAccordionOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-md py-1.5 text-xs font-semibold text-text-main hover:text-primary transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span>Mong muốn hoặc thông tin bổ sung</span>
            </div>
            <ChevronDown
              className={cn(
                "size-3.5 text-text-muted transition-transform duration-200",
                isPromptAccordionOpen && "rotate-180",
              )}
            />
          </button>

          {isPromptAccordionOpen && (
            <div className="mt-1.5 space-y-1.5 animate-in fade-in duration-150">
              <textarea
                id="cv-enhance-custom-prompt"
                value={customPrompt}
                onChange={(event) => setCustomPrompt(event.target.value)}
                maxLength={2000}
                rows={3}
                placeholder="Ví dụ: Viết mục tiêu ngắn gọn hơn. Ở dự án SmartHire, tôi đã tối ưu 28 API đạt 99% SLA."
                className="w-full min-h-16 max-h-48 resize-y rounded-md border border-border bg-surface px-2.5 py-2 text-xs text-text-main placeholder:text-text-muted focus:border-primary focus:outline-none"
              />
              <p className="text-[10px] text-text-muted">
                Áp dụng cho mọi mục CV. {customPrompt.length}/2000 ký tự
              </p>
            </div>
          )}
        </div>

        {/* Nút Tạo gợi ý */}
        <div className="pt-2">
          <Button
            variant="primary"
            icon={Sparkles}
            iconSize={14}
            isLoading={isGenerating}
            onClick={handleGenerateClick}
            className="w-full! rounded-md! px-3! text-xs! font-semibold!"
          >
            {hasGeneratingText(hasGenerated, isGenerating)}
          </Button>
        </div>

        {/* Banner hướng dẫn / thông báo kiểm tra */}
        {validationHint && (
          <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-status-warning/40 bg-status-warning/10 p-2.5 text-[11px] text-text-main">
            <AlertCircle className="size-3.5 shrink-0 text-status-warning mt-0.5" />
            <p className="leading-relaxed">{validationHint}</p>
          </div>
        )}

        {/* Banner lỗi từ API Backend */}
        {isError && errorMessage && (
          <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-status-error/40 bg-status-error/10 p-2.5 text-[11px] text-text-main">
            <AlertCircle className="size-3.5 shrink-0 text-status-error mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="leading-relaxed font-medium text-status-error">
                {errorMessage}
              </p>
              <button
                type="button"
                onClick={handleGenerateClick}
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                Thử lại ngay →
              </button>
            </div>
          </div>
        )}
      </TargetJobSelectorCard>

      {/* ================= 2. KHỐI DANH MỤC TRONG CV (CHỈ HIỂN THỊ KHI CÓ GỢI Ý) ================= */}
      {hasAnySuggestions && (
        <div className="space-y-2 pt-2 animate-in fade-in duration-200">
          <h4 className="text-xs font-semibold text-text-main">
            Danh mục trong CV
          </h4>

          <div className="space-y-1">
            {CV_CATEGORIES.map((category) => {
              const IconComponent = category.icon;

              // Kiểm tra trạng thái active (đang mở bảng so sánh cho mục này)
              const isActive =
                activeSuggestionSectionKey === category.key ||
                Boolean(
                  category.aliasKeys &&
                    activeSuggestionSectionKey &&
                    category.aliasKeys.includes(activeSuggestionSectionKey),
                );

              return (
                <button
                  key={category.key}
                  type="button"
                  onClick={() => handleCategoryClick(category)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors cursor-pointer text-left",
                    isActive
                      ? "bg-[#ecf5f9] text-[#1b3b6f] font-semibold"
                      : "text-text-muted hover:bg-slate-100/80 hover:text-text-main",
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <IconComponent
                      className={cn(
                        "size-4 shrink-0",
                        isActive ? "text-[#1b3b6f]" : "text-text-muted",
                      )}
                    />
                    <span>{category.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

function hasGeneratingText(hasGenerated: boolean, isGenerating: boolean): string {
  if (isGenerating) return "Đang tạo gợi ý...";
  if (hasGenerated) return "Nhận lại toàn bộ gợi ý";
  return "Nhận gợi ý";
}
