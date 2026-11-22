import React from "react";
import type { RichTextCVTextSection } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import type { CvFieldRenderer } from "../types";

interface ObjectiveSectionProps {
  section: RichTextCVTextSection;
  primaryColor?: string;
  bannerBgColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const ObjectiveSection: React.FC<ObjectiveSectionProps> = React.memo(({
  section,
  primaryColor,
  bannerBgColor,
  isReadOnly = false,
  renderField,
}) => {
  if (section.visible === false) return null;

  return (
    <div className="section-objective mb-3 group relative break-inside-avoid">
      <SectionTitle
        placeholder="MỤC TIÊU NGHỀ NGHIỆP"
        fieldName="content.sections.objective.title"
        title={section.title}
        primaryColor={primaryColor}
        bannerBgColor={bannerBgColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="min-h-5 text-slate-700 leading-relaxed text-justify px-1">
        {renderField({
          name: "content.sections.objective.content",
          document: section.content,
          placeholder: "Mô tả mục tiêu nghề nghiệp của bạn...",
          multiline: true,
          isReadOnly,
        })}
      </div>
    </div>
  );
});

ObjectiveSection.displayName = "ObjectiveSection";
