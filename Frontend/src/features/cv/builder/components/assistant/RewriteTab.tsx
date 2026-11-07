import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Sparkles,
  RefreshCw,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/common";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";
import { useCvRewriteContext } from "../../context/CvRewriteContext";
import { SuggestionCard } from "./SuggestionCard";
import { SuggestionCardSkeleton } from "./SuggestionCardSkeleton";
import { TargetJobSelectorCard } from "./TargetJobSelectorCard";

/**
 * RewriteTab:
 * Tab Gợi ý viết lại CV theo Job mục tiêu tích hợp API Batching:
 * - Cho phép chọn một Job mục tiêu mẫu hoặc từ hệ thống qua TargetJobSelectorCard
 * - Nút "Tạo gợi ý" quét và gom các section có nội dung trong form CV gửi lên POST /api/v1/ai/cv/enhance/batch
 * - Hiển thị đề xuất thật theo chuẩn Google XYZ từ Gemini AI cho từng section
 * - Cho phép bỏ qua card đề xuất và Tạo lại toàn bộ
 * - Lưu giữ trạng thái trong phạm vi CV Builder qua CvRewriteContext
 */
export const RewriteTab: React.FC = () => {
  const { getValues } = useFormContext<RichTextCvEditorValues>();
  const [validationHint, setValidationHint] = useState<string | null>(null);

  const {
    selectedTargetJob,
    suggestions,
    isGenerating,
    hasGenerated,
    isError,
    errorMessage,
    setSelectedTargetJob,
    generateSuggestions,
    dismissSuggestion,
    regenerateAll,
  } = useCvRewriteContext();

  const activeSuggestions = suggestions.filter((s) => s.status !== "dismissed");

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

  const handleRegenerateAllClick = async () => {
    setValidationHint(null);
    const formValues = getValues();
    await regenerateAll(formValues);
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
        {/* Nút Tạo gợi ý */}
        <div className="pt-1">
          <Button
            variant="primary"
            icon={Sparkles}
            iconSize={14}
            isLoading={isGenerating}
            onClick={handleGenerateClick}
            className="w-full! rounded-md! px-3! text-xs! font-semibold!"
          >
            {hasGenerated ? "Tạo lại toàn bộ gợi ý" : "Tạo gợi ý viết lại"}
          </Button>
        </div>

        {/* Banner hướng dẫn / thông báo kiểm tra */}
        {validationHint && (
          <div className="flex items-start gap-2 rounded-lg border border-status-warning/40 bg-status-warning/10 p-2.5 text-[11px] text-text-main">
            <AlertCircle className="size-3.5 shrink-0 text-status-warning mt-0.5" />
            <p className="leading-relaxed">{validationHint}</p>
          </div>
        )}

        {/* Banner lỗi từ API Backend */}
        {isError && errorMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-status-error/40 bg-status-error/10 p-2.5 text-[11px] text-text-main">
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

      {/* ================= 2. TRẠNG THÁI ĐANG XỬ LÝ (SKELETON CARDS) ================= */}
      {isGenerating && (
        <div className="space-y-3">
          {/* Danh sách Skeleton của các thẻ gợi ý (SuggestionCard) */}
          <div className="space-y-3">
            <SuggestionCardSkeleton isExpanded={false} />
            <SuggestionCardSkeleton isExpanded={false} />
            <SuggestionCardSkeleton isExpanded={false} />
          </div>
        </div>
      )}

      {/* ================= 3. DANH SÁCH ĐỀ XUẤT VIẾT LẠI ================= */}
      {!isGenerating && hasGenerated && (
        <div className="space-y-3">
          {/* Header toolbar kết quả */}
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-text-main">
              <Sparkles className="size-3.5 text-primary" />
              <span>Đề xuất theo mục ({activeSuggestions.length})</span>
            </div>

            {activeSuggestions.length > 0 && (
              <Button
                variant="secondary"
                icon={RefreshCw}
                iconSize={12}
                isLoading={isGenerating}
                onClick={handleRegenerateAllClick}
                className="h-6.5! rounded-md! px-2! py-0.5! text-[11px]! font-medium!"
                title="Tạo lại toàn bộ đề xuất"
              >
                Tạo lại
              </Button>
            )}
          </div>

          {activeSuggestions.length === 0 ? (
            <div className="flex h-44 flex-col items-center justify-center gap-2 rounded-xl border border-border bg-surface p-4 text-center">
              <FileText className="size-6 text-text-muted/60" />
              <p className="text-xs font-semibold text-text-main">
                Bạn đã xử lý hết các đề xuất
              </p>
              <p className="text-[11px] text-text-muted">
                Tất cả các thẻ đề xuất từ AI đã được ẩn đi.
              </p>
              <Button
                variant="secondary"
                icon={RefreshCw}
                iconSize={12}
                isLoading={isGenerating}
                onClick={handleRegenerateAllClick}
                className="mt-1! h-7! rounded-lg! px-3! py-1! text-[11px]! font-semibold!"
              >
                Tạo lại đề xuất
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSuggestions.map((item) => (
                <SuggestionCard
                  key={item.id}
                  item={item}
                  onDismiss={dismissSuggestion}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
