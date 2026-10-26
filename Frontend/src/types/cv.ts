export interface CVTemplateSummary {
  id: string;
  code: string;
  name: string;
}

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

export interface CVPreviewFile {
  id: string;
  fileUrl: string;
}

export interface CVItem {
  id: string;
  candidateId?: string;
  title: string;
  templateId: string;
  template?: CVTemplateSummary;
  language: "vi" | "en" | string;
  isPublic: boolean;
  previewFile?: CVPreviewFile | null;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCvPayload {
  templateId: string;
  title: string;
  language: "vi" | "en" | string;
}

export interface UpdateCvPayload {
  title?: string;
  isPublic?: boolean;
  language?: "vi" | "en" | string;
  previewFileId?: string;
}

export interface CVVersionItem {
  id: string;
  cvId: string;
  versionNumber: number;
  title?: string;
  createdAt: string;
}

export interface CvFilterParams {
  page?: number;
  pageSize?: number;
  isPublic?: boolean;
  language?: string;
  search?: string;
}
