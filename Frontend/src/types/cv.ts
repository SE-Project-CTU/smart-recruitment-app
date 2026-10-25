export interface CVTemplateSummary {
  id: string;
  code: string;
  name: string;
}

export interface CVItem {
  id: string;
  title: string;
  templateId: string;
  template: CVTemplateSummary;
  language: "vi" | "en" | string;
  isPublic: boolean;
  candidateId: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl?: string;
}

export interface CVPreviewFile {
  id: string;
  url: string;
}

export interface CVDocumentMetadata {
  version: string;
  templateCode: string;
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
