import type { CvFieldRenderer, SectionItemEditorActions } from "../types";

export interface MinimalistCvSectionProps<TSection> {
  section: TSection;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
  actions?: SectionItemEditorActions;
}
