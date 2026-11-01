import type { ReactNode } from "react";
import type {
  CvTiptapDocument,
  RichTextCVContentDocument,
  CVLayoutDocument,
} from "@/types/cv";
import type { FixedSectionKey } from "../types";

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

/**
 * Props chuẩn hóa truyền vào từng Template CV:
 * layout và content được cung cấp tường minh làm nguồn dữ liệu duy nhất.
 */
export interface CvTemplateProps {
  content: RichTextCVContentDocument;
  layout: CVLayoutDocument;
  renderField?: CvFieldRenderer;
  isReadOnly?: boolean;
  className?: string;
  sectionEditors?: CvSectionEditorsMap;
  onReorderAreaSections?: (areaId: string, newSections: string[]) => void;
  onMoveSectionToArea?: (sectionKey: string, targetAreaId: string) => void;
  onMoveSectionBetweenAreas?: (
    sourceAreaId: string,
    destAreaId: string,
    sourceIndex: number,
    destIndex: number,
  ) => void;
  onReorderSections?: (newOrder: string[]) => void;
  onToggleSectionVisibility?: (key: FixedSectionKey) => void;
}
