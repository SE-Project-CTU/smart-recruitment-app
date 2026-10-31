import type { ReactNode } from "react";
import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";
import type {
  CvTiptapDocument,
  RichTextCVContentDocument,
  RichTextCVDetail,
} from "@/types/cv";
import type { FixedSectionKey } from "@/features/cv-builder/types";

export type CvRenderData =
  | RichTextCvEditorValues
  | RichTextCVContentDocument
  | RichTextCVDetail
  | { content: RichTextCVContentDocument };

export interface CvFieldRenderProps {
  name: string;
  document?: CvTiptapDocument;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  isReadOnly?: boolean;
}

export type CvFieldRenderer = (props: CvFieldRenderProps) => ReactNode;

export interface SectionItemEditorActions {
  onAddAfter: (index: number) => void;
  onDelete: (index: number) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

export interface CvSectionEditorsMap {
  experience?: SectionItemEditorActions;
  education?: SectionItemEditorActions;
  skills?: SectionItemEditorActions;
  projects?: SectionItemEditorActions;
  certifications?: SectionItemEditorActions;
  awards?: SectionItemEditorActions;
}

export interface CvTemplateProps {
  data: CvRenderData;
  renderField?: CvFieldRenderer;
  isReadOnly?: boolean;
  className?: string;
  sectionEditors?: CvSectionEditorsMap;
  onReorderSections?: (newOrder: string[]) => void;
  onToggleSectionVisibility?: (key: FixedSectionKey) => void;
}
