import axiosClient from "@/api/axios";
import { API_ENDPOINTS } from "@/constants/apiEndpoints";
import type { ApiResponse } from "@/types";
import type {
  EnhanceCvBatchPayload,
  EnhanceCvBatchResult,
  MatchAnalysisPayload,
  MatchAnalysisResult,
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
      never,
      ApiResponse<RealtimeRecommendedJobDto[]> | RealtimeRecommendedJobDto[]
    >(API_ENDPOINTS.AI.RERANK_JOBS, payload);

    // axios interceptor đã unwrap response.data của AxiosResponse,
    // xử lý an toàn để lấy mảng data thực tế của API envelope
    const data =
      (response as ApiResponse<RealtimeRecommendedJobDto[]>)?.data ?? response;
    return (data as RealtimeRecommendedJobDto[]) || [];
  },

  /**
   * Tối ưu hóa đồng thời toàn bộ các mục CV (Batching trong 1 request duy nhất)
   * POST /api/v1/ai/cv/enhance/batch
   */
  async enhanceCvBatch(
    payload: EnhanceCvBatchPayload,
  ): Promise<EnhanceCvBatchResult> {
    const response = await axiosClient.post<
      never,
      ApiResponse<EnhanceCvBatchResult> | EnhanceCvBatchResult
    >(API_ENDPOINTS.AI.ENHANCE_CV_BATCH, payload);

    // axios interceptor đã unwrap response.data của AxiosResponse,
    // xử lý an toàn để lấy object EnhanceCvBatchResult thực tế
    const data =
      (response as ApiResponse<EnhanceCvBatchResult>)?.data ?? response;
    return data as EnhanceCvBatchResult;
  },

  /**
   * Phân tích và chấm điểm độ phù hợp giữa CV và Job mục tiêu
   * POST /api/v1/ai/match-analysis
   */
  async matchAnalysis(
    payload: MatchAnalysisPayload,
  ): Promise<MatchAnalysisResult> {
    const response = await axiosClient.post<
      never,
      ApiResponse<MatchAnalysisResult> | MatchAnalysisResult
    >(API_ENDPOINTS.AI.MATCH_ANALYSIS, payload);

    const data =
      (response as ApiResponse<MatchAnalysisResult>)?.data ?? response;
    return data as MatchAnalysisResult;
  },
};
