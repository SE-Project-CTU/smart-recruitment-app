import type { RichTextCVDetail } from "@/types/cv";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";
import { normalizeCvContentFontSizes } from "./tiptapJson";

export function buildRichTextCvInitialValues(
  detail: RichTextCVDetail,
): RichTextCvEditorValues {
  const content = structuredClone(detail.content);
  normalizeCvContentFontSizes(content);

  return {
    templateId: detail.templateId,
    title: detail.title,
    language: detail.language === "en" ? "en" : "vi",
    isPublic: detail.isPublic,
    content,
    layout: structuredClone(detail.layout) as RichTextCvEditorValues["layout"],
  };
}
