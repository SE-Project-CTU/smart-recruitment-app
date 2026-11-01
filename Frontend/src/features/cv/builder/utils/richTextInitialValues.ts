import type { RichTextCVDetail, CVLayoutDocument } from "@/types/cv";
import {
  FIXED_SECTION_KEYS,
  type RichTextCvEditorValues,
} from "../schema/richTextCvSchema";
import { normalizeCvContentFontSizes } from "./tiptapJson";

/**
 * Đảm bảo layout luôn đầy đủ, hợp lệ và chứa đủ tất cả các fixed sections
 */
export function ensureValidLayout(
  layout?: CVLayoutDocument,
  fallbackOrder?: string[],
): CVLayoutDocument {
  const defaultOrder = (
    fallbackOrder?.length ? fallbackOrder : FIXED_SECTION_KEYS
  ) as string[];

  if (!layout || !layout.areas || layout.areas.length === 0) {
    return {
      version: layout?.version || "1.0",
      areas: [
        {
          id: "main",
          sections: [...defaultOrder],
        },
      ],
    };
  }

  const resultAreas = layout.areas.map((area) => ({
    ...area,
    sections: [...(area.sections || [])],
  }));

  const placedSections = new Set<string>();
  resultAreas.forEach((area) => {
    area.sections.forEach((s) => placedSections.add(s));
  });

  const missingSections = FIXED_SECTION_KEYS.filter(
    (key) => !placedSections.has(key),
  );

  if (missingSections.length > 0) {
    const targetArea = resultAreas.find((a) => a.id === "main");
    if (targetArea) {
      targetArea.sections.push(...missingSections);
    }
  }

  return {
    version: layout.version || "1.0",
    areas: resultAreas,
  };
}

export function buildRichTextCvInitialValues(
  detail: RichTextCVDetail,
): RichTextCvEditorValues {
  const content = structuredClone(detail.content);
  normalizeCvContentFontSizes(content);

  const rawOrder = (content.sections as { order?: string[] })?.order;
  const layout = ensureValidLayout(detail.layout, rawOrder);

  return {
    templateId: detail.templateId,
    title: detail.title,
    language: detail.language === "en" ? "en" : "vi",
    isPublic: detail.isPublic,
    content,
    layout: layout as RichTextCvEditorValues["layout"],
  };
}
