import React from "react";
import type { RichTextCVTextSection } from "@/types/cv";
import { SectionTitle } from "./SectionTitle";
import type { CvFieldRenderer } from "../types";

export interface InterestsSectionProps {
  section: RichTextCVTextSection;
  primaryColor?: string;
  bannerBgColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const InterestsSection: React.FC<InterestsSectionProps> = React.memo(({
  section,
  primaryColor,
  bannerBgColor,
  isReadOnly = false,
  renderField,
}) => {
  if (section.visible === false) return null;

  return (
    <section className="section-interests group relative mb-3 break-inside-avoid">
      <SectionTitle
        placeholder="SỞ THÍCH"
        fieldName="content.sections.interests.title"
        title={section.title}
        primaryColor={primaryColor}
        bannerBgColor={bannerBgColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="min-h-5 text-slate-700 px-1">
        {renderField({
          name: "content.sections.interests.content",
          document: section.content,
          placeholder: "Mô tả sở thích của bạn...",
          multiline: true,
          isReadOnly,
        })}
      </div>
    </section>
  );
});

InterestsSection.displayName = "InterestsSection";
