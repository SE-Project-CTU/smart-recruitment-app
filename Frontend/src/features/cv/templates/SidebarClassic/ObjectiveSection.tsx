import React from "react";
import type { RichTextCVTextSection } from "@/types/cv";
import { MainSectionTitle } from "./SectionTitle";
import type { CvFieldRenderer } from "../types";

interface ObjectiveSectionProps {
  section: RichTextCVTextSection;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const ObjectiveSection = React.memo<ObjectiveSectionProps>(({
  section,
  primaryColor = "#262626",
  isReadOnly = false,
  renderField,
}) => {
  if (!section.visible) return null;

  return (
    <section className="section-objective group relative mb-5">
      <MainSectionTitle
        placeholder="MỤC TIÊU NGHỀ NGHIỆP"
        fieldName="content.sections.objective.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="text-xs text-slate-800 leading-relaxed min-h-4 px-1">
        {renderField({
          name: "content.sections.objective.content",
          document: section.content,
          placeholder: "Mô tả mục tiêu nghề nghiệp, định hướng phát triển...",
          multiline: true,
          isReadOnly,
        })}
      </div>
    </section>
  );
});

ObjectiveSection.displayName = "ObjectiveSection";
