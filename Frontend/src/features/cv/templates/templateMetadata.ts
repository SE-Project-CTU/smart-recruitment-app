import type { CvTemplateCode, CVLayoutDocument } from "@/types/cv";
import { FIXED_SECTION_KEYS } from "../constants/sections";

export interface CvTemplateMetadata {
  code: CvTemplateCode;
  name: string;
  supportedAreaIds: readonly string[];
  defaultLayout: CVLayoutDocument;
}

export const CV_TEMPLATE_METADATA: Record<CvTemplateCode, CvTemplateMetadata> = {
  senior_harvard: {
    code: "senior_harvard",
    name: "Senior Harvard",
    supportedAreaIds: ["main"] as const,
    defaultLayout: {
      version: "1.0",
      areas: [
        {
          id: "main",
          sections: [...FIXED_SECTION_KEYS],
        },
      ],
    },
  },
  sidebar_classic: {
    code: "sidebar_classic",
    name: "Sidebar Classic",
    supportedAreaIds: ["sidebar", "main"] as const,
    defaultLayout: {
      version: "1.0",
      areas: [
        {
          id: "sidebar",
          sections: ["education", "skills", "additionalInfo", "interests"],
        },
        {
          id: "main",
          sections: [
            "objective",
            "experience",
            "projects",
            "certifications",
            "awards",
          ],
        },
      ],
    },
  },
};

export const DEFAULT_TEMPLATE_CODE: CvTemplateCode = "senior_harvard";

export function getCvTemplateMetadata(code?: string): CvTemplateMetadata {
  return (
    CV_TEMPLATE_METADATA[code as CvTemplateCode] ??
    CV_TEMPLATE_METADATA[DEFAULT_TEMPLATE_CODE]
  );
}

export interface CvLayoutValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Kiểm tra tính hợp lệ của layout theo quy tắc của template:
 * - Layout phải có areas
 * - Tất cả area ID phải nằm trong danh sách supportedAreaIds của template
 * - Phải chứa ĐẦY ĐỦ mọi area ID được định nghĩa trong supportedAreaIds của template (không thiếu)
 * - Không được có area ID trùng lặp
 * - Mỗi section phải xuất hiện đúng 1 lần trong toàn bộ layout
 * - Không có section lạ, không thiếu section nào trong FIXED_SECTION_KEYS
 */
export function validateCvLayout(
  layout: CVLayoutDocument | undefined,
  templateCode?: string,
): CvLayoutValidationResult {
  const errors: string[] = [];

  if (!layout || !layout.areas || layout.areas.length === 0) {
    return {
      isValid: false,
      errors: ["Layout không chứa bất kỳ area nào."],
    };
  }

  const templateMeta = getCvTemplateMetadata(templateCode);
  const supportedAreas = new Set(templateMeta.supportedAreaIds);
  const seenAreaIds = new Set<string>();
  const placedSections = new Set<string>();

  for (const area of layout.areas) {
    if (!area.id || typeof area.id !== "string" || !area.id.trim()) {
      errors.push("Area ID không được để trống.");
      continue;
    }

    if (seenAreaIds.has(area.id)) {
      errors.push(`Area ID '${area.id}' bị trùng lặp trong layout.`);
      continue;
    }
    seenAreaIds.add(area.id);

    if (!supportedAreas.has(area.id)) {
      errors.push(
        `Area ID '${area.id}' không được hỗ trợ bởi mẫu '${templateMeta.name}' (${templateMeta.code}). Các area hợp lệ là: [${templateMeta.supportedAreaIds.join(", ")}].`,
      );
    }

    if (!area.sections || !Array.isArray(area.sections)) {
      errors.push(`Area '${area.id}' không có danh sách sections hợp lệ.`);
      continue;
    }

    const seenInArea = new Set<string>();
    for (const section of area.sections) {
      if (!FIXED_SECTION_KEYS.includes(section as (typeof FIXED_SECTION_KEYS)[number])) {
        errors.push(`Section '${section}' trong area '${area.id}' không phải section hợp lệ.`);
      }

      if (seenInArea.has(section)) {
        errors.push(`Section '${section}' bị lặp lại trong area '${area.id}'.`);
      }
      seenInArea.add(section);

      if (placedSections.has(section)) {
        errors.push(`Section '${section}' được gán ở nhiều area khác nhau.`);
      }
      placedSections.add(section);
    }
  }

  // Kiểm tra thiếu area ID bắt buộc của template
  const missingAreas = templateMeta.supportedAreaIds.filter(
    (areaId) => !seenAreaIds.has(areaId),
  );
  if (missingAreas.length > 0) {
    errors.push(
      `Layout còn thiếu các area bắt buộc cho mẫu '${templateMeta.name}': ${missingAreas.join(", ")}.`,
    );
  }

  // Kiểm tra thiếu section trong toàn bộ layout
  const missingSections = FIXED_SECTION_KEYS.filter(
    (sec) => !placedSections.has(sec),
  );
  if (missingSections.length > 0) {
    errors.push(
      `Layout còn thiếu các section: ${missingSections.join(", ")}.`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
