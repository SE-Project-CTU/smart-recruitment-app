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
  language?: string | null;
}

export interface EnhanceCvBatchItemResult {
  sectionType: string;
  originalContent: string;
  enhancedContent: string;
  suggestedKeywords: string[];
  improvements: string[];
}

export interface EnhanceCvBatchResult {
  sections: EnhanceCvBatchItemResult[];
}
