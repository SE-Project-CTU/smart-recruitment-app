import React from "react";
import type { RichTextCVTextSection } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import type { CvFieldRenderer } from "../CvTemplateProps";

interface ObjectiveSectionProps {
  section: RichTextCVTextSection;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const ObjectiveSection: React.FC<ObjectiveSectionProps> = ({
  section,
  primaryColor,
  isReadOnly = false,
  renderField,
}) => {
  if (!section.visible) return null;

  return (
    <div className="section-objective mb-3 group relative">
      <SectionTitle
        placeholder="MỤC TIÊU NGHỀ NGHIỆP"
        fieldName="content.sections.objective.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="min-h-5 text-slate-700">
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
};
