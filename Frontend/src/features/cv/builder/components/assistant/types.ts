/**
 * Định nghĩa các kiểu dữ liệu cho các tính năng Trợ lý AI trong CV Builder
 */

export type CanonicalSectionType =
  | "TARGET_JOB"
  | "EXPERIENCE"
  | "PROJECTS"
  | "SKILLS"
  | "EDUCATION"
  | "OBJECTIVE"
  | "CERTIFICATIONS"
  | "AWARDS";

export const SECTION_TYPE_MAP: Record<
  string,
  { type: CanonicalSectionType; label: string }
> = {
  objective: { type: "OBJECTIVE", label: "Mục tiêu nghề nghiệp" },
  experience: { type: "EXPERIENCE", label: "Kinh nghiệm làm việc" },
  education: { type: "EDUCATION", label: "Học vấn" },
  skills: { type: "SKILLS", label: "Kỹ năng chuyên môn" },
  projects: { type: "PROJECTS", label: "Dự án tiêu biểu" },
  certifications: { type: "CERTIFICATIONS", label: "Chứng chỉ" },
  awards: { type: "AWARDS", label: "Giải thưởng" },
};

export interface TargetJobOption {
  id: string;
  title: string;
  companyName: string;
  companyLogoUrl?: string;
  location?: string;
  salaryText?: string;
  experienceLevel?: string;
  workMode?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  benefits?: string[];
  skills?: string[];
}

export interface PreparedCvSection {
  sectionType: CanonicalSectionType;
  sectionTitle: string;
  sectionKey: string;
  content: string;
}

export type SuggestionStatus = "generating" | "ready" | "applied" | "dismissed";

export interface CvSectionSuggestion {
  id: string;
  sectionType?: CanonicalSectionType;
  sectionKey: string;
  sectionTitle: string;
  originalText: string;
  suggestedText: string;
  status: SuggestionStatus;
  reason?: string;
  additionalSuggestions?: string[];
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
