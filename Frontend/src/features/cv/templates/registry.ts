import type { ComponentType } from "react";
import { ModernTwoColumnTemplate } from "./ModernTwoColumn";
import type { CvTemplateProps } from "./types";
import type { CvTemplateCode } from "@/types/cv";

export const TEMPLATE_REGISTRY: Record<
  CvTemplateCode,
  ComponentType<CvTemplateProps>
> = {
  modern_two_column: ModernTwoColumnTemplate,
};

export function getCvTemplateComponent(
  code?: string,
): ComponentType<CvTemplateProps> {
  return (
    TEMPLATE_REGISTRY[code as CvTemplateCode] ??
    TEMPLATE_REGISTRY.modern_two_column
  );
}
