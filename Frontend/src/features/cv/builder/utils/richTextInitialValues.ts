import type { RichTextCVDetail, CVLayoutDocument, CvTemplateCode } from "@/types/cv";
import { getCvTemplateMetadata } from "../../templates/templateMetadata";
import type { RichTextCvEditorValues } from "../schema/richTextCvSchema";
import { normalizeCvContentFontSizes } from "./tiptapJson";

/**
 * Đảm bảo layout luôn tồn tại cấu trúc cơ bản hợp lệ theo template code.
 * Nếu chưa có layout, tạo layout mặc định từ defaultLayout của template tương ứng.
 * Nếu layout đã có, giữ nguyên trạng để quy trình validation kiểm tra tính toàn vẹn,
 * tuyệt đối không tự ý nhét section thiếu vào 'main' để tránh làm sai lệch layout nhiều area.
 */
export function ensureValidLayout(
  layout?: CVLayoutDocument,
  templateCode?: CvTemplateCode | string,
): CVLayoutDocument {
  if (!layout || !layout.areas || layout.areas.length === 0) {
    const templateMeta = getCvTemplateMetadata(templateCode);
    return structuredClone(templateMeta.defaultLayout);
  }

  return {
    version: layout.version || "1.0",
    areas: layout.areas.map((area) => ({
      ...area,
      sections: [...(area.sections || [])],
    })),
  };
}

export function buildRichTextCvInitialValues(
  detail: RichTextCVDetail,
): RichTextCvEditorValues {
  const content = structuredClone(detail.content);
  normalizeCvContentFontSizes(content);

  const templateCode = detail.content?.metadata?.templateCode;
  const layout = ensureValidLayout(detail.layout, templateCode);

  return {
    templateId: detail.templateId,
    title: detail.title,
    language: detail.language === "en" ? "en" : "vi",
    isPublic: detail.isPublic,
    content,
    layout: layout as RichTextCvEditorValues["layout"],
  };
}
