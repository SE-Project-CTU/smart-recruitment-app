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
