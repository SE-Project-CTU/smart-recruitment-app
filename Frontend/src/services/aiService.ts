import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { ApiResponse } from "@/types";
import type {
  RealtimeRecommendedJobDto,
  RerankJobsRealtimePayload,
} from "@/types/ai";

export const aiService = {
  /**
   * Chấm điểm và xếp hạng việc làm thời gian thực dựa trên nội dung CV
   * POST /api/v1/ai/jobs/rerank
   */
  async rerankJobsRealtime(
    payload: RerankJobsRealtimePayload,
  ): Promise<RealtimeRecommendedJobDto[]> {
    const response = await axiosClient.post<
      ApiResponse<RealtimeRecommendedJobDto[]>
    >(API_ENDPOINTS.AI.RERANK_JOBS, payload);
    return response.data.data;
  },
};
