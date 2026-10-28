import type { RichTextCVDetail } from "@/types/cv";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";

export function buildRichTextCvInitialValues(
  detail: RichTextCVDetail,
): RichTextCvEditorValues {
  return {
    templateId: detail.templateId,
    title: detail.title,
    language: detail.language === "en" ? "en" : "vi",
    isPublic: detail.isPublic,
    content: structuredClone(detail.content),
    layout: structuredClone(detail.layout) as RichTextCvEditorValues["layout"],
  };
}
