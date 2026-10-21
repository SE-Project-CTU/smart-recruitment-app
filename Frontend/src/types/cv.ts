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
