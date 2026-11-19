/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from "react";
import type {
  TargetJobOption,
  CvSectionSuggestion,
  CanonicalSectionType,
} from "../components/assistant/types";
import { prepareCvSectionsForEnhanceBatch } from "../utils/cvAssistantHelpers";
import { useEnhanceCvBatch } from "@/hooks/queries/useAi";
import { getApiErrorMessage } from "@/api/errorHandler";
import { useCvHighlightStore } from "@/stores/cvHighlightStore";
import type { ApiResponse } from "@/types";
import type { EnhanceCvBatchResult } from "@/types/ai";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";

export type GenerateFailureReason = "NO_JOB" | "NO_SECTIONS" | "API_ERROR";

interface CvRewriteContextValue {
  selectedTargetJob: TargetJobOption | null;
  customPrompt: string;
  suggestions: CvSectionSuggestion[];
  isGenerating: boolean;
  hasGenerated: boolean;
  isError: boolean;
  errorMessage: string | null;
  activeSuggestionSectionKey: string | null;
  openSuggestionForSection: (sectionKey: string) => void;
  closeFloatingSuggestion: () => void;
  getSuggestionForSection: (sectionKey: string) => CvSectionSuggestion | undefined;
  setSelectedTargetJob: (job: TargetJobOption | null) => void;
  setCustomPrompt: (value: string) => void;
  generateSuggestions: (
    values?: Partial<RichTextCvEditorValues> | null,
  ) => Promise<{ success: boolean; reason?: GenerateFailureReason; sectionCount?: number }>;
  dismissSuggestion: (suggestionId: string) => void;
  regenerateAll: (
    values?: Partial<RichTextCvEditorValues> | null,
  ) => Promise<void>;
  clearSuggestions: () => void;
}

export const DEFAULT_CV_REWRITE_CONTEXT_VALUE: CvRewriteContextValue = {
  selectedTargetJob: null,
  customPrompt: "",
  suggestions: [],
  isGenerating: false,
  hasGenerated: false,
  isError: false,
  errorMessage: null,
  activeSuggestionSectionKey: null,
  openSuggestionForSection: () => {},
  closeFloatingSuggestion: () => {},
  getSuggestionForSection: () => undefined,
  setSelectedTargetJob: () => {},
  setCustomPrompt: () => {},
  generateSuggestions: async () => ({ success: false, reason: "NO_JOB" }),
  dismissSuggestion: () => {},
  regenerateAll: async () => {},
  clearSuggestions: () => {},
};

const CvRewriteContext = createContext<CvRewriteContextValue>(
  DEFAULT_CV_REWRITE_CONTEXT_VALUE,
);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const CvRewriteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedTargetJob, setSelectedTargetJob] =
    useState<TargetJobOption | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [suggestions, setSuggestions] = useState<CvSectionSuggestion[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const activeSuggestionSectionKey = useCvHighlightStore(
    (s) => s.highlightSectionKey,
  );
  const setHighlightSectionKey = useCvHighlightStore(
    (s) => s.setHighlightSectionKey,
  );
  const clearHighlight = useCvHighlightStore((s) => s.clearHighlight);

  const enhanceBatchMutation = useEnhanceCvBatch();

  const openSuggestionForSection = useCallback((sectionKey: string) => {
    setHighlightSectionKey(sectionKey);
  }, [setHighlightSectionKey]);

  const closeFloatingSuggestion = useCallback(() => {
    clearHighlight();
  }, [clearHighlight]);

  const getSuggestionForSection = useCallback(
    (sectionKey: string) => {
      const lower = sectionKey.toLowerCase();
      return suggestions.find(
        (s) => s.sectionKey.toLowerCase() === lower && s.status !== "dismissed",
      );
    },
    [suggestions],
  );

  const executeEnhanceBatch = useCallback(
    async (values?: Partial<RichTextCvEditorValues> | null) => {
      clearHighlight();
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
          customPrompt: customPrompt.trim() || undefined,
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
            const preparedSection = preparedSections.find(
              (section) => section.sectionType.toLowerCase() === sectionKey,
            );

            return {
              id: `sug-${sectionKey}-${Date.now()}-${idx}`,
              sectionType: canonicalType,
              sectionKey,
              sectionTitle: preparedSection?.sectionTitle || item.sectionType || "Mục CV",
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
    [selectedTargetJob, customPrompt, enhanceBatchMutation],
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

  const dismissSuggestion = useCallback(
    (suggestionId: string) => {
      setSuggestions((prev) =>
        prev.map((s) =>
          s.id === suggestionId ? { ...s, status: "dismissed" as const } : s,
        ),
      );
      // Tự động đóng bảng so sánh nếu suggestion đang mở bị dismiss
      const currentActiveKey =
        useCvHighlightStore.getState().highlightSectionKey;
      if (currentActiveKey) {
        const target = suggestions.find((s) => s.id === suggestionId);
        if (
          target &&
          target.sectionKey.toLowerCase() === currentActiveKey.toLowerCase()
        ) {
          clearHighlight();
        }
      }
    },
    [suggestions, clearHighlight],
  );

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setHasGenerated(false);
    clearHighlight();
  }, [clearHighlight]);

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
        customPrompt,
        suggestions,
        isGenerating: enhanceBatchMutation.isPending,
        hasGenerated,
        isError: enhanceBatchMutation.isError,
        errorMessage,
        activeSuggestionSectionKey,
        openSuggestionForSection,
        closeFloatingSuggestion,
        getSuggestionForSection,
        setSelectedTargetJob,
        setCustomPrompt,
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
  return context ?? DEFAULT_CV_REWRITE_CONTEXT_VALUE;
}

export function useOptionalCvRewriteContext(): CvRewriteContextValue | null {
  return useContext(CvRewriteContext);
}
