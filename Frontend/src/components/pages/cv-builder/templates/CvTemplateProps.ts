import type { RichTextCvEditorValues } from "@/features/cv-builder/schema/richTextCvSchema";

export interface CvTemplateProps {
  className?: string;
  data?: RichTextCvEditorValues;
  isReadOnly?: boolean;
}
