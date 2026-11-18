/**
 * Contract kiểu dữ liệu cho các tính năng AI Assistant của SmartHire
 */

export interface RerankJobsRealtimePayload {
  cvText?: string | null;
  cvId?: string | null;
  cvVersionId?: string | null;
  limit?: number | null;
}

export interface RealtimeRecommendedJobDto {
  id: string;
  title: string;
  companyName: string;
  logoUrl?: string | null;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryText: string;
  requirements: string;
  score: number;
}

export interface CvSectionBatchInputDto {
  sectionType: string;
  content: string;
}

export interface EnhanceCvBatchPayload {
  sections: CvSectionBatchInputDto[];
  cvId?: string | null;
  cvVersionId?: string | null;
  targetJobId?: string | null;
  targetJobTitle?: string | null;
  targetJobDescription?: string | null;
  customPrompt?: string | null;
  language?: string | null;
}

export interface EnhanceCvBatchItemResult {
  sectionType: string;
  originalContent: string;
  enhancedContent: string;
  improvements: string[];
  additionalSuggestions: string[];
}

export interface EnhanceCvBatchResult {
  sections: EnhanceCvBatchItemResult[];
}

/**
 * Payload yêu cầu phân tích & chấm điểm độ phù hợp CV - JD
 * POST /api/v1/ai/match-analysis
 */
export interface MatchAnalysisPayload {
  cvId?: string | null;
  cvVersionId?: string | null;
  jobId?: string | null;
  cvText?: string | null;
  jobText?: string | null;
}

/**
 * Kết quả phân tích độ phù hợp giữa CV và JD từ AI
 */
export interface MatchAnalysisResult {
  score: number;
  summary: string;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  recommendations: string[];
}
