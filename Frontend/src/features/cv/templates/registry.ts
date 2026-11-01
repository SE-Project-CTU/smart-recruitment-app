import type { ComponentType } from "react";
import { SeniorHarvardTemplate } from "./SeniorHarvard";
import type { CvTemplateProps } from "./types";
import type { CvTemplateCode, CVLayoutDocument } from "@/types/cv";
import { FIXED_SECTION_KEYS } from "../builder/schema/richTextCvSchema";

export interface CvTemplateDefinition {
  code: CvTemplateCode;
  name: string;
  supportedAreaIds: readonly string[];
  component: ComponentType<CvTemplateProps>;
}

export const TEMPLATE_DEFINITIONS: Record<
  CvTemplateCode,
  CvTemplateDefinition
> = {
  senior_harvard: {
    code: "senior_harvard",
    name: "Senior Harvard",
    supportedAreaIds: ["main"] as const,
    component: SeniorHarvardTemplate,
  },
};

export const TEMPLATE_REGISTRY: Record<
  CvTemplateCode,
  ComponentType<CvTemplateProps>
> = {
  senior_harvard: SeniorHarvardTemplate,
};

export function getCvTemplateDefinition(code?: string): CvTemplateDefinition {
  return (
    TEMPLATE_DEFINITIONS[code as CvTemplateCode] ??
    TEMPLATE_DEFINITIONS.senior_harvard
  );
}

export function getCvTemplateComponent(
  code?: string,
): ComponentType<CvTemplateProps> {
  return getCvTemplateDefinition(code).component;
}

export interface CvLayoutValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Kiểm tra tính hợp lệ của layout theo quy tắc của template:
 * - Layout phải có areas
 * - Tất cả area ID phải nằm trong danh sách supportedAreaIds của template
 * - Không được có area ID trùng lặp
 * - Phải chứa area "main" bắt buộc
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

  const templateDef = getCvTemplateDefinition(templateCode);
  const supportedAreas = new Set(templateDef.supportedAreaIds);
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
        `Area ID '${area.id}' không được hỗ trợ bởi mẫu '${templateDef.name}' (${templateDef.code}). Các area hợp lệ là: [${templateDef.supportedAreaIds.join(", ")}].`,
      );
    }

    if (!area.sections || !Array.isArray(area.sections)) {
      errors.push(`Area '${area.id}' không có danh sách sections hợp lệ.`);
      continue;
    }

    const seenInArea = new Set<string>();
    for (const section of area.sections) {
      if (
        !FIXED_SECTION_KEYS.includes(
          section as (typeof FIXED_SECTION_KEYS)[number],
        )
      ) {
        errors.push(
          `Section '${section}' trong area '${area.id}' không phải section hợp lệ.`,
        );
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

  // Bắt buộc phải có area 'main'
  if (!seenAreaIds.has("main")) {
    errors.push("Layout bắt buộc phải có area với id là 'main'.");
  }

  // Kiểm tra thiếu section
  const missingSections = FIXED_SECTION_KEYS.filter(
    (sec) => !placedSections.has(sec),
  );
  if (missingSections.length > 0) {
    errors.push(`Layout còn thiếu các section: ${missingSections.join(", ")}.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
