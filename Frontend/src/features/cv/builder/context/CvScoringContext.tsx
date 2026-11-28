import React, { createContext, useContext, useState, useCallback } from "react";
import type { TargetJobOption } from "../components/assistant/types";
import {
  convertCvFormToPlainText,
  isCvPlainTextEmpty,
} from "../utils/cvAssistantHelpers";
import { useMatchAnalysis } from "@/hooks/queries/useAi";
import { getApiErrorMessage } from "@/api/errorHandler";
import type { MatchAnalysisResult } from "@/types/ai";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";

export type ScoreFailureReason = "NO_JOB" | "EMPTY_CV" | "API_ERROR";

interface CvScoringContextValue {
  selectedTargetJob: TargetJobOption | null;
  matchResult: MatchAnalysisResult | null;
  isScoring: boolean;
  hasScored: boolean;
  isError: boolean;
  errorMessage: string | null;
  setSelectedTargetJob: (job: TargetJobOption | null) => void;
  scoreCv: (
    values?: Partial<RichTextCvEditorValues> | null,
  ) => Promise<{ success: boolean; reason?: ScoreFailureReason; score?: number }>;
  clearScore: () => void;
}

const CvScoringContext = createContext<CvScoringContextValue | null>(null);

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const CvScoringProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedTargetJob, setSelectedTargetJob] =
    useState<TargetJobOption | null>(null);
  const [matchResult, setMatchResult] = useState<MatchAnalysisResult | null>(
    null,
  );
  const [hasScored, setHasScored] = useState(false);

  const matchAnalysisMutation = useMatchAnalysis();

  const scoreCv = useCallback(
    async (values?: Partial<RichTextCvEditorValues> | null) => {
      if (!selectedTargetJob) {
        return { success: false, reason: "NO_JOB" as ScoreFailureReason };
      }

      // Trích xuất văn bản CV đầy đủ từ form hiện tại (kể cả thay đổi chưa lưu)
      const cvText = convertCvFormToPlainText(values);
      if (isCvPlainTextEmpty(cvText)) {
        return { success: false, reason: "EMPTY_CV" as ScoreFailureReason };
      }

      const jobId =
        selectedTargetJob.id && UUID_REGEX.test(selectedTargetJob.id)
          ? selectedTargetJob.id
          : null;

      // Xây dựng fallback jobText nếu Job không có UUID trong DB (ví dụ tin mẫu)
      const fallbackJobText = !jobId
        ? [
            `Chức danh: ${selectedTargetJob.title}`,
            `Công ty: ${selectedTargetJob.companyName}`,
            selectedTargetJob.description,
            selectedTargetJob.requirements?.length
              ? `Yêu cầu:\n${selectedTargetJob.requirements.join("\n")}`
              : "",
            selectedTargetJob.skills?.length
              ? `Kỹ năng: ${selectedTargetJob.skills.join(", ")}`
              : "",
          ]
            .filter(Boolean)
            .join("\n\n")
        : null;

      try {
        const result = await matchAnalysisMutation.mutateAsync({
          jobId,
          cvText,
          jobText: fallbackJobText,
        });

        setMatchResult(result);
        setHasScored(true);

        return {
          success: true,
          score: result.score,
        };
      } catch (err) {
        console.error("[CvScoringContext] Lỗi gọi API match-analysis:", err);
        return {
          success: false,
          reason: "API_ERROR" as ScoreFailureReason,
        };
      }
    },
    [selectedTargetJob, matchAnalysisMutation],
  );

  const clearScore = useCallback(() => {
    setMatchResult(null);
    setHasScored(false);
  }, []);

  const errorMessage = matchAnalysisMutation.error
    ? getApiErrorMessage(
        matchAnalysisMutation.error,
        "Không thể chấm điểm CV lúc này. Dịch vụ AI đang bận, vui lòng thử lại.",
      )
    : null;

  return (
    <CvScoringContext.Provider
      value={{
        selectedTargetJob,
        matchResult,
        isScoring: matchAnalysisMutation.isPending,
        hasScored,
        isError: matchAnalysisMutation.isError,
        errorMessage,
        setSelectedTargetJob,
        scoreCv,
        clearScore,
      }}
    >
      {children}
    </CvScoringContext.Provider>
  );
};

export function useCvScoringContext(): CvScoringContextValue {
  const context = useContext(CvScoringContext);
  if (!context) {
    throw new Error(
      "useCvScoringContext phải được sử dụng bên trong CvScoringProvider",
    );
  }
  return context;
}
