// SmartHire CV & CV Version Type Definitions
// Ánh xạ 1:1 với Backend C# DTOs và Enums trong SmartHire.Application.Features.Cv

import type {
  CvContentDocument,
  CvLayoutDocument,
  CvPresentationDocument,
} from "./application";

// ==========================================
// ENUMS & SUB-MODELS
// ==========================================

export type CvLanguage = "Vietnamese" | "English" | "vi" | "en" | string;

export interface CvTemplateSummaryResult {
  id: string;
  code: string;
  name: string;
}

export type CVTemplateSummary = CvTemplateSummaryResult;

export interface CvPreviewFileResult {
  id: string;
  url: string;
  fileUrl?: string; // Tương thích ngược với frontend component cũ
}

export type CVPreviewFile = CvPreviewFileResult;

export interface CVTemplateItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  thumbnailUrl?: string;
  version?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ==========================================
// CORE CV DTOS (Ánh xạ 1:1 C# DTOs)
// ==========================================

/**
 * Item trong danh sách CV của Candidate (Ánh xạ 1:1 CvListItemResult từ GET /api/v1/cvs)
 */
export interface CvListItemResult {
  id: string;
  candidateId: string;
  templateId: string;
  template: CvTemplateSummaryResult;
  title: string;
  language: CvLanguage;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  previewFile?: CvPreviewFileResult | null;
  thumbnailUrl?: string; // Compatibility
}

export type CVItem = CvListItemResult;
export type CvListItem = CvListItemResult;

/**
 * Chi tiết CV đầy đủ (Ánh xạ 1:1 CvResult từ GET /api/v1/cvs/{id} và POST /api/v1/cvs)
 */
export interface CvResult {
  id: string;
  candidateId: string;
  templateId: string;
  template: CvTemplateSummaryResult;
  title: string;
  content: CvContentDocument;
  layout: CvLayoutDocument;
  presentation: CvPresentationDocument;
  language: CvLanguage;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  previewFile?: CvPreviewFileResult | null;
}

export type CvDetail = CvResult;

// ==========================================
// CORE CV VERSION DTOS (Ánh xạ 1:1 C# DTOs)
// ==========================================

/**
 * Tóm tắt Version trong danh sách version (Ánh xạ 1:1 CvVersionSummaryResult từ GET /api/v1/cvs/{id}/versions)
 */
export interface CvVersionSummaryResult {
  id: string;
  cvId: string;
  versionNumber: number;
  language: CvLanguage;
  createdAt: string;
  title?: string; // Compatibility
}

export type CVVersionItem = CvVersionSummaryResult;
export type CvVersionSummary = CvVersionSummaryResult;

/**
 * Snapshot chi tiết của một Version (Ánh xạ 1:1 CvVersionResult từ GET /api/v1/cvs/{id}/versions/{versionId})
 */
export interface CvVersionResult {
  id: string;
  cvId: string;
  templateId: string;
  content: CvContentDocument;
  layout: CvLayoutDocument;
  presentation: CvPresentationDocument;
  language: CvLanguage;
  versionNumber: number;
  createdAt: string;
}

export type CvVersionDetail = CvVersionResult;
export type CvVersion = CvVersionResult;
export type CVVersion = CvVersionResult;
export type CvVersionItem = CvVersionSummaryResult;

// ==========================================
// REQUEST / PAYLOAD DTOS
// ==========================================

export interface CreateCvPayload {
  templateId: string;
  title: string;
  language?: CvLanguage;
}

export interface UpdateCvPayload {
  title?: string;
  isPublic?: boolean;
  language?: CvLanguage;
  previewFileId?: string;
}

export interface CvFilterParams {
  page?: number;
  pageSize?: number;
  isPublic?: boolean;
  language?: string;
  search?: string;
}
