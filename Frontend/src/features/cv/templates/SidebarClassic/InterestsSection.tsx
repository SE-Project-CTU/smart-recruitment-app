import React from "react";
import type { RichTextCVTextSection } from "@/types/cv";
import { SidebarSectionTitle } from "./SectionTitle";
import type { CvFieldRenderer } from "../types";

interface InterestsSectionProps {
  section: RichTextCVTextSection;
  primaryColor?: string;
  isReadOnly?: boolean;
  renderField: CvFieldRenderer;
}

export const InterestsSection = React.memo<InterestsSectionProps>(({
  section,
  primaryColor = "#262626",
  isReadOnly = false,
  renderField,
}) => {
  if (!section.visible) return null;

  return (
    <section className="section-interests group relative mb-4">
      <SidebarSectionTitle
        placeholder="SỞ THÍCH"
        fieldName="content.sections.interests.title"
        title={section.title}
        primaryColor={primaryColor}
        isReadOnly={isReadOnly}
        renderField={renderField}
      />
      <div className="text-xs text-slate-800 leading-relaxed min-h-4 px-1">
        {renderField({
          name: "content.sections.interests.content",
          document: section.content,
          placeholder: "Nhập sở thích cá nhân...",
          multiline: true,
          isReadOnly,
        })}
      </div>
    </section>
  );
});

InterestsSection.displayName = "InterestsSection";
