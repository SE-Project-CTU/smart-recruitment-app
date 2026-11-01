import type { ComponentType } from "react";
import { SeniorHarvardTemplate } from "./SeniorHarvard";
import type { CvTemplateProps } from "./types";
import type { CvTemplateCode } from "@/types/cv";
import {
  getCvTemplateMetadata,
  DEFAULT_TEMPLATE_CODE,
  type CvTemplateMetadata,
} from "./templateMetadata";

export {
  CV_TEMPLATE_METADATA,
  DEFAULT_TEMPLATE_CODE,
  getCvTemplateMetadata,
  validateCvLayout,
  type CvTemplateMetadata,
  type CvLayoutValidationResult,
} from "./templateMetadata";

export interface CvTemplateDefinition extends CvTemplateMetadata {
  component: ComponentType<CvTemplateProps>;
}

/**
 * Registry ánh xạ type-safe từ CvTemplateCode sang React view component.
 * Cấu trúc dữ liệu và quy tắc layout (area IDs, default layout) do CV_TEMPLATE_METADATA quản lý.
 */
export const TEMPLATE_REGISTRY: Record<
  CvTemplateCode,
  ComponentType<CvTemplateProps>
> = {
  senior_harvard: SeniorHarvardTemplate,
};

export function getCvTemplateComponent(
  code?: string,
): ComponentType<CvTemplateProps> {
  const meta = getCvTemplateMetadata(code);
  return (
    TEMPLATE_REGISTRY[meta.code] ??
    TEMPLATE_REGISTRY[DEFAULT_TEMPLATE_CODE]
  );
}

export function getCvTemplateDefinition(
  code?: string,
): CvTemplateDefinition {
  const meta = getCvTemplateMetadata(code);
  return {
    ...meta,
    component: getCvTemplateComponent(meta.code),
  };
}
