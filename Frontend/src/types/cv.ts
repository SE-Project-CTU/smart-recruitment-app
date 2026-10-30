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
  fileUrl?: string;
  url?: string;
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


export interface CVDocumentMetadata {
  version: string;
  templateCode: CvTemplateCode;
  language: "vi" | "en" | string;
  updatedAt: string;
}

export interface CVProfile {
  fullName: string;
  title: string;
  avatarUrl: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  website: string;
  socialLink: string;
}

export interface CVTextSection {
  title: string;
  visible: boolean;
  content: string;
}

export interface CVItemSection<TItem> {
  title: string;
  visible: boolean;
  items: TItem[];
}

export interface CVExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string | null;
  endDate: string | null;
  description: string;
}

export interface CVEducationItem {
  id: string;
  school: string;
  title: string;
  start: string | null;
  end: string | null;
  details: string;
}

export interface CVSkillItem {
  id: string;
  name: string;
  description: string;
}

export interface CVProjectItem {
  id: string;
  projectName: string;
  role: string;
  start: string | null;
  end: string | null;
  description: string;
}

export interface CVCertificationItem {
  id: string;
  name: string;
  issueDate: string | null;
}

export interface CVAwardItem {
  id: string;
  awardName: string;
  date: string | null;
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

export interface CVSections {
  order: CVSectionKey[] | string[];
  objective: CVTextSection;
  experience: CVItemSection<CVExperienceItem>;
  education: CVItemSection<CVEducationItem>;
  skills: CVItemSection<CVSkillItem>;
  projects: CVItemSection<CVProjectItem>;
  certifications: CVItemSection<CVCertificationItem>;
  awards: CVItemSection<CVAwardItem>;
  interests: CVTextSection;
  additionalInfo: CVTextSection;
}

export interface CVContentDocument {
  metadata: CVDocumentMetadata;
  profile: CVProfile;
  sections: CVSections;
}

export interface CVLayoutArea {
  id: string;
  sections: CVSectionKey[] | string[];
}

export interface CVLayoutDocument {
  version: string;
  areas: CVLayoutArea[];
}

export interface CVGlobalStyle {
  fontFamily: string;
  baseFontSize: number;
  primaryColor: string[];
  lineHeight: number;
}

export interface CVFieldStyle {
  color?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: "left" | "center" | "right" | "justify" | null;
  listStyle?: "disc" | "circle" | "square" | "decimal" | "none" | null;
}

export interface CVPresentationMetadata {
  version: string;
  templateCode: string;
  updatedAt: string;
}

export interface CVPresentationStyles {
  global: CVGlobalStyle;
  fields: Record<string, CVFieldStyle>;
}

export interface CVPresentationDocument {
  metadata: CVPresentationMetadata;
  styles: CVPresentationStyles;
}

export interface CVDetail {
  id: string;
  candidateId: string;
  templateId: string;
  template: CVTemplateSummary;
  title: string;
  content: CVContentDocument;
  layout: CVLayoutDocument;
  presentation: CVPresentationDocument;
  language: "vi" | "en" | string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
  previewFile?: CVPreviewFile | null;
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
  baseFontSize: number;
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
