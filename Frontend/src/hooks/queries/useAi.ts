import { useMutation } from "@tanstack/react-query";
import { aiService } from "@/services/aiService";
import type {
  EnhanceCvBatchPayload,
  EnhanceCvBatchResult,
  MatchAnalysisPayload,
  MatchAnalysisResult,
  RealtimeRecommendedJobDto,
  RerankJobsRealtimePayload,
} from "@/types/ai";

/**
 * Hook Mutation: Xếp hạng và gợi ý việc làm thời gian thực dựa trên nội dung CV (API POST /api/v1/ai/jobs/rerank)
 */
export const useRerankJobsRealtime = () => {
  return useMutation<RealtimeRecommendedJobDto[], unknown, RerankJobsRealtimePayload>({
    mutationKey: ["ai", "jobs", "rerank"],
    mutationFn: (payload) => aiService.rerankJobsRealtime(payload),
  });
};

/**
 * Hook Mutation: Tối ưu hóa đồng thời toàn bộ các mục CV qua Gemini AI (API POST /api/v1/ai/cv/enhance/batch)
 */
export const useEnhanceCvBatch = () => {
  return useMutation<EnhanceCvBatchResult, unknown, EnhanceCvBatchPayload>({
    mutationKey: ["ai", "cv", "enhance-batch"],
    mutationFn: (payload) => aiService.enhanceCvBatch(payload),
  });
};

/**
 * Hook Mutation: Phân tích & chấm điểm độ phù hợp giữa CV và Job mục tiêu (API POST /api/v1/ai/match-analysis)
 */
export const useMatchAnalysis = () => {
  return useMutation<MatchAnalysisResult, unknown, MatchAnalysisPayload>({
    mutationKey: ["ai", "match-analysis"],
    mutationFn: (payload) => aiService.matchAnalysis(payload),
  });
};
