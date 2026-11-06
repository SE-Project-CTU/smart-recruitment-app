import React, { useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Sparkles,
  Briefcase,
  Building2,
  RefreshCw,
  AlertCircle,
  FileText,
  X,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/common";
import type { RichTextCvEditorValues } from "../../schema/richTextCvSchema";
import { useCvRewriteContext } from "../../context/CvRewriteContext";
import { SuggestionCard } from "./SuggestionCard";
import { TargetJobSelectModal } from "./TargetJobSelectModal";

/**
 * RewriteTab:
 * Tab Gợi ý viết lại CV theo Job mục tiêu tích hợp API Batching:
 * - Cho phép chọn một Job mục tiêu mẫu hoặc từ hệ thống qua TargetJobSelectModal
 * - Nút "Tạo gợi ý" quét và gom các section có nội dung trong form CV gửi lên POST /api/v1/ai/cv/enhance/batch
 * - Hiển thị đề xuất thật theo chuẩn Google XYZ từ Gemini AI cho từng section
 * - Cho phép bỏ qua card đề xuất và Tạo lại toàn bộ
 * - Lưu giữ trạng thái trong phạm vi CV Builder qua CvRewriteContext
 */
export const RewriteTab: React.FC = () => {
  const { getValues } = useFormContext<RichTextCvEditorValues>();
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
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
      <div className="rounded-xl border border-border bg-surface p-3.5 space-y-2.5 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
            Vị trí công việc mục tiêu
          </span>
        </div>

        {selectedTargetJob ? (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-bold text-text-main line-clamp-1">
                  {selectedTargetJob.title}
                </h4>
                <div className="flex items-center gap-1 text-[11px] text-text-muted">
                  <Building2 className="size-3 shrink-0 text-text-muted/80" />
                  <span className="font-medium truncate max-w-[180px]">
                    {selectedTargetJob.companyName}
                  </span>
                </div>
              </div>

              {/* Nút thao tác đổi / bỏ chọn */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsJobModalOpen(true)}
                  className="rounded-md p-1 text-text-muted hover:bg-bg hover:text-text-main transition-colors cursor-pointer"
                  title="Thay đổi vị trí mục tiêu"
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedTargetJob(null)}
                  className="rounded-md p-1 text-text-muted hover:bg-bg hover:text-status-error transition-colors cursor-pointer"
                  title="Bỏ chọn vị trí này"
                >
                  <X className="size-3" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-bg/50 p-3.5 text-center">
            <Briefcase className="size-5 text-text-muted/70 mb-1" />
            <p className="text-xs font-medium text-text-main">
              Chưa chọn công việc mục tiêu
            </p>
            <p className="mt-0.5 text-[11px] text-text-muted max-w-[200px]">
              Chọn vị trí mong muốn để AI đối chiếu và điều chỉnh câu từ chuẩn xác
            </p>
            <Button
              variant="secondary"
              icon={Briefcase}
              iconSize={13}
              onClick={() => setIsJobModalOpen(true)}
              className="mt-2.5! rounded-lg! px-3! py-1.5! text-xs! font-semibold!"
            >
              Chọn Job mục tiêu
            </Button>
          </div>
        )}

        {/* Nút Tạo gợi ý */}
        <div className="pt-1">
          <Button
            variant="primary"
            icon={Sparkles}
            iconSize={14}
            isLoading={isGenerating}
            onClick={handleGenerateClick}
            className="w-full! rounded-xl! py-2! text-xs! font-semibold!"
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
      </div>

      {/* ================= 2. TRẠNG THÁI ĐANG XỬ LÝ ================= */}
      {isGenerating && (
        <div className="flex h-52 flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface p-4 text-center shadow-xs">
          <p className="text-xs font-semibold text-text-main">
            Gemini AI đang phân tích và tối ưu hóa nội dung...
          </p>
          <p className="text-[11px] text-text-muted max-w-[230px]">
            Đang áp dụng chuẩn Google XYZ dựa trên vị trí{" "}
            <span className="font-semibold text-text-main">
              {selectedTargetJob?.title}
            </span>
          </p>
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

      {/* ================= 4. MODAL CHỌN JOB MỤC TIÊU ================= */}
      <TargetJobSelectModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        selectedJob={selectedTargetJob}
        onConfirm={(job) => {
          setSelectedTargetJob(job);
          setValidationHint(null);
        }}
      />
    </div>
  );
};
