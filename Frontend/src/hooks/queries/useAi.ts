import { useMutation } from "@tanstack/react-query";
import { aiService } from "@/services/aiService";
import type {
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
