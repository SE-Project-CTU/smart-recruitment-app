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
  url: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface CreateCvPayload {
  templateId: string;
  title: string;
  language?: "vi" | "en" | string;
}

export interface UpdateCvPayload {
  title?: string;
  content?: RichTextCVContentDocument;
  layout?: CVLayoutDocument;
  isPublic?: boolean;
  language?: "vi" | "en" | string;
  previewFileId?: string;
}

export interface CVVersionItem {
  id: string;
  cvId: string;
  versionNumber: number;
  language: string;
  createdAt: string;
}

export interface CvFilterParams {
  page?: number;
  pageSize?: number;
  isPublic?: boolean;
  language?: string;
  search?: string;
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

export interface CVLayoutArea {
  id: string;
  sections: CVSectionKey[] | string[];
}

export interface CVLayoutDocument {
  version: string;
  areas: CVLayoutArea[];
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

export interface CvTiptapDocument extends CvTiptapNode {
  type: "doc";
  content: CvTiptapNode[];
}

export interface CvDefaultStyle {
  fontFamily: string;
  fontScale: number;
  primaryColors: string[];
  lineHeight: number;
}

export type CvTemplateCode = "modern_two_column";

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
  order: CVSectionKey[];
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
