import React, { createContext, useContext, useState, useCallback } from "react";
import type {
  TargetJobOption,
  CvSectionSuggestion,
  CanonicalSectionType,
} from "../components/assistant/types";
import { SECTION_TYPE_MAP } from "../components/assistant/types";
import { prepareCvSectionsForEnhanceBatch } from "../utils/cvAssistantHelpers";
import { useEnhanceCvBatch } from "@/hooks/queries/useAi";
import { getApiErrorMessage } from "@/api/errorHandler";
import type { ApiResponse } from "@/types";
import type { EnhanceCvBatchResult } from "@/types/ai";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";

export type GenerateFailureReason = "NO_JOB" | "NO_SECTIONS" | "API_ERROR";

interface CvRewriteContextValue {
  selectedTargetJob: TargetJobOption | null;
  suggestions: CvSectionSuggestion[];
  isGenerating: boolean;
  hasGenerated: boolean;
  isError: boolean;
  errorMessage: string | null;
  setSelectedTargetJob: (job: TargetJobOption | null) => void;
  generateSuggestions: (
    values?: Partial<RichTextCvEditorValues> | null,
  ) => Promise<{ success: boolean; reason?: GenerateFailureReason; sectionCount?: number }>;
  dismissSuggestion: (suggestionId: string) => void;
  regenerateAll: (
    values?: Partial<RichTextCvEditorValues> | null,
  ) => Promise<void>;
  clearSuggestions: () => void;
}

const CvRewriteContext = createContext<CvRewriteContextValue | null>(null);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const CvRewriteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedTargetJob, setSelectedTargetJob] =
    useState<TargetJobOption | null>(null);
  const [suggestions, setSuggestions] = useState<CvSectionSuggestion[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  const enhanceBatchMutation = useEnhanceCvBatch();

  const executeEnhanceBatch = useCallback(
    async (values?: Partial<RichTextCvEditorValues> | null) => {
      if (!selectedTargetJob) {
        return { success: false, reason: "NO_JOB" as GenerateFailureReason };
      }

      const preparedSections = prepareCvSectionsForEnhanceBatch(values);
      if (preparedSections.length === 0) {
        return { success: false, reason: "NO_SECTIONS" as GenerateFailureReason };
      }

      // Xây dựng mô tả ngữ cảnh từ Job mục tiêu
      const jobDescriptionParts = [
        selectedTargetJob.description,
        selectedTargetJob.requirements?.length
          ? `Yêu cầu: ${selectedTargetJob.requirements.join("; ")}`
          : "",
        selectedTargetJob.skills?.length
          ? `Kỹ năng: ${selectedTargetJob.skills.join(", ")}`
          : "",
      ].filter(Boolean);

      const targetJobId =
        selectedTargetJob.id && UUID_REGEX.test(selectedTargetJob.id)
          ? selectedTargetJob.id
          : null;

      try {
        const response = await enhanceBatchMutation.mutateAsync({
          sections: preparedSections.map((s) => ({
            sectionType: s.sectionType,
            content: s.content,
          })),
          targetJobId,
          targetJobTitle: selectedTargetJob.title,
          targetJobDescription: jobDescriptionParts.join("\n"),
        });

        // Bóc tách an toàn dữ liệu từ response (hỗ trợ cả ApiResponse envelope và unwrapped result)
        const batchResult =
          (response as unknown as ApiResponse<EnhanceCvBatchResult>)?.data ??
          response;
        const sectionsList =
          batchResult?.sections ??
          (Array.isArray(batchResult) ? batchResult : []);

        // Ánh xạ kết quả trả về từ Gemini AI sang cấu trúc giao diện
        const mappedSuggestions: CvSectionSuggestion[] = sectionsList.map(
          (item, idx) => {
            const canonicalType = item.sectionType as CanonicalSectionType;
            const sectionKey = (item.sectionType || "").toLowerCase();
            const sectionInfo = SECTION_TYPE_MAP[sectionKey];

            return {
              id: `sug-${sectionKey}-${Date.now()}-${idx}`,
              sectionType: canonicalType,
              sectionKey,
              sectionTitle: sectionInfo?.label || item.sectionType || "Mục CV",
              originalText: item.originalContent,
              suggestedText: item.enhancedContent,
              status: "ready",
              reason: item.improvements?.join(" • ") || undefined,
              additionalSuggestions: item.additionalSuggestions ?? [],
            };
          },
        );

        setSuggestions(mappedSuggestions);
        setHasGenerated(true);

        return {
          success: true,
          sectionCount: mappedSuggestions.length,
        };
      } catch (err) {
        console.error("[CvRewriteContext] Lỗi gọi API enhance batch:", err);
        return {
          success: false,
          reason: "API_ERROR" as GenerateFailureReason,
        };
      }
    },
    [selectedTargetJob, enhanceBatchMutation],
  );

  const generateSuggestions = useCallback(
    async (values?: Partial<RichTextCvEditorValues> | null) => {
      return executeEnhanceBatch(values);
    },
    [executeEnhanceBatch],
  );

  const regenerateAll = useCallback(
    async (values?: Partial<RichTextCvEditorValues> | null) => {
      await executeEnhanceBatch(values);
    },
    [executeEnhanceBatch],
  );

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status: "dismissed" } : s)),
    );
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setHasGenerated(false);
  }, []);

  const errorMessage = enhanceBatchMutation.error
    ? getApiErrorMessage(
        enhanceBatchMutation.error,
        "Không thể tối ưu hóa nội dung CV lúc này. Dịch vụ AI đang bận, vui lòng thử lại.",
      )
    : null;

  return (
    <CvRewriteContext.Provider
      value={{
        selectedTargetJob,
        suggestions,
        isGenerating: enhanceBatchMutation.isPending,
        hasGenerated,
        isError: enhanceBatchMutation.isError,
        errorMessage,
        setSelectedTargetJob,
        generateSuggestions,
        dismissSuggestion,
        regenerateAll,
        clearSuggestions,
      }}
    >
      {children}
    </CvRewriteContext.Provider>
  );
};

export function useCvRewriteContext(): CvRewriteContextValue {
  const context = useContext(CvRewriteContext);
  if (!context) {
    throw new Error(
      "useCvRewriteContext phải được sử dụng bên trong CvRewriteProvider",
    );
  }
  return context;
}
