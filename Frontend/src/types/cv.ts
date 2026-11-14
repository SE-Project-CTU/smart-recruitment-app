// SmartHire CV & CV Version Type Definitions
// Ánh xạ 1:1 với Backend C# DTOs và Enums trong SmartHire.Application.Features.Cv

// ==========================================
// CV SNAPSHOT & LAYOUT VALUE OBJECTS
// ==========================================

export interface CvDocumentMetadata {
  version: string;
  templateCode: string;
  language: string;
  updatedAt: string;
}

export interface CvProfile {
  fullName: string;
  title: string;
  avatarUrl: string;
  email: string;
  phone: string;
  dob?: string;
  address?: string;
  website?: string;
  socialLink?: string;
}

export interface CvContentDocument {
  metadata?: CvDocumentMetadata;
  profile?: CvProfile;
  sections?: Record<string, unknown>;
}

export type CVSectionKey =
  | "objective"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "awards"
  | "interests"
  | "additionalInfo";

export interface CvLayoutArea {
  id: string;
  sections: CVSectionKey[] | string[];
}

export interface CvLayoutDocument {
  version: string;
  areas: CvLayoutArea[];
}

export type CVLayoutArea = CvLayoutArea;
export type CVLayoutDocument = CvLayoutDocument;

export interface CvGlobalStyle {
  fontFamily: string;
  baseFontSize: number;
  primaryColor: string[];
  lineHeight: number;
}

export interface CvFieldStyle {
  color: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  textDecoration: string;
  textAlign?: string | null;
  listStyle?: string | null;
}

export interface CvPresentationStyles {
  global?: CvGlobalStyle;
  fields?: Record<string, CvFieldStyle>;
}

export interface CvPresentationDocument {
  metadata?: {
    version: string;
    templateCode: string;
    updatedAt: string;
  };
  styles?: CvPresentationStyles;
}

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

// ==========================================
// REQUEST / PAYLOAD DTOS
// ==========================================

export interface CreateCvPayload {
  templateId: string;
  title: string;
  language?: CvLanguage | "vi" | "en" | string;
}

export interface UpdateCvPayload {
  title?: string;
  content?: RichTextCVContentDocument;
  layout?: CVLayoutDocument;
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

export type CvTiptapAttributeValue = string | number | boolean | null;

export interface CvTiptapMark {
  type: string;
  attrs?: Record<string, CvTiptapAttributeValue>;
}

export interface CvTiptapNode {
  type: string;
  text?: string;
  attrs?: Record<string, CvTiptapAttributeValue>;
  marks?: CvTiptapMark[];
  content?: CvTiptapNode[];
}

export interface CvDocumentAttrs extends Record<string, CvTiptapAttributeValue> {
  fontSize: number;
}

export interface CvTiptapDocument extends Omit<CvTiptapNode, "attrs"> {
  type: "doc";
  attrs: CvDocumentAttrs;
  content: CvTiptapNode[];
}

export interface CvDefaultStyle {
  fontFamily: string;
  fontScale: number;
  primaryColors: string[];
  lineHeight: number;
}

export type CvTemplateCode = "senior_harvard" | "sidebar_classic";

export interface CvTiptapDocumentMetadata {
  version: string;
  templateCode: CvTemplateCode;
  language: "vi" | "en";
  updatedAt?: string;
  defaultStyle: CvDefaultStyle;
}

export interface RichTextCVProfile {
  fullName: CvTiptapDocument;
  title: CvTiptapDocument;
  avatarUrl: string;
  email: CvTiptapDocument;
  phone: CvTiptapDocument;
  dob: CvTiptapDocument;
  address: CvTiptapDocument;
  website: CvTiptapDocument;
  socialLink: CvTiptapDocument;
}

export interface RichTextCVTextSection {
  title: CvTiptapDocument;
  visible: boolean;
  content: CvTiptapDocument;
}

export interface RichTextCVItemSection<TItem> {
  title: CvTiptapDocument;
  visible: boolean;
  items: TItem[];
}

export interface RichTextCVExperienceItem {
  id: string;
  company: CvTiptapDocument;
  position: CvTiptapDocument;
  startDate: CvTiptapDocument;
  endDate: CvTiptapDocument;
  description: CvTiptapDocument;
}

export interface RichTextCVEducationItem {
  id: string;
  school: CvTiptapDocument;
  title: CvTiptapDocument;
  start: CvTiptapDocument;
  end: CvTiptapDocument;
  details: CvTiptapDocument;
}

export interface RichTextCVSkillItem {
  id: string;
  name: CvTiptapDocument;
  description: CvTiptapDocument;
}

export interface RichTextCVProjectItem {
  id: string;
  projectName: CvTiptapDocument;
  role: CvTiptapDocument;
  start: CvTiptapDocument;
  end: CvTiptapDocument;
  description: CvTiptapDocument;
}

export interface RichTextCVCertificationItem {
  id: string;
  name: CvTiptapDocument;
  issueDate: CvTiptapDocument;
}

export interface RichTextCVAwardItem {
  id: string;
  awardName: CvTiptapDocument;
  date: CvTiptapDocument;
}

export interface RichTextCVSections {
  objective: RichTextCVTextSection;
  experience: RichTextCVItemSection<RichTextCVExperienceItem>;
  education: RichTextCVItemSection<RichTextCVEducationItem>;
  skills: RichTextCVItemSection<RichTextCVSkillItem>;
  projects: RichTextCVItemSection<RichTextCVProjectItem>;
  certifications: RichTextCVItemSection<RichTextCVCertificationItem>;
  awards: RichTextCVItemSection<RichTextCVAwardItem>;
  interests: RichTextCVTextSection;
  additionalInfo: RichTextCVTextSection;
}

export interface RichTextCVContentDocument {
  metadata: CvTiptapDocumentMetadata;
  profile: RichTextCVProfile;
  sections: RichTextCVSections;
}

export interface RichTextCVDetail {
  id: string;
  candidateId: string;
  templateId: string;
  template: CVTemplateSummary;
  title: string;
  content: RichTextCVContentDocument;
  layout: CVLayoutDocument;
  language: "vi" | "en";
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  previewFile?: CVPreviewFile | null;
}

export interface CVTemplateDetail extends CVTemplateItem {
  defaultLayout: CVLayoutDocument;
  defaultContent: RichTextCVContentDocument;
}

export interface CVVersionDetail {
  id: string;
  cvId: string;
  templateId: string;
  content: RichTextCVContentDocument;
  layout: CVLayoutDocument;
  language: "vi" | "en";
  versionNumber: number;
  createdAt: string;
}
