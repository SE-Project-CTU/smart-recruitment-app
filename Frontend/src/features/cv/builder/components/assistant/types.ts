/**
 * Định nghĩa các kiểu dữ liệu cho các tính năng Trợ lý AI trong CV Builder
 */

export type SuggestionStatus = "generating" | "ready" | "applied" | "dismissed";

export interface CvSectionSuggestion {
  id: string;
  sectionKey: "objective" | "experience" | "projects" | "awards" | "skills";
  sectionTitle: string;
  originalText: string;
  suggestedText: string;
  status: SuggestionStatus;
  reason?: string;
}

export interface SkillGapAnalysis {
  matchedSkills: string[];
  missingSkills: string[];
  systemWarning?: string;
}

export interface CvScoreHistoryItem {
  id: string;
  score: number;
  assessedAt: string;
  summary: string;
}

export interface CvScoreData {
  currentScore: number;
  summaryExplanation: string;
  matchedSkills: string[];
  missingSkills: string[];
  history?: CvScoreHistoryItem[]; // Chỉ hiển thị so sánh nếu có >= 2 lần chấm
}

export interface SuggestedJobItem {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location: string;
  salaryText: string;
  matchPercentage: number;
}
